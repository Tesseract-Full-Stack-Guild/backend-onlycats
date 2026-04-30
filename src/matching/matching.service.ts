import { Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface InterestFrequency {
  [interest: string]: number;
}

@Injectable()
export class MatchingService implements OnModuleInit {
  private readonly logger = new Logger(MatchingService.name);
  private interestFrequencies: InterestFrequency = {};
  private totalUsersWithInterests = 0;

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.precomputeInterestFrequencies();
  }

  /**
   * Precompute global interest frequencies for IDF weighting
   * weight_i = 1 / log(frequency_i + 1)
   * Called on module init and can be refreshed periodically
   */
  private async precomputeInterestFrequencies(): Promise<void> {
    this.logger.log('Precomputing interest frequencies...');

    const allProfiles = await this.prisma.profile.findMany({
      select: { interests: true },
    });

    const frequencies: InterestFrequency = {};
    this.totalUsersWithInterests = 0;

    for (const profile of allProfiles) {
      if (profile.interests && profile.interests.length > 0) {
        this.totalUsersWithInterests++;
        const uniqueInterests = new Set(profile.interests);
        for (const interest of uniqueInterests) {
          frequencies[interest] = (frequencies[interest] || 0) + 1;
        }
      }
    }

    this.interestFrequencies = frequencies;
    this.logger.log(
      `Computed frequencies for ${Object.keys(frequencies).length} unique interests from ${this.totalUsersWithInterests} profiles`,
    );
  }

  /**
   * Get weight for a given interest using IDF formula
   */
  private getInterestWeight(interest: string): number {
    const freq = this.interestFrequencies[interest] || 1;
    return 1 / Math.log(freq + 1);
  }

  /**
   * Weighted Jaccard similarity
   * score = sum(weights of shared interests) / sum(weights of union of interests)
   * Returns value between 0 and 1
   */
  private weightedJaccard(interestsA: string[], interestsB: string[]): number {
    if (!interestsA.length || !interestsB.length) return 0;

    const setA = new Set(interestsA);
    const setB = new Set(interestsB);

    let intersectionWeight = 0;
    let unionWeight = 0;

    const allInterests = new Set([...setA, ...setB]);

    for (const interest of allInterests) {
      const weight = this.getInterestWeight(interest);
      unionWeight += weight;

      const inA = setA.has(interest);
      const inB = setB.has(interest);

      if (inA && inB) {
        intersectionWeight += weight;
      }
    }

    return unionWeight > 0 ? intersectionWeight / unionWeight : 0;
  }

  /**
   * Dorm boost calculation
   * Same building: +0.15
   * Same complex/area (partial match): +0.05
   * Otherwise: 0
   */
  private calculateDormBoost(
    dormA: string | null | undefined,
    dormB: string | null | undefined,
  ): number {
    if (!dormA || !dormB) return 0;

    const dormAStr = dormA.toString().toLowerCase().trim();
    const dormBStr = dormB.toString().toLowerCase().trim();

    // Exact match → same building
    if (dormAStr === dormBStr) {
      return 0.15;
    }

    // Check for same complex (first word match, e.g., "Stirling Hall" vs "Stirling Tower")
    const partsA = dormAStr.split(' ');
    const partsB = dormBStr.split(' ');

    for (const partA of partsA) {
      for (const partB of partsB) {
        if (partA && partB && partA === partB && partA.length > 3) {
          return 0.05; // same complex/area
        }
      }
    }

    return 0;
  }

  /**
   * Recency boost: +0.10 if active in last 48 hours
   */
  private calculateRecencyBoost(lastActive: Date): number {
    const now = new Date();
    const hoursSinceActive =
      (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60);
    return hoursSinceActive <= 48 ? 0.1 : 0;
  }

  /**
   * Main matching algorithm
   * Returns score 0-1 with all boosts and randomization
   */
  async calculateMatchScore(
    profileA: any,
    profileB: any,
    userAActive: Date,
    userBActive: Date,
  ): Promise<{
    score: number;
    breakdown: {
      interestScore: number;
      majorBoost: number;
      dormBoost: number;
      yearBoost: number;
      recencyBoost: number;
      randomFactor: number;
    };
  }> {
    // 1. Interest similarity (core signal) - weight 60% of base score
    const interestSimilarity = this.weightedJaccard(
      profileA.interests || [],
      profileB.interests || [],
    );
    const interestScore = interestSimilarity * 0.6; // max 0.6

    // 2. Major boost (only if same-major-only logic allows)
    // If A has sameMajorOnly=true, then B must have same major
    // If OFF, no boost
    let majorBoost = 0;
    if (profileA.sameMajorOnly && profileA.major && profileB.major) {
      if (profileA.major.toLowerCase() === profileB.major.toLowerCase()) {
        majorBoost = 0.2; // cap at 0.2 when enabled
      }
      // If sameMajorOnly is true but majors don't match, score will be 0 or very low
    }
    // If sameMajorOnly is OFF, major doesn't directly boost (captured in interest similarity)

    // 3. Dorm boost (conditional)
    const dormBoost = this.calculateDormBoost(profileA.dorm, profileB.dorm);

    // 4. Year boost (+0.05 if same year)
    const yearBoost =
      profileA.year && profileA.year === profileB.year ? 0.05 : 0;

    // 5. Recency boost (use more recent of the two users' activity)
    const moreRecentActive =
      userAActive > userBActive ? userAActive : userBActive;
    const recencyBoost = this.calculateRecencyBoost(moreRecentActive);

    // 6. Sum raw components (max possible = 0.6+0.2+0.15+0.05+0.10 = 1.1)
    const rawScore =
      interestScore + majorBoost + dormBoost + yearBoost + recencyBoost;

    // 7. Clamp to [0, 1] before randomization
    const clampedRaw = Math.max(0, Math.min(1, rawScore));

    // 8. Randomization: final = raw * 0.85 + random(0, 0.15)
    const randomNoise = Math.random() * 0.15;
    const finalScore = clampedRaw * 0.85 + randomNoise;

    return {
      score: Math.min(1, finalScore),
      breakdown: {
        interestScore,
        majorBoost,
        dormBoost,
        yearBoost,
        recencyBoost,
        randomFactor: randomNoise,
      },
    };
  }

  /**
   * Get top N matches for a user
   * Uses candidate filtering + scoring + caching
   */
  async getMatches(userId: string, limit: number = 20): Promise<any[]> {
    // 1. Get user's profile
    const userProfile = await this.prisma.profile.findUnique({
      where: { userId },
      include: { user: { select: { lastActive: true } } },
    });

    if (!userProfile) {
      throw new NotFoundException('Profile not found — create a profile first');
    }

    // 2. Build candidate query with basic filters
    const whereClause: any = {
      userId: { not: userId },
    };

    // Gender filter based on seeking
    if (userProfile.seeking !== 'EVERYONE') {
      whereClause.gender = userProfile.seeking;
    }

    // If sameMajorOnly is ON, filter by same major
    if (userProfile.sameMajorOnly && userProfile.major) {
      whereClause.major = userProfile.major;
    }

    // 3. Fetch candidates (batch size ~500 for performance)
    const candidates = await this.prisma.profile.findMany({
      where: whereClause,
      take: 500, // tune based on population size
      include: {
        user: { select: { lastActive: true } },
      },
    });

    this.logger.log(`Computing scores for ${candidates.length} candidates`);

    // 4. Score all candidates in parallel
    const scoredMatches = await Promise.all(
      candidates.map(async (candidate) => {
        const { score, breakdown } = await this.calculateMatchScore(
          userProfile,
          candidate,
          userProfile.user.lastActive,
          candidate.user.lastActive,
        );

        return {
          ...candidate,
          matchScore: score,
          scoreBreakdown: breakdown,
        };
      }),
    );

    // 5. Filter and sort
    const filtered = scoredMatches
      .filter((m) => m.matchScore >= 0.1) // minimum threshold
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, limit);

    // 6. Cache scores in bulk (upsert)
    await this.bulkUpsertMatchScores(userId, filtered);

    this.logger.log(`Returning top ${filtered.length} matches`);
    return filtered;
  }

  /**
   * Batch upsert match scores
   */
  private async bulkUpsertMatchScores(
    userId: string,
    matches: any[],
  ): Promise<void> {
    const now = new Date();
    const updates = matches.map((m) => ({
      where: { userAId_userBId: { userAId: userId, userBId: m.userId } },
      update: {
        score: m.matchScore,
        interestScore: m.scoreBreakdown.interestScore,
        majorBoost: m.scoreBreakdown.majorBoost,
        dormBoost: m.scoreBreakdown.dormBoost,
        yearBoost: m.scoreBreakdown.yearBoost,
        recencyBoost: m.scoreBreakdown.recencyBoost,
        randomFactor: m.scoreBreakdown.randomFactor,
        lastCalculated: now,
      },
      create: {
        userAId: userId,
        userBId: m.userId,
        score: m.matchScore,
        interestScore: m.scoreBreakdown.interestScore,
        majorBoost: m.scoreBreakdown.majorBoost,
        dormBoost: m.scoreBreakdown.dormBoost,
        yearBoost: m.scoreBreakdown.yearBoost,
        recencyBoost: m.scoreBreakdown.recencyBoost,
        randomFactor: m.scoreBreakdown.randomFactor,
      },
    }));

    // Execute upserts sequentially to avoid race conditions
    for (const update of updates) {
      await this.prisma.matchScore.upsert(update);
    }
  }

  /**
   * Get cached matches (faster, no recomputation)
   */
  async getCachedMatches(userId: string, limit: number = 20): Promise<any[]> {
    const scores = await this.prisma.matchScore.findMany({
      where: { userAId: userId },
      orderBy: { score: 'desc' },
      take: limit,
    });

    if (scores.length === 0) {
      return this.getMatches(userId, limit);
    }

    const profiles = await this.prisma.profile.findMany({
      where: { userId: { in: scores.map((s) => s.userBId) } },
      include: { user: { select: { lastActive: true } } },
    });

    const scoreMap = new Map(scores.map((s) => [s.userBId, s]));

    const result = profiles
      .map((profile) => ({
        ...profile,
        matchScore: scoreMap.get(profile.userId)?.score ?? 0,
        scoreBreakdown: {
          interestScore: scoreMap.get(profile.userId)?.interestScore ?? 0,
          majorBoost: scoreMap.get(profile.userId)?.majorBoost ?? 0,
          dormBoost: scoreMap.get(profile.userId)?.dormBoost ?? 0,
          yearBoost: scoreMap.get(profile.userId)?.yearBoost ?? 0,
          recencyBoost: scoreMap.get(profile.userId)?.recencyBoost ?? 0,
          randomFactor: scoreMap.get(profile.userId)?.randomFactor ?? 0,
        },
      }))
      .filter((m) => m.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore);

    return result;
  }

  /**
   * Invalidate cache for a user (call when profile updates)
   */
  async invalidateUserCache(userId: string): Promise<void> {
    await this.prisma.matchScore.deleteMany({
      where: {
        OR: [{ userAId: userId }, { userBId: userId }],
      },
    });
  }

  /**
   * Refresh frequencies (call periodically as new users join)
   */
  async refreshFrequencies(): Promise<void> {
    await this.precomputeInterestFrequencies();
  }
}

