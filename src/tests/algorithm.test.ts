/**
 * Matching Algorithm Unit Tests
 *
 * Tests the weighted Jaccard, boosts, and randomization logic
 * Run: npx ts-node src/tests/algorithm.test.ts
 */

import { MatchingService } from '../matching/matching.service';
import { PrismaService } from '../prisma/prisma.service';

// Mock PrismaService to test algorithm in isolation
class MockPrismaService {
  profile = {
    findUnique: async (params: any) => null,
    findMany: async (params: any) => [],
    upsert: async (params: any) => {},
  };

  matchScore = {
    upsert: async (params: any) => {},
    findMany: async (params: any) => [],
    deleteMany: async (params: any) => {},
  };
}

async function testAlgorithm() {
  console.log('🧪 Testing Matching Algorithm\n');

  const matching = new MatchingService(new MockPrismaService() as any);

  // Manually set some frequencies for testing
  (matching as any).interestFrequencies = {
    coding: 50,
    hiking: 30,
    music: 80,
    chess: 10,
    coffee: 25,
    gaming: 40,
  };
  (matching as any).totalUsersWithInterests = 100;

  const testCases = [
    {
      name: 'High interest overlap, same dorm & year',
      profileA: {
        interests: ['coding', 'hiking', 'chess'],
        major: 'CS',
        dorm: 'Stirling Hall',
        year: 3,
        sameMajorOnly: false,
        lastActive: new Date(),
      },
      profileB: {
        interests: ['coding', 'hiking', 'music', 'coffee'],
        major: 'CS',
        dorm: 'Stirling Hall',
        year: 3,
        lastActive: new Date(),
      },
      minExpectedScore: 0.6, // Should be high
      maxExpectedScore: 0.9,
    },
    {
      name: 'Low interest overlap, different dorms',
      profileA: {
        interests: ['coding'],
        major: 'CS',
        dorm: 'Stirling Hall',
        year: 1,
        sameMajorOnly: false,
        lastActive: new Date(),
      },
      profileB: {
        interests: ['music', 'art'],
        major: 'Math',
        dorm: 'Engineering Hall',
        year: 2,
        lastActive: new Date(),
      },
      minExpectedScore: 0.15,
      maxExpectedScore: 0.35,
    },
    {
      name: 'Same major only toggle ON, matching majors',
      profileA: {
        interests: ['coding'],
        major: 'CS',
        dorm: null,
        year: 2,
        sameMajorOnly: true,
        lastActive: new Date(),
      },
      profileB: {
        interests: ['music'],
        major: 'CS',
        dorm: null,
        year: 3,
        lastActive: new Date(),
      },
      minExpectedScore: 0.2, // Basic interest + major boost (0.2) + maybe recency
      maxExpectedScore: 0.5,
    },
    {
      name: 'Same major only toggle ON, different majors',
      profileA: {
        interests: ['coding'],
        major: 'CS',
        dorm: null,
        year: 2,
        sameMajorOnly: true,
        lastActive: new Date(),
      },
      profileB: {
        interests: ['music'],
        major: 'Math',
        dorm: null,
        year: 2,
        lastActive: new Date(),
      },
      minExpectedScore: 0,
      maxExpectedScore: 0, // Should be 0 or near 0
    },
    {
      name: 'Dorm complex match (Stirling Hall vs Stirling Tower)',
      profileA: {
        interests: ['coding', 'coffee'],
        major: 'CS',
        dorm: 'Stirling Hall',
        year: 2,
        sameMajorOnly: false,
        lastActive: new Date(),
      },
      profileB: {
        interests: ['coding', 'music'],
        major: 'CS',
        dorm: 'Stirling Tower',
        year: 2,
        lastActive: new Date(),
      },
      minExpectedScore: 0.3,
      maxExpectedScore: 0.6,
    },
    {
      name: 'One user with no dorm',
      profileA: {
        interests: ['coding', 'hiking'],
        major: 'CS',
        dorm: 'Stirling Hall',
        year: 2,
        sameMajorOnly: false,
        lastActive: new Date(),
      },
      profileB: {
        interests: ['coding', 'music'],
        major: 'CS',
        dorm: null, // No dorm
        year: 2,
        lastActive: new Date(),
      },
      minExpectedScore: 0.3,
      maxExpectedScore: 0.5,
    },
  ];

  let passed = 0;
  let failed = 0;

  for (const testCase of testCases) {
    console.log(`\n📝 Test: ${testCase.name}`);

    // Mock the calculateMatchScore call
    const scoreResult = await (matching as any).calculateMatchScore(
      testCase.profileA,
      testCase.profileB,
      new Date(), // both active now
      new Date(),
    );

    const { score, breakdown } = scoreResult;

    console.log(
      `   Score: ${score.toFixed(4)} (expected: ${testCase.minExpectedScore}-${testCase.maxExpectedScore})`,
    );
    console.log(`   Breakdown:`, JSON.stringify(breakdown, null, 2));

    const withinRange =
      score >= testCase.minExpectedScore && score <= testCase.maxExpectedScore;

    // Special check for same-major toggle ON + different majors
    if (
      testCase.name.includes('different majors') &&
      testCase.minExpectedScore === 0
    ) {
      if (score < 0.01) {
        console.log('   ✅ PASS (score near 0 as expected)');
        passed++;
      } else {
        console.log('   ❌ FAIL (score should be ~0)');
        failed++;
      }
    } else if (withinRange) {
      console.log('   ✅ PASS');
      passed++;
    } else {
      console.log('   ❌ FAIL (out of expected range)');
      failed++;
    }
  }

  console.log(`\n${'='.repeat(50)}`);
  console.log(`Tests: ${passed} passed, ${failed} failed`);
  console.log(`${'='.repeat(50)}\n`);
}

// Test weighted Jaccard specifically
async function testWeightedJaccard() {
  console.log('🧪 Testing Weighted Jaccard\n');

  const matching = new MatchingService(new MockPrismaService() as any);

  // Set frequencies
  (matching as any).interestFrequencies = {
    common: 100, // common → low weight
    rare: 5, // rare → high weight
    medium: 20,
  };

  const common = 1 / Math.log(100 + 1); // ~0.23
  const rare = 1 / Math.log(5 + 1); // ~0.59
  const medium = 1 / Math.log(20 + 1); // ~0.34

  const testCases = [
    {
      name: 'Identical sets',
      a: ['common', 'rare'],
      b: ['common', 'rare'],
      expected: (common + rare) / (common + rare), // = 1.0
    },
    {
      name: 'One common only',
      a: ['common'],
      b: ['rare'],
      expected: 0, // no intersection
    },
    {
      name: 'Partial overlap',
      a: ['common', 'medium', 'rare'],
      b: ['common', 'rare'],
      // intersection: common, rare
      // union: common, medium, rare
      expected: (common + rare) / (common + medium + rare),
    },
  ];

  for (const test of testCases) {
    // Access private method via type assertion
    const result = (matching as any).weightedJaccard(test.a, test.b);
    const diff = Math.abs(result - test.expected);
    console.log(
      `${test.name}: ${result.toFixed(4)} (expected ${test.expected.toFixed(4)}) ${diff < 0.01 ? '✅' : '❌'}`,
    );
  }
}

// Test dorm boost logic
async function testDormBoost() {
  console.log('\n🧪 Testing Dorm Boost\n');

  const matching = new MatchingService(new MockPrismaService() as any);

  const testCases = [
    {
      a: 'Stirling Hall',
      b: 'Stirling Hall',
      expected: 0.15,
      name: 'Exact match',
    },
    {
      a: 'Stirling Tower',
      b: 'Stirling Hall',
      expected: 0.05,
      name: 'Complex match',
    },
    {
      a: 'Engineering Hall',
      b: 'Engineering Tower',
      expected: 0.05,
      name: 'Complex match 2',
    },
    { a: 'Stirling Hall', b: 'Arts Building', expected: 0, name: 'No match' },
    { a: null, b: 'Stirling Hall', expected: 0, name: 'One null' },
    { a: null, b: null, expected: 0, name: 'Both null' },
  ];

  for (const tc of testCases) {
    const result = (matching as any).calculateDormBoost(tc.a, tc.b);
    const pass = Math.abs(result - tc.expected) < 0.001;
    console.log(
      `${tc.name}: ${result} (expected ${tc.expected}) ${pass ? '✅' : '❌'}`,
    );
  }
}

// Test recency boost
async function testRecencyBoost() {
  console.log('\n🧪 Testing Recency Boost\n');

  const matching = new MatchingService(new MockPrismaService() as any);

  const now = new Date();
  const testCases = [
    { active: now, expected: 0.1, name: 'Just now' },
    {
      active: new Date(now.getTime() - 24 * 60 * 60 * 1000),
      expected: 0.1,
      name: '24h ago',
    },
    {
      active: new Date(now.getTime() - 48 * 60 * 60 * 1000),
      expected: 0.1,
      name: '48h ago',
    },
    {
      active: new Date(now.getTime() - 49 * 60 * 60 * 1000),
      expected: 0,
      name: '49h ago',
    },
    {
      active: new Date(now.getTime() - 72 * 60 * 60 * 1000),
      expected: 0,
      name: '3 days ago',
    },
  ];

  for (const tc of testCases) {
    const result = (matching as any).calculateRecencyBoost(tc.active);
    const pass = Math.abs(result - tc.expected) < 0.001;
    console.log(
      `${tc.name}: ${result} (expected ${tc.expected}) ${pass ? '✅' : '❌'}`,
    );
  }
}

// Test randomization bounds
async function testRandomization() {
  console.log('\n🧪 Testing Randomization Bounds\n');

  const matching = new MatchingService(new MockPrismaService() as any);

  // Mock profiles
  const profileA = {
    interests: ['coding'],
    major: 'CS',
    dorm: null,
    year: 2,
    lastActive: new Date(),
  };
  const profileB = {
    interests: ['hiking'],
    major: 'Math',
    dorm: null,
    year: 2,
    lastActive: new Date(),
  };

  // Compute raw score (should be ~0.05 = yearBoost)
  const baseScore = 0.05; // only year boost

  // Test many random samples
  let min = 1,
    max = 0;
  for (let i = 0; i < 1000; i++) {
    const result = await (matching as any).calculateMatchScore(
      profileA,
      profileB,
      new Date(),
      new Date(),
    );
    min = Math.min(min, result.score);
    max = Math.max(max, result.score);
  }

  const expectedMin = baseScore * 0.85;
  const expectedMax = baseScore * 0.85 + 0.15;

  console.log(`Raw year boost: ${baseScore}`);
  console.log(
    `Min after randomization: ${min.toFixed(4)} (expected ~${expectedMin.toFixed(4)})`,
  );
  console.log(
    `Max after randomization: ${max.toFixed(4)} (expected ~${expectedMax.toFixed(4)})`,
  );

  const pass = min >= expectedMin - 0.02 && max <= expectedMax + 0.02;
  console.log(
    pass ? '✅ Randomization within bounds' : '❌ Randomization out of bounds',
  );
}

// ==================== RUN ====================

async function main() {
  try {
    await testWeightedJaccard();
    await testDormBoost();
    await testRecencyBoost();
    await testRandomization();
    console.log(
      '\n✅ Unit tests complete. Run integration tests with real API calls.\n',
    );
  } catch (error: any) {
    console.error('Test error:', error);
    process.exit(1);
  }
}

main();
