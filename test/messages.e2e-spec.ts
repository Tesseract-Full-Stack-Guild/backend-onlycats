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

describe('Messages (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const baseUrl = '/messages';

  const users: TestUser[] = [];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser()); // needed for JwtStrategy to read cookies
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);

    // Clean up any existing test data to make tests idempotent
    await prisma.user.deleteMany({
      where: { username: { in: ['alice', 'bob', 'charlie'] } },
    });

    // Create test users and profiles
    const passwordHash = await bcrypt.hash('password123', 10);

    const [userA, userB, userC] = await Promise.all([
      prisma.user.create({
        data: {
          username: 'alice',
          email: 'alice@example.com',
          passwordHash,
          role: 'USER',
        },
      }),
      prisma.user.create({
        data: {
          username: 'bob',
          email: 'bob@example.com',
          passwordHash,
          role: 'USER',
        },
      }),
      prisma.user.create({
        data: {
          username: 'charlie',
          email: 'charlie@example.com',
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

    // Create match between Alice and Bob (mutual like)
    await prisma.match.create({
      data: {
        initiatorId: userA.id,
        targetId: userB.id,
      },
    });

    // Create a message from Alice to Bob
    await prisma.message.createMany({
      data: [
        {
          matchId: undefined, // will set after match ID known
          senderId: userA.id,
          receiverId: userB.id,
          content: 'Hey Bob!',
          readAt: null,
        },
      ],
    });

    // Actually retrieve the match to get its ID and set message correctly
    const match = await prisma.match.findFirst({
      where: {
        OR: [
          { initiatorId: userA.id, targetId: userB.id },
          { initiatorId: userB.id, targetId: userA.id },
        ],
      },
    });

    if (match) {
      // Update the message to have correct matchId
      await prisma.message.updateMany({
        where: {
          senderId: userA.id,
          receiverId: userB.id,
          matchId: null,
        },
        data: { matchId: match.id },
      });
    }

    // Obtain JWT tokens for users (simulate login)
    const login = async (username: string, password: string) => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ usernameOrEmail: username, password })
        .expect(200);

      return res.headers['set-cookie'];
    };

    const cookiesA = await login('alice', 'password123');
    const cookiesB = await login('bob', 'password123');
    const cookiesC = await login('charlie', 'password123');

    users.push(
      { ...userA, token: cookiesA?.[0]?.split(';')[0] || '' },
      { ...userB, token: cookiesB?.[0]?.split(';')[0] || '' },
      { ...userC, token: cookiesC?.[0]?.split(';')[0] || '' },
    );
  });

  afterAll(async () => {
    // Cleanup test data
    await prisma.message.deleteMany({});
    await prisma.match.deleteMany({});
    await prisma.profile.deleteMany({});
    await prisma.user.deleteMany({
      where: { username: { in: ['alice', 'bob', 'charlie'] } },
    });
    await prisma.$disconnect();
    await app.close();
  });

  describe('GET /messages (conversations list)', () => {
    it('should list conversations', async () => {
      const res = await request(app.getHttpServer())
        .get(baseUrl)
        .set('Cookie', [users[0].token])
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('matchId');
      expect(res.body[0]).toHaveProperty('otherUser');
      expect(res.body[0]).toHaveProperty('lastMessage');
      expect(res.body[0]).toHaveProperty('unreadCount');
    });
  });

  describe('GET /messages/match/:matchId', () => {
    it('should retrieve messages for a match', async () => {
      const alice = users[0];
      const bob = users[1];

      // Find the match ID via service or DB
      const match = await prisma.match.findFirst({
        where: {
          OR: [
            { initiatorId: alice.id, targetId: bob.id },
            { initiatorId: bob.id, targetId: alice.id },
          ],
        },
      });

      expect(match).toBeDefined();

      const res = await request(app.getHttpServer())
        .get(`${baseUrl}/match/${match!.id}`)
        .set('Cookie', [alice.token])
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('content');
      expect(res.body[0]).toHaveProperty('senderId');
      expect(res.body[0]).toHaveProperty('receiverId');
    });

    it('should 403 if user not in match', async () => {
      const charlie = users[2];
      const randomMatchId = 'nonexistent';

      await request(app.getHttpServer())
        .get(`${baseUrl}/match/${randomMatchId}`)
        .set('Cookie', [charlie.token])
        .expect(404);
    });
  });

  describe('POST /messages', () => {
    it('should send message by matchId', async () => {
      const bob = users[1];
      const alice = users[0];

      const match = await prisma.match.findFirst({
        where: {
          OR: [
            { initiatorId: alice.id, targetId: bob.id },
            { initiatorId: bob.id, targetId: alice.id },
          ],
        },
      });

      const res = await request(app.getHttpServer())
        .post(baseUrl)
        .set('Cookie', [alice.token])
        .send({ matchId: match!.id, content: 'Hello from Alice!' })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.content).toBe('Hello from Alice!');
      expect(res.body.senderId).toBe(alice.id);
      expect(res.body.receiverId).toBe(bob.id);
    });

    it('should send message by receiverId (without existing match)', async () => {
      const charlie = users[2];
      const alice = users[0];

      const res = await request(app.getHttpServer())
        .post(baseUrl)
        .set('Cookie', [charlie.token])
        .send({ receiverId: alice.id, content: 'Hi Alice!' })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.content).toBe('Hi Alice!');
      expect(res.body.senderId).toBe(charlie.id);
      expect(res.body.receiverId).toBe(alice.id);
    });

    it('should reject message with both matchId and receiverId', async () => {
      const alice = users[0];
      const bob = users[1];
      const match = await prisma.match.findFirst({
        where: { OR: [{ initiatorId: alice.id, targetId: bob.id }] },
      });

      await request(app.getHttpServer())
        .post(baseUrl)
        .set('Cookie', [alice.token])
        .send({ matchId: match!.id, receiverId: bob.id, content: 'bad' })
        .expect(400);
    });

    it('should reject message with neither matchId nor receiverId', async () => {
      const alice = users[0];
      await request(app.getHttpServer())
        .post(baseUrl)
        .set('Cookie', [alice.token])
        .send({ content: 'orphan' })
        .expect(400);
    });
  });

  describe('PATCH /messages/:messageId/read', () => {
    it('should mark message as read', async () => {
      const bob = users[1];
      const alice = users[0];

      // Get a message sent to Bob
      const message = await prisma.message.findFirst({
        where: { receiverId: bob.id },
      });

      expect(message).toBeDefined();

      const res = await request(app.getHttpServer())
        .patch(`${baseUrl}/${message!.id}/read`)
        .set('Cookie', [bob.token])
        .expect(200);

      expect(res.body.success).toBe(true);

      // Verify readAt is set
      const updated = await prisma.message.findUnique({
        where: { id: message!.id },
      });
      expect(updated?.readAt).not.toBeNull();
    });

    it('should 403 if receiver tries to mark someone else message', async () => {
      const charlie = users[2];
      const message = await prisma.message.findFirst({
        where: { senderId: users[0].id, receiverId: users[1].id },
      });

      await request(app.getHttpServer())
        .patch(`${baseUrl}/${message!.id}/read`)
        .set('Cookie', [charlie.token])
        .expect(403);
    });
  });

  describe('PATCH /messages/match/:matchId/read', () => {
    it('should mark all messages in match as read', async () => {
      const bob = users[1];
      const alice = users[0];

      const match = await prisma.match.findFirst({
        where: { OR: [{ initiatorId: alice.id, targetId: bob.id }] },
      });

      const res = await request(app.getHttpServer())
        .patch(`/messages/match/${match!.id}/read`)
        .set('Cookie', [bob.token])
        .expect(200);

      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /messages/unread/count', () => {
    it('should return unread count', async () => {
      const alice = users[0];
      const res = await request(app.getHttpServer())
        .get(`${baseUrl}/unread/count`)
        .set('Cookie', [alice.token])
        .expect(200);

      expect(res.body).toHaveProperty('count');
      expect(typeof res.body.count).toBe('number');
    });
  });

  describe('DELETE /messages/:messageId', () => {
    it('should delete message by sender', async () => {
      const alice = users[0];
      const message = await prisma.message.findFirst({
        where: { senderId: alice.id },
      });

      await request(app.getHttpServer())
        .delete(`${baseUrl}/${message!.id}`)
        .set('Cookie', [alice.token])
        .expect(200);

      const deleted = await prisma.message.findUnique({
        where: { id: message!.id },
      });
      expect(deleted).toBeNull();
    });

    it('should 403 if unauthorized user tries to delete', async () => {
      const charlie = users[2];
      const message = await prisma.message.findFirst({
        where: { senderId: users[0].id, receiverId: users[1].id },
      });

      await request(app.getHttpServer())
        .delete(`${baseUrl}/${message!.id}`)
        .set('Cookie', [charlie.token])
        .expect(403);
    });
  });
});
