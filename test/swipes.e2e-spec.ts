import 'dotenv/config';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service.js';
import bcrypt from 'bcrypt';
import cookieParser from 'cookie-parser';

interface TestUser {
  id: string;
  username: string;
  token: string;
}

describe('Swipes (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const baseUrl = '/swipes';

  const users: TestUser[] = [];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);

    // Create test users and profiles - use unique identifiers to avoid conflicts
    const unique = Date.now();
    const passwordHash = await bcrypt.hash('password123', 10);

    // Clean up any existing test users first
    await prisma.user.deleteMany({
      where: {
        username: {
          in: ['alice_swipe', 'bob_swipe', 'charlie_swipe'],
        },
      },
    });

    const [userA, userB, userC] = await Promise.all([
      prisma.user.create({
        data: {
          username: 'alice_swipe',
          email: `alice_${unique}@example.com`,
          passwordHash,
          role: 'USER',
        },
      }),
      prisma.user.create({
        data: {
          username: 'bob_swipe',
          email: `bob_${unique}@example.com`,
          passwordHash,
          role: 'USER',
        },
      }),
      prisma.user.create({
        data: {
          username: 'charlie_swipe',
          email: `charlie_${unique}@example.com`,
          passwordHash,
          role: 'USER',
        },
      }),
    ]);

    // Create profiles
    await prisma.profile.createMany({
      data: [
        {
          userId: userA.id,
          name: 'Alice',
          age: 22,
          gender: 'FEMALE',
          seeking: 'MALE',
          interests: ['hiking', 'music', 'coding'],
          major: 'Computer Science',
          dorm: 'Stirling Hall',
          year: 3,
          sameMajorOnly: false,
        },
        {
          userId: userB.id,
          name: 'Bob',
          age: 23,
          gender: 'MALE',
          seeking: 'FEMALE',
          interests: ['gaming', 'music', 'sports'],
          major: 'Computer Science',
          dorm: 'Stirling Hall',
          year: 4,
          sameMajorOnly: false,
        },
        {
          userId: userC.id,
          name: 'Charlie',
          age: 24,
          gender: 'MALE',
          seeking: 'FEMALE',
          interests: ['hiking', 'art'],
          major: 'Biology',
          dorm: 'Evans Hall',
          year: 2,
          sameMajorOnly: false,
        },
      ],
    });

    // Obtain JWT tokens
    const login = async (username: string, password: string) => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ usernameOrEmail: username, password })
        .expect(200);

      return res.headers['set-cookie'];
    };

    const cookiesA = await login('alice_swipe', 'password123');
    const cookiesB = await login('bob_swipe', 'password123');
    const cookiesC = await login('charlie_swipe', 'password123');

    users.push(
      { ...userA, token: cookiesA?.[0]?.split(';')[0] || '' },
      { ...userB, token: cookiesB?.[0]?.split(';')[0] || '' },
      { ...userC, token: cookiesC?.[0]?.split(';')[0] || '' },
    );
  });

  // Clean up between tests to avoid state leakage
  afterEach(async () => {
    const userIds = users.map((u) => u.id);
    if (userIds.length > 0) {
      await prisma.swipe.deleteMany({
        where: {
          OR: [{ swiperId: { in: userIds } }, { swipedId: { in: userIds } }],
        },
      });
      await prisma.match.deleteMany({
        where: {
          OR: [{ initiatorId: { in: userIds } }, { targetId: { in: userIds } }],
        },
      });
    }
  });

  afterAll(async () => {
    await prisma.swipe.deleteMany({});
    await prisma.match.deleteMany({});
    await prisma.message.deleteMany({});
    await prisma.profile.deleteMany({});
    await prisma.user.deleteMany({
      where: {
        username: {
          in: ['alice_swipe', 'bob_swipe', 'charlie_swipe'],
        },
      },
    });
    await prisma.$disconnect();
    await app.close();
  });

  describe('POST /swipes/:swipedId/:action', () => {
    it('should create a LIKE swipe', async () => {
      const alice = users[0];
      const bob = users[1];

      const res = await request(app.getHttpServer())
        .post(`${baseUrl}/${bob.id}/LIKE`)
        .set('Cookie', [alice.token])
        .expect(201);

      expect(res.body).toHaveProperty('matched');
      expect(res.body.matched).toBe(false);
    });

    it('should create a PASS swipe', async () => {
      const alice = users[0];
      const bob = users[1];

      const res = await request(app.getHttpServer())
        .post(`${baseUrl}/${bob.id}/PASS`)
        .set('Cookie', [alice.token])
        .expect(201);

      expect(res.body).toHaveProperty('matched');
      expect(res.body.matched).toBe(false);
    });

    it('should create a mutual match when both users like each other', async () => {
      const bob = users[1];
      const alice = users[0];

      // Bob likes Alice first
      await request(app.getHttpServer())
        .post(`${baseUrl}/${alice.id}/LIKE`)
        .set('Cookie', [bob.token])
        .expect(201);

      // Alice likes Bob - should result in match
      const res = await request(app.getHttpServer())
        .post(`${baseUrl}/${bob.id}/LIKE`)
        .set('Cookie', [alice.token])
        .expect(201);

      expect(res.body.matched).toBe(true);
      expect(res.body.match).toHaveProperty('id');
    });

    it('should prevent swiping on self', async () => {
      const alice = users[0];

      const res = await request(app.getHttpServer())
        .post(`${baseUrl}/${alice.id}/LIKE`)
        .set('Cookie', [alice.token]);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message');
    });

    it('should prevent swiping on non-existent user', async () => {
      const alice = users[0];

      const res = await request(app.getHttpServer())
        .post(`${baseUrl}/non-existent-id/LIKE`)
        .set('Cookie', [alice.token]);

      expect(res.status).toBe(404);
    });

    it('should update existing swipe when swiping again', async () => {
      const alice = users[0];
      const bob = users[1];

      // First swipe - LIKE
      await request(app.getHttpServer())
        .post(`${baseUrl}/${bob.id}/LIKE`)
        .set('Cookie', [alice.token])
        .expect(201);

      // Second swipe - change to PASS
      const res = await request(app.getHttpServer())
        .post(`${baseUrl}/${bob.id}/PASS`)
        .set('Cookie', [alice.token])
        .expect(201);

      expect(res.body.matched).toBe(false);
    });
  });

  describe('GET /swipes/my-swipes', () => {
    it('should return list of swipes made by user', async () => {
      const alice = users[0];
      const bob = users[1];

      // Alice swipes on Bob
      await request(app.getHttpServer())
        .post(`${baseUrl}/${bob.id}/LIKE`)
        .set('Cookie', [alice.token]);

      const res = await request(app.getHttpServer())
        .get(`${baseUrl}/my-swipes`)
        .set('Cookie', [alice.token])
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('id');
      expect(res.body[0]).toHaveProperty('action');
      expect(res.body[0]).toHaveProperty('user');
      expect(res.body[0].user).toHaveProperty('username');
      expect(res.body[0].user).toHaveProperty('profile');
    });
  });

  describe('GET /swipes/liked-me', () => {
    it('should return users who liked the current user', async () => {
      const bob = users[1];
      const alice = users[0];

      // Alice likes Bob
      await request(app.getHttpServer())
        .post(`${baseUrl}/${bob.id}/LIKE`)
        .set('Cookie', [alice.token]);

      const res = await request(app.getHttpServer())
        .get(`${baseUrl}/liked-me`)
        .set('Cookie', [bob.token])
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('id');
      expect(res.body[0]).toHaveProperty('user');
      expect(res.body[0].user.username).toBe('alice_swipe');
    });
  });

  describe('GET /swipes/matches', () => {
    it('should return mutual matches', async () => {
      const alice = users[0];
      const bob = users[1];

      // Create mutual likes
      await request(app.getHttpServer())
        .post(`${baseUrl}/${alice.id}/LIKE`)
        .set('Cookie', [bob.token]);

      await request(app.getHttpServer())
        .post(`${baseUrl}/${bob.id}/LIKE`)
        .set('Cookie', [alice.token]);

      // Check Alice's matches
      const res = await request(app.getHttpServer())
        .get(`${baseUrl}/matches`)
        .set('Cookie', [alice.token])
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('id');
      expect(res.body[0]).toHaveProperty('user');
      expect(res.body[0]).toHaveProperty('matchedAt');
      expect(res.body[0].user.username).toBe('bob_swipe');
    });

    it('should return empty array when no matches', async () => {
      const charlie = users[2];

      const res = await request(app.getHttpServer())
        .get(`${baseUrl}/matches`)
        .set('Cookie', [charlie.token])
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);
    });
  });

  describe('DELETE /swipes/undo', () => {
    it('should undo last swipe when no match exists', async () => {
      const alice = users[0];
      const bob = users[1];

      // Alice likes Bob
      await request(app.getHttpServer())
        .post(`${baseUrl}/${bob.id}/LIKE`)
        .set('Cookie', [alice.token]);

      // Undo
      const res = await request(app.getHttpServer())
        .delete(`${baseUrl}/undo`)
        .set('Cookie', [alice.token])
        .expect(200);

      expect(res.body).toEqual({
        success: true,
        message: 'Swipe undone',
      });

      // Verify swipe is deleted
      const swipesRes = await request(app.getHttpServer())
        .get(`${baseUrl}/my-swipes`)
        .set('Cookie', [alice.token]);

      expect(swipesRes.body.length).toBe(0);
    });

    it('should not allow undo after match is formed', async () => {
      const alice = users[0];
      const bob = users[1];

      // Create mutual match
      await request(app.getHttpServer())
        .post(`${baseUrl}/${alice.id}/LIKE`)
        .set('Cookie', [bob.token]);

      await request(app.getHttpServer())
        .post(`${baseUrl}/${bob.id}/LIKE`)
        .set('Cookie', [alice.token]);

      // Try to undo - should fail
      const res = await request(app.getHttpServer())
        .delete(`${baseUrl}/undo`)
        .set('Cookie', [alice.token]);

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty('message');
    });

    it('should return 404 when no swipes to undo', async () => {
      const charlie = users[2];

      const res = await request(app.getHttpServer())
        .delete(`${baseUrl}/undo`)
        .set('Cookie', [charlie.token]);

      expect(res.status).toBe(404);
    });
  });
});
