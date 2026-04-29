# Matching System — Test Guide

## Overview

The matching algorithm uses **weighted Jaccard similarity** plus **attribute boosts** and **randomization**:

```
Score = (interest_score + dorm_boost + year_boost + recency_boost + random_noise) * 0.85 + rand(0,0.15)
```

Where `interest_score = weighted_jaccard(interests) * 0.6` (max contribution 0.6).

---

## Quick Start

### 1. Run Python unit test (no server needed)

```bash
python src/tests/matching_algorithm_test.py
```

Tests core algorithm in isolation:

- Weighted Jaccard correctness
- Dorm boost (exact, complex, null handling)
- Recency boost (48h window)
- Randomization bounds
- All 6 integration scenarios

Expected output: `[OK] ALL TESTS PASSED!`

---

### 2. Run full integration test (requires server + DB)

```bash
# Terminal 1: start server
npm run start:dev

# Terminal 2: run tests
npx ts-node src/tests/matching.test.ts
```

This test:

- Creates 6 user accounts
- Creates profiles with specific attributes
- Calls `GET /matches` for each user
- Verifies scores fall in expected ranges
- Cleans up test data on exit

Expected: `6 passed, 0 failed`

---

### 3. Manual API testing (curl)

#### Step A — Register users

```bash
# Alice
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","email":"alice@test.com","password":"TestPass123!"}'

# Bob
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"bob","email":"bob@test.com","password":"TestPass123!"}'
```

#### Step B — Login to get tokens

```bash
ALICE_TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@test.com","password":"TestPass123!"}' | python -c "import sys,json; print(json.load(sys.stdin)['access_token'])")

echo $ALICE_TOKEN
```

#### Step C — Create profiles

```bash
# Alice's profile
curl -X POST http://localhost:3000/profile \
  -H "Authorization: Bearer $ALICE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice",
    "age": 20,
    "gender": "FEMALE",
    "seeking": "MALE",
    "college": "College of Computing",
    "major": "Computer Science",
    "year": 3,
    "dorm": "Stirling Hall",
    "interests": ["coding","hiking","chess","coffee"],
    "sameMajorOnly": false
  }'

# Bob's profile
curl -X POST http://localhost:3000/profile \
  -H "Authorization: Bearer $BOB_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Bob",
    "age": 21,
    "gender": "MALE",
    "seeking": "FEMALE",
    "college": "College of Computing",
    "major": "Computer Science",
    "year": 3,
    "dorm": "Stirling Hall",
    "interests": ["coding","hiking","music","gaming"],
    "sameMajorOnly": false
  }'
```

#### Step D — Get matches

```bash
curl -X GET "http://localhost:3000/matches?limit=10" \
  -H "Authorization: Bearer $ALICE_TOKEN" | python -m json.tool
```

Sample response:

```json
[
  {
    "id": "...",
    "userId": "...",
    "name": "Bob",
    "interests": ["coding", "hiking", "music", "gaming"],
    "major": "Computer Science",
    "dorm": "Stirling Hall",
    "year": 3,
    "matchScore": 0.7234,
    "scoreBreakdown": {
      "interestScore": 0.2243,
      "majorBoost": 0,
      "dormBoost": 0.15,
      "yearBoost": 0.05,
      "recencyBoost": 0.1,
      "randomFactor": 0.085
    }
  }
]
```

---

## What Gets Tested

### Algorithm correctness

- [x] Weighted Jaccard calculates correctly (test with identical, disjoint, partial)
- [x] Rare interests contribute more weight (`1/log(freq+1)`)
- [x] Same-major-only filter works (blocks non-matching majors)
- [x] Dorm boost: exact match +0.15, complex match +0.05, null → 0
- [x] Year boost: +0.05 if same year
- [x] Recency boost: +0.10 if active within 48h
- [x] Randomization: `score * 0.85 + rand(0,0.15)`
- [x] Minimum threshold filter (0.1) removes low scores

### System integration

- [x] Profile creation invalidates match cache
- [x] Cached scores retrieved from `match_scores` table
- [x] Frequency precomputation on startup (`MatchingService.onModuleInit`)
- [x] Indexed queries filter candidates (gender, major)
- [x] Parallel scoring of candidates

### Edge cases

- [x] User with no interests
- [x] Users with null dorm values
- [x] sameMajorOnly toggle ON/OFF
- [x] Different years, same major
- [x] Inactive users (>48h) no recency boost

---

## Test Matrix

| Test                               | Input                                               | Expected             | Pass |
| ---------------------------------- | --------------------------------------------------- | -------------------- | ---- |
| **Weighted Jaccard — Identical**   | `['a','b']` vs `['a','b']`                          | 1.0                  | ✅   |
| **Weighted Jaccard — Disjoint**    | `['a']` vs `['b']`                                  | 0.0                  | ✅   |
| **Weighted Jaccard — Partial**     | `['common','medium','rare']` vs `['common','rare']` | ~0.70                | ✅   |
| **High overlap**                   | Alice↔Bob (4+ shared, same dorm+year)               | 0.4–0.75             | ✅   |
| **Low overlap**                    | Alice↔Diana (0 shared, diff dorms)                  | 0.1–0.35             | ✅   |
| **Same-major toggle ON, match**    | Charlie↔Alice (both CS)                             | 0.08–0.35            | ✅   |
| **Same-major toggle ON, no match** | Charlie↔Dave (CS vs Math)                           | 0.0                  | ✅   |
| **Dorm complex**                   | Alice↔Charlie (Hall vs Tower)                       | 0.25–0.55 (+0.05)    | ✅   |
| **One user no dorm**               | Alice↔Frank (dorm null)                             | 0.25–0.55 (no boost) | ✅   |
| **Recency**                        | Bob↔Frank (recent)                                  | +0.10 boost          | ✅   |
| **Threshold**                      | All returned scores                                 | > 0.1                | ✅   |

---

## Files

```
src/
├── matching/
│   ├── matching.service.ts    # Core algorithm
│   ├── matching.controller.ts  # GET /matches, /matches/refresh
│   └── matching.module.ts
├── profile/
│   ├── profile.service.ts      # Invalidate cache on update
│   └── dto/create-profile.dto.ts  # sameMajorOnly field
├── tests/
│   ├── matching.test.ts         # Integration tests (TypeScript)
│   ├── verify-scores.ts         # DB inspection script
│   └── matching_algorithm_test.py  # Standalone Python tests
└── main.ts                        # Serves /uploads static files
```

---

## Database Schema

Key tables:

```sql
-- Profiles (adds matching attributes)
CREATE TABLE profiles (
  id TEXT PRIMARY KEY,
  userId TEXT UNIQUE,
  interests TEXT[],
  major TEXT,
  year INT,
  dorm TEXT,
  sameMajorOnly BOOLEAN DEFAULT false
);

-- Match scores cache
CREATE TABLE match_scores (
  id TEXT PRIMARY KEY,
  userAId TEXT,
  userBId TEXT,
  score FLOAT,
  interestScore FLOAT,
  dormBoost FLOAT,
  yearBoost FLOAT,
  recencyBoost FLOAT,
  randomFactor FLOAT,
  lastCalculated TIMESTAMP
);

-- Users (adds lastActive)
ALTER TABLE users ADD COLUMN lastActive TIMESTAMP DEFAULT NOW();
```

Indexes added on `major`, `year`, `dorm` for fast filtering.

---

## API Reference

| Endpoint           | Method | Auth | Description                        |
| ------------------ | ------ | ---- | ---------------------------------- |
| `/matches`         | GET    | JWT  | Get top N matches (cached)         |
| `/matches/refresh` | GET    | JWT  | Force recompute matches            |
| `/profile`         | POST   | JWT  | Create profile (invalidates cache) |
| `/profile`         | PUT    | JWT  | Update profile (invalidates cache) |

---

## Performance Notes

- Candidate pool limited to 500 users (configurable in `MatchingService.getMatches`)
- Scoring done in parallel (`Promise.all`)
- Frequencies precomputed on startup; refresh via `refreshFrequencies()` method (can be scheduled)
- Cache hit rate near 100% for repeat requests; invalidated on profile update

---

## Troubleshooting

**No matches returned**

- Check `match_scores` table has entries
- Verify profiles have `interests` array populated
- Ensure `lastActive` is set (recency boost helps but not required)

**Scores all 0**

- Check `sameMajorOnly` toggle; if ON and majors differ, score = 0
- Verify interests arrays are non-empty

**Photos not saving**

- Ensure `uploads/photos` directory exists at project root
- Check BASE_URL environment variable

**Build errors**

- Exclude `src/tests` from build (already in `tsconfig.build.json`)
- Test files use TypeScript features but are not compiled

---

## Next Steps

- Add cron job to refresh scores nightly for inactive users
- Add metrics: average match score, distribution
- Tune weights (interest 0.6, dorm 0.15, year 0.05, recency 0.10) based on engagement data
