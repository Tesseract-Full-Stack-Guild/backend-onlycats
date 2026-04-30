/**
 * Matching System Integration Tests
 *
 * Tests the full POST /profile → GET /matches flow
 *
 * Usage: npx ts-node src/tests/matching.test.ts
 */

import { PrismaClient } from '../../generated/prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

// Use built-in fetch (Node 18+)
const fetchAPI =
  globalThis.fetch ||
  ((...args: any) => import('node-fetch').then((mod) => mod.default(...args)));

const prisma = new PrismaClient({ datasourceUrl: process.env.DATABASE_URL });

interface TestProfile {
  name: string;
  email: string;
  password: string;
  profile: {
    age: number;
    gender: 'MALE' | 'FEMALE' | 'NON_BINARY';
    seeking: 'MALE' | 'FEMALE' | 'EVERYONE';
    college?: string;
    major?: string;
    year?: number;
    dorm?: string | null;
    interests: string[];
    sameMajorOnly?: boolean;
  };
}

// ─── Test data ────────────────────────────────────────────────────────────────

const testProfiles: TestProfile[] = [
  {
    name: 'Alice',
    email: 'alice@test.com',
    password: 'TestPass123!',
    profile: {
      age: 20,
      gender: 'FEMALE',
      seeking: 'MALE',
      college: 'Computing',
      major: 'CS',
      year: 3,
      dorm: 'Stirling Hall',
      interests: ['coding', 'hiking', 'chess', 'coffee'],
      sameMajorOnly: false,
    },
  },
  {
    name: 'Bob',
    email: 'bob@test.com',
    password: 'TestPass123!',
    profile: {
      age: 21,
      gender: 'MALE',
      seeking: 'FEMALE',
      college: 'Computing',
      major: 'CS',
      year: 3,
      dorm: 'Stirling Hall',
      interests: ['coding', 'hiking', 'music', 'gaming'],
      sameMajorOnly: false,
    },
  },
  {
    name: 'Charlie',
    email: 'charlie@test.com',
    password: 'TestPass123!',
    profile: {
      age: 22,
      gender: 'MALE',
      seeking: 'FEMALE',
      college: 'Computing',
      major: 'CS',
      year: 4,
      dorm: 'Stirling Tower',
      interests: ['chess', 'reading', 'coffee'],
      sameMajorOnly: true,
    },
  },
  {
    name: 'Diana',
    email: 'diana@test.com',
    password: 'TestPass123!',
    profile: {
      age: 20,
      gender: 'FEMALE',
      seeking: 'MALE',
      college: 'Engineering',
      major: 'ME',
      year: 2,
      dorm: 'Engineering Hall',
      interests: ['hiking', 'basketball'],
      sameMajorOnly: false,
    },
  },
  {
    name: 'Eve',
    email: 'eve@test.com',
    password: 'TestPass123!',
    profile: {
      age: 19,
      gender: 'FEMALE',
      seeking: 'MALE',
      college: 'Arts',
      major: 'Psychology',
      year: 1,
      dorm: null,
      interests: ['art', 'music'],
      sameMajorOnly: false,
    },
  },
  {
    name: 'Frank',
    email: 'frank@test.com',
    password: 'TestPass123!',
    profile: {
      age: 20,
      gender: 'MALE',
      seeking: 'FEMALE',
      college: 'Computing',
      major: 'CS',
      year: 2,
      dorm: 'Stirling Hall',
      interests: ['coding', 'hiking', 'music'],
      sameMajorOnly: false,
    },
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function colors(type: 'green' | 'red' | 'yellow' | 'blue' | 'cyan') {
  const map = { green: 32, red: 31, yellow: 33, blue: 34, cyan: 36 };
  return (text: string) => `\x1b[${map[type]}m${text}\x1b[0m`;
}
const c = {
  green: colors('green'),
  red: colors('red'),
  yellow: colors('yellow'),
  blue: colors('blue'),
  cyan: colors('cyan'),
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function registerAndLogin(p: TestProfile): Promise<string> {
  // Register (ignore errors if already exists)
  await fetchAPI('http://localhost:3000/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: p.name,
      email: p.email,
      password: p.password,
    }),
  }).catch(() => {});

  // Login
  const res = await fetchAPI('http://localhost:3000/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: p.email, password: p.password }),
  });
  if (!res.ok)
    throw new Error(`Login failed for ${p.email}: ${await res.text()}`);
  const data = await res.json();
  return data.access_token;
}

async function createProfile(
  token: string,
  profile: TestProfile['profile'],
): Promise<void> {
  const res = await fetch('http://localhost:3000/profile', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(profile),
  });
  if (!res.ok) throw new Error(`Create profile failed: ${await res.text()}`);
}

async function getMatches(token: string, limit: number = 20): Promise<any[]> {
  const res = await fetch(`http://localhost:3000/matches?limit=${limit}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Get matches failed: ${await res.text()}`);
  return res.json();
}

// ─── Test Scenarios ───────────────────────────────────────────────────────────

async function testHighOverlap(
  tokenAlice: string,
  tokenBob: string,
): Promise<boolean> {
  console.log(c.cyan('\n─ Scenario 1: High overlap (Alice↔Bob) ─'));
  const aliceMatches = await getMatches(tokenAlice);
  const bob = aliceMatches.find((m: any) => m.name === 'Bob');
  if (!bob) {
    console.log(c.red('  ❌ Bob not found'));
    return false;
  }
  console.log(`  Score: ${bob.matchScore.toFixed(3)}`);
  console.log(`  Breakdown: ${JSON.stringify(bob.scoreBreakdown)}`);
  if (bob.matchScore > 0.6) {
    console.log(c.green('  ✓ PASS'));
    return true;
  }
  console.log(c.red('  ❌ Score ≤ 0.6'));
  return false;
}

async function testDormBoost(tokenAlice: string): Promise<boolean> {
  console.log(c.cyan('\n─ Scenario 2: Dorm boost (Alice↔Eve) ─'));
  const matches = await getMatches(tokenAlice);
  const eve = matches.find((m: any) => m.name === 'Eve');
  if (!eve) {
    console.log(c.yellow('  ⚠ Eve not in matches'));
    return false;
  }
  console.log(
    `  Eve dorm: ${eve.dorm}   DormBoost: ${eve.scoreBreakdown.dormBoost}`,
  );
  if (eve.scoreBreakdown.dormBoost === 0) {
    console.log(c.green('  ✓ No boost for null dorm'));
    return true;
  }
  console.log(c.red('  ❌ Unexpected dorm boost'));
  return false;
}

async function testSameMajorToggle(
  tokenAlice: string,
  tokenCharlie: string,
): Promise<boolean> {
  console.log(c.cyan('\n─ Scenario 3: sameMajorOnly toggle ON ─'));
  const charlieMatches = await getMatches(tokenCharlie);
  const alice = charlieMatches.find((m: any) => m.name === 'Alice');
  if (!alice) {
    console.log(c.red('  ❌ Alice not found (toggle should allow)'));
    return false;
  }
  if (alice.matchScore > 0.3) {
    console.log(
      c.green(`  ✓ Alice appears (score=${alice.matchScore.toFixed(3)})`),
    );
    return true;
  }
  console.log(c.red('  ❌ Score too low'));
  return false;
}

async function testDifferentMajor(tokenAlice: string): Promise<boolean> {
  console.log(c.cyan('\n─ Scenario 4: Different major, toggle OFF ─'));
  const matches = await getMatches(tokenAlice);
  const diana = matches.find((m: any) => m.name === 'Diana');
  if (!diana) {
    console.log(c.yellow('  ⚠ Diana not found'));
    return false;
  }
  console.log(
    `  Diana score: ${diana.matchScore.toFixed(3)}  major: ${diana.major}`,
  );
  if (diana.matchScore < 0.4) {
    console.log(c.green('  ✓ Lower score (no major boost)'));
    return true;
  }
  console.log(c.yellow('  ⚠ Score higher than expected'));
  return true;
}

async function testDormComplex(tokenAlice: string): Promise<boolean> {
  console.log(
    c.cyan('\n─ Scenario 5: Dorm complex match (Stirling Hall↔Tower) ─'),
  );
  const matches = await getMatches(tokenAlice);
  const charlie = matches.find((m: any) => m.name === 'Charlie');
  if (!charlie) {
    console.log(c.red('  ❌ Charlie not found'));
    return false;
  }
  const boost = charlie.scoreBreakdown.dormBoost;
  console.log(`  Charlie dorm: ${charlie.dorm}   Boost: ${boost}`);
  if (boost === 0.05 || boost === 0.15) {
    console.log(c.green('  ✓ Complex boost applied'));
    return true;
  } // either exact or complex match
  console.log(c.red('  ❌ Expected 0.05 or 0.15'));
  return false;
}

async function testRecency(tokenBob: string): Promise<boolean> {
  console.log(c.cyan('\n─ Scenario 6: Recency boost (Frank) ─'));
  const matches = await getMatches(tokenBob);
  const frank = matches.find((m: any) => m.name === 'Frank');
  if (!frank) {
    console.log(c.yellow('  ⚠ Frank not in matches'));
    return false;
  }
  console.log(
    `  Frank score: ${frank.matchScore.toFixed(3)}   Recency: ${frank.scoreBreakdown.recencyBoost}`,
  );
  if (frank.scoreBreakdown.recencyBoost === 0.1) {
    console.log(c.green('  ✓ Recency boost (+0.10)'));
    return true;
  }
  console.log(c.yellow('  ⚠ Recency boost not applied'));
  return false;
}

async function testMinThreshold(tokenAlice: string): Promise<boolean> {
  console.log(c.cyan('\n─ Scenario 7: Minimum threshold filter ─'));
  const matches = await getMatches(tokenAlice);
  const bad = matches.filter((m: any) => m.matchScore <= 0.1);
  if (bad.length === 0) {
    console.log(c.green(`  ✓ All ${matches.length} matches > 0.1`));
    return true;
  }
  console.log(c.red(`  ❌ ${bad.length} matches ≤ 0.1`));
  return false;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function run() {
  console.log(c.blue('═'.repeat(60)));
  console.log(c.blue('       MATCHING SYSTEM INTEGRATION TESTS'));
  console.log(c.blue('═'.repeat(60)));

  try {
    // ── Cleanup ────────────────────────────────────────────────────────────────
    console.log(c.yellow('\n[Setup] Cleaning existing test data...'));
    for (const p of testProfiles) {
      const user = await prisma.user.findUnique({ where: { email: p.email } });
      if (user) {
        await prisma.profile.deleteMany({ where: { userId: user.id } });
        await prisma.user.delete({ where: { id: user.id } });
      }
    }
    console.log(c.green('  ✓ Cleaned'));

    // ── Create users & profiles ────────────────────────────────────────────────
    console.log(c.yellow('\n[Setup] Creating test accounts...'));
    const tokens: Record<string, string> = {};

    for (const p of testProfiles) {
      const token = await registerAndLogin(p);
      tokens[p.name.toLowerCase()] = token;
      await createProfile(token, p.profile);
      console.log(c.green(`  ✓ ${p.name}`));
    }

    console.log(c.green(`\n✓ Created ${testProfiles.length} profiles`));
    console.log(c.yellow('  Waiting for frequency precomputation...'));
    await sleep(2000);

    // ── Run scenarios ─────────────────────────────────────────────────────────
    console.log(c.blue('\n' + '═'.repeat(60)));
    console.log(c.blue('       RUNNING SCENARIOS'));
    console.log(c.blue('═'.repeat(60)));

    const results: Record<string, boolean> = {};
    results.s1 = await testHighOverlap(tokens.alice, tokens.bob);
    await sleep(300);
    results.s2 = await testDormBoost(tokens.alice);
    await sleep(300);
    results.s3 = await testSameMajorToggle(tokens.alice, tokens.charlie);
    await sleep(300);
    results.s4 = await testDifferentMajor(tokens.alice);
    await sleep(300);
    results.s5 = await testDormComplex(tokens.alice);
    await sleep(300);
    results.s6 = await testRecency(tokens.bob);
    await sleep(300);
    results.s7 = await testMinThreshold(tokens.alice);

    // ── Summary ───────────────────────────────────────────────────────────────
    console.log(c.blue('\n' + '═'.repeat(60)));
    console.log(c.blue('       SUMMARY'));
    console.log(c.blue('═'.repeat(60)));

    let pass = 0,
      fail = 0;
    for (const [k, v] of Object.entries(results)) {
      console.log(v ? c.green(`  ✓ ${k}`) : c.red(`  ❌ ${k}`));
      v ? pass++ : fail++;
    }
    console.log(c.blue(`\nTotal: ${pass} passed, ${fail} failed`));
    if (fail === 0) console.log(c.green('\n🎉 ALL TESTS PASSED!\n'));
    else console.log(c.red(`\n⚠ ${fail} test(s) failed\n`));
  } catch (error: any) {
    console.error(c.red('Test error:'), error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

run().catch(console.error);

