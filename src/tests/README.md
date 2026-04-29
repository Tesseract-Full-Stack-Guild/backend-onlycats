# Matching System Tests

## Quick Start

### 1. Start the server

```bash
npm run start:dev
```

Server must be running on `http://localhost:3000`.

### 2. Run Python algorithm test (standalone, no server needed)

```bash
python src/tests/matching_algorithm_test.py
```

Tests the weighted Jaccard + boosts logic in pure Python.

### 3. Run TypeScript integration test (requires server)

```bash
npx ts-node src/tests/matching.test.ts
```

Full end-to-end test:

- Creates 6 test users
- Creates profiles with different attributes
- Calls `/matches` endpoint
- Validates scores and breakdowns
- Cleans up test data

### 4. Verify DB scores

```bash
npx ts-node src/tests/verify-scores.ts
```

Queries `match_scores` table and prints statistics.

---

## What Gets Tested

| Test                         | What it checks                                       |
| ---------------------------- | ---------------------------------------------------- |
| `algorithm.test.ts`          | Full API integration                                 |
| `matching_algorithm_test.py` | Weighted Jaccard, dorm boost, recency, randomization |
| `verify-scores.ts`           | DB state inspection                                  |

---

## Scenario Matrix

| #   | Scenario                                | Expected Score Range | Key Boost                 |
| --- | --------------------------------------- | -------------------- | ------------------------- |
| 1   | High interest overlap, same dorm & year | 0.6–0.9              | All boosts                |
| 2   | Low overlap, diff dorms                 | 0.1–0.4              | Minimal                   |
| 3   | Same-major-only ON + matching majors    | 0.15–0.5             | Major filter + boost      |
| 4   | Same-major-only ON + different majors   | 0.0                  | Filter blocks             |
| 5   | Dorm complex match (Hall vs Tower)      | 0.3–0.6              | +0.05 dorm complex        |
| 6   | One user with no dorm                   | 0.2–0.5              | No dorm boost, no penalty |
| 7   | Recency (<48h)                          | +0.10                | Recency boost             |

---

## Files

```
src/tests/
├── matching.test.ts          # Full integration test (TypeScript)
├── verify-scores.ts          # DB verification script
└── matching_algorithm_test.py # Algorithm unit test (Python)
```

---

## Notes

- Tests create real database records. They clean up after themselves.
- Run `npm run build` first if you get module errors.
- If port 3000 is busy, kill the existing process: `Get-NetTCPConnection -LocalPort 3000 | Stop-Process -Id {$_.OwningProcess} -Force`
- Randomization adds 10–15% noise; scores vary slightly between runs (within band).
- Minimum score threshold in service is 0.1 — matches below that are filtered out.

---

## Manual Testing (via curl)

### Register & Login

```bash
# Register
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test1","email":"t1@test.com","password":"pass123"}'

# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"t1@test.com","password":"pass123"}'
# → {"access_token":"eyJ..."}  (copy this token)
```

### Create Profile

```bash
curl -X POST http://localhost:3000/profile \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "age": 20,
    "gender": "MALE",
    "seeking": "FEMALE",
    "major": "Computer Science",
    "year": 3,
    "dorm": "Stirling Hall",
    "interests": ["coding","hiking","chess"],
    "sameMajorOnly": false
  }'
```

### Get Matches

```bash
curl -X GET "http://localhost:3000/matches?limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Refresh (recalculate)

```bash
curl -X GET "http://localhost:3000/matches/refresh" \
  -H "Authorization: Bearer YOUR_TOKEN"
```
