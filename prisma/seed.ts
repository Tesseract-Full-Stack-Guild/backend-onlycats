import 'dotenv/config';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcrypt';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter } as any);

// ── Seed data ────────────────────────────────────────────────────────────────

const DORMS = ['Stirling Hall', 'Stirling Tower', 'Maple House', 'Oak House', 'Cedar Block', 'Pine Block'];
const MAJORS = ['Computer Science', 'Psychology', 'Business', 'Biology', 'Engineering', 'Art', 'Mathematics', 'Philosophy'];
const COLLEGES = ['University of Cats', 'Paw State University'];
const INTERESTS_POOL = [
  'gaming', 'hiking', 'cooking', 'reading', 'music', 'photography',
  'travel', 'fitness', 'movies', 'art', 'coding', 'dancing',
  'yoga', 'coffee', 'anime', 'sports', 'writing', 'fashion',
  'cats', 'dogs', 'nature', 'astronomy', 'chess', 'podcasts',
];

function pick<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ── Mock users ───────────────────────────────────────────────────────────────

const USERS = [
  // Males seeking females
  { username: 'alex_m',    email: 'alex@seed.dev',    name: 'Alex',    age: 20, gender: 'MALE',       seeking: 'FEMALE',   major: 'Computer Science', year: 2, dorm: 'Stirling Hall',  interests: ['gaming', 'coding', 'anime', 'coffee', 'music'] },
  { username: 'ben_m',     email: 'ben@seed.dev',     name: 'Ben',     age: 21, gender: 'MALE',       seeking: 'FEMALE',   major: 'Engineering',      year: 3, dorm: 'Stirling Tower', interests: ['fitness', 'sports', 'cooking', 'travel', 'music'] },
  { username: 'carlos_m',  email: 'carlos@seed.dev',  name: 'Carlos',  age: 22, gender: 'MALE',       seeking: 'FEMALE',   major: 'Business',         year: 4, dorm: 'Oak House',      interests: ['travel', 'photography', 'coffee', 'fashion', 'movies'] },
  { username: 'dan_m',     email: 'dan@seed.dev',     name: 'Dan',     age: 19, gender: 'MALE',       seeking: 'FEMALE',   major: 'Mathematics',      year: 1, dorm: 'Maple House',    interests: ['chess', 'coding', 'reading', 'astronomy', 'podcasts'] },
  { username: 'ethan_m',   email: 'ethan@seed.dev',   name: 'Ethan',   age: 21, gender: 'MALE',       seeking: 'EVERYONE', major: 'Art',              year: 3, dorm: 'Cedar Block',    interests: ['art', 'music', 'photography', 'dancing', 'cats'] },
  { username: 'felix_m',   email: 'felix@seed.dev',   name: 'Felix',   age: 20, gender: 'MALE',       seeking: 'MALE',     major: 'Philosophy',       year: 2, dorm: 'Pine Block',     interests: ['reading', 'writing', 'coffee', 'podcasts', 'chess'] },
  { username: 'george_m',  email: 'george@seed.dev',  name: 'George',  age: 23, gender: 'MALE',       seeking: 'FEMALE',   major: 'Biology',          year: 4, dorm: 'Oak House',      interests: ['nature', 'hiking', 'fitness', 'cooking', 'dogs'] },
  { username: 'henry_m',   email: 'henry@seed.dev',   name: 'Henry',   age: 19, gender: 'MALE',       seeking: 'EVERYONE', major: 'Computer Science', year: 1, dorm: 'Stirling Hall',  interests: ['gaming', 'anime', 'coding', 'cats', 'music'] },

  // Females seeking males
  { username: 'alice_f',   email: 'alice@seed.dev',   name: 'Alice',   age: 20, gender: 'FEMALE',     seeking: 'MALE',     major: 'Computer Science', year: 2, dorm: 'Maple House',    interests: ['coding', 'gaming', 'coffee', 'cats', 'music'] },
  { username: 'bella_f',   email: 'bella@seed.dev',   name: 'Bella',   age: 21, gender: 'FEMALE',     seeking: 'MALE',     major: 'Psychology',       year: 3, dorm: 'Cedar Block',    interests: ['yoga', 'reading', 'travel', 'photography', 'coffee'] },
  { username: 'claire_f',  email: 'claire@seed.dev',  name: 'Claire',  age: 22, gender: 'FEMALE',     seeking: 'MALE',     major: 'Art',              year: 4, dorm: 'Pine Block',     interests: ['art', 'photography', 'music', 'dancing', 'fashion'] },
  { username: 'diana_f',   email: 'diana@seed.dev',   name: 'Diana',   age: 19, gender: 'FEMALE',     seeking: 'EVERYONE', major: 'Biology',          year: 1, dorm: 'Oak House',      interests: ['nature', 'hiking', 'dogs', 'fitness', 'cooking'] },
  { username: 'emma_f',    email: 'emma@seed.dev',    name: 'Emma',    age: 21, gender: 'FEMALE',     seeking: 'MALE',     major: 'Business',         year: 3, dorm: 'Stirling Tower', interests: ['travel', 'fashion', 'coffee', 'movies', 'dancing'] },
  { username: 'fiona_f',   email: 'fiona@seed.dev',   name: 'Fiona',   age: 20, gender: 'FEMALE',     seeking: 'FEMALE',   major: 'Mathematics',      year: 2, dorm: 'Stirling Hall',  interests: ['chess', 'coding', 'astronomy', 'reading', 'podcasts'] },
  { username: 'grace_f',   email: 'grace@seed.dev',   name: 'Grace',   age: 23, gender: 'FEMALE',     seeking: 'MALE',     major: 'Engineering',      year: 4, dorm: 'Maple House',    interests: ['fitness', 'sports', 'coding', 'music', 'gaming'] },
  { username: 'hannah_f',  email: 'hannah@seed.dev',  name: 'Hannah',  age: 19, gender: 'FEMALE',     seeking: 'EVERYONE', major: 'Philosophy',       year: 1, dorm: 'Cedar Block',    interests: ['writing', 'reading', 'coffee', 'cats', 'yoga'] },

  // Non-binary / diverse
  { username: 'river_nb',  email: 'river@seed.dev',   name: 'River',   age: 21, gender: 'NON_BINARY', seeking: 'EVERYONE', major: 'Art',              year: 3, dorm: 'Pine Block',     interests: ['art', 'music', 'photography', 'nature', 'yoga'] },
  { username: 'sage_nb',   email: 'sage@seed.dev',    name: 'Sage',    age: 20, gender: 'NON_BINARY', seeking: 'EVERYONE', major: 'Psychology',       year: 2, dorm: 'Oak House',      interests: ['reading', 'writing', 'coffee', 'cats', 'podcasts'] },

  // Same-major-only users (for testing that filter)
  { username: 'max_cs',    email: 'max@seed.dev',     name: 'Max',     age: 21, gender: 'MALE',       seeking: 'EVERYONE', major: 'Computer Science', year: 3, dorm: 'Stirling Hall',  interests: ['coding', 'gaming', 'chess', 'anime', 'coffee'], sameMajorOnly: true },
  { username: 'nina_cs',   email: 'nina@seed.dev',    name: 'Nina',    age: 20, gender: 'FEMALE',     seeking: 'EVERYONE', major: 'Computer Science', year: 2, dorm: 'Stirling Tower', interests: ['coding', 'gaming', 'music', 'cats', 'coffee'], sameMajorOnly: true },
];

async function main() {
  console.log('🌱 Seeding database...');

  const passwordHash = await bcrypt.hash('password123', 12);

  let created = 0;
  let skipped = 0;

  for (const u of USERS) {
    // Skip if user already exists
    const existing = await prisma.user.findUnique({ where: { username: u.username } });
    if (existing) {
      console.log(`  ⏭  Skipping ${u.username} (already exists)`);
      skipped++;
      continue;
    }

    const user = await prisma.user.create({
      data: {
        username: u.username,
        email: u.email,
        passwordHash,
        lastActive: new Date(Date.now() - randInt(0, 47) * 60 * 60 * 1000), // 0–47h ago (within recency boost window)
        profile: {
          create: {
            name: u.name,
            age: u.age,
            gender: u.gender as any,
            seeking: u.seeking as any,
            bio: `Hi, I'm ${u.name}! ${u.major} student, year ${u.year}. Love ${u.interests.slice(0, 2).join(' and ')}.`,
            location: 'Campus',
            college: rand(COLLEGES),
            major: u.major,
            course: u.major,
            year: u.year,
            dorm: u.dorm,
            sameMajorOnly: (u as any).sameMajorOnly ?? false,
            interests: u.interests,
          },
        },
      },
    });

    console.log(`  ✅ Created ${u.username} (${u.gender}, seeking ${u.seeking}, major: ${u.major})`);
    created++;
  }

  console.log(`\n✨ Done — ${created} created, ${skipped} skipped.`);
  console.log('\nTest credentials: any username above, password: password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
