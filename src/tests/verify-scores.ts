/**
 * Quick Verify Match Scores (Direct DB Query)
 *
 * Run: npx ts-node src/tests/verify-scores.ts
 *
 * Queries the match_scores table to verify cached scores exist
 */

import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function verifyScores() {
  console.log('🔍 Verifying Match Scores in Database\n');

  try {
    // Check if we have any match scores
    const totalScores = await prisma.matchScore.count();
    console.log(`Total match scores in DB: ${totalScores}`);

    if (totalScores === 0) {
      console.log(
        colors.yellow(
          'No match scores found. Run GET /matches first to generate them.',
        ),
      );
      return;
    }

    // Get all scores
    const scores = await prisma.matchScore.findMany({
      take: 20,
      orderBy: { score: 'desc' },
      include: {
        userA: { select: { username: true, email: true } },
        userB: { select: { username: true, email: true } },
      },
    });

    console.log(colors.blue('Top 20 Match Scores:\n'));
    console.log(
      `${'Score'.padStart(6)} | ${'User A'.padStart(15)} | ${'User B'.padStart(15)} | Breakdown`,
    );
    console.log('-'.repeat(80));

    for (const score of scores) {
      const aName = score.userA?.username || score.userAId.substring(0, 8);
      const bName = score.userB?.username || score.userBId.substring(0, 8);

      console.log(
        `${score.score.toFixed(4).padStart(6)} | ` +
          `${aName.padStart(15)} | ${bName.padStart(15)} | ` +
          `interest=${(score.interestScore || 0).toFixed(2)}, ` +
          `dorm=${(score.dormBoost || 0).toFixed(2)}, ` +
          `year=${(score.yearBoost || 0).toFixed(2)}, ` +
          `recency=${(score.recencyBoost || 0).toFixed(2)}, ` +
          `random=${(score.randomFactor || 0).toFixed(2)}`,
      );
    }

    console.log('');

    // Check score distribution
    const stats = await prisma.$queryRaw`
      SELECT 
        COUNT(*) as total,
        AVG(score) as avg_score,
        MIN(score) as min_score,
        MAX(score) as max_score,
        STDDEV(score) as stddev
      FROM match_scores
    `;

    console.log(colors.blue('Score Statistics:'));
    console.log(JSON.stringify(stats[0], null, 2));

    // Look for potential issues
    const zeroScores = await prisma.matchScore.count({
      where: { score: 0 },
    });

    if (zeroScores > 0) {
      console.log(
        colors.yellow(
          `\n⚠ ${zeroScores} matches with score 0 (sameMajorOnly in effect)`,
        ),
      );
    }
  } catch (error: any) {
    console.error(colors.red('Error:'), error.message);
  } finally {
    await prisma.$disconnect();
  }
}

function colors(type: 'green' | 'red' | 'yellow' | 'blue' | 'cyan') {
  const ansi = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
  };
  return (text: string) => `${ansi[type]}${text}\x1b[0m`;
}

// Run
verifyScores();
