import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const tournaments = [
  {
    title: 'Mumbai Open 2026',
    description: 'Annual open chess tournament for all skill levels. Players of all ratings are welcome to compete in this prestigious event held in the heart of Mumbai.',
    startDate: new Date('2026-06-01T09:00:00Z'),
    endDate: new Date('2026-06-05T18:00:00Z'),
    location: 'Mumbai, Maharashtra',
    entryFee: 500,
    prizePool: 50000,
    maxPlayers: 64,
  },
  {
    title: 'Delhi Rapid Championship 2026',
    description: 'Rapid format tournament with G/15 time control. Fast-paced exciting chess for experienced players looking for a competitive challenge.',
    startDate: new Date('2026-07-10T10:00:00Z'),
    endDate: new Date('2026-07-12T17:00:00Z'),
    location: 'New Delhi',
    entryFee: 300,
    prizePool: 25000,
    maxPlayers: 32,
  },
  {
    title: 'Bangalore Blitz 2026',
    description: 'Intense blitz chess tournament. 5+2 time control. Perfect for players who enjoy fast-paced tactical battles.',
    startDate: new Date('2026-08-20T11:00:00Z'),
    endDate: new Date('2026-08-21T19:00:00Z'),
    location: 'Bangalore, Karnataka',
    entryFee: 200,
    prizePool: 15000,
    maxPlayers: 48,
  },
]

async function main() {
  const hashedPassword = await bcrypt.hash('Admin@123456', 12)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@chessmaster.com' },
    update: {},
    create: {
      email: 'admin@chessmaster.com',
      password: hashedPassword,
      role: 'ADMIN',
      profile: {
        create: {
          firstName: 'Chess',
          lastName: 'Admin',
          bio: 'Platform administrator',
          chessRating: 2200,
        },
      },
    },
  })

  // SQLite does not support skipDuplicates in createMany, so use upsert per row
  for (const t of tournaments) {
    await prisma.tournament.upsert({
      where: { id: `seed_${t.title.replace(/\s+/g, '_').toLowerCase()}` },
      update: {},
      create: {
        id: `seed_${t.title.replace(/\s+/g, '_').toLowerCase()}`,
        ...t,
        currentPlayers: 0,
        status: 'UPCOMING',
        createdBy: admin.id,
      },
    })
  }

  console.log('Seed complete.')
  console.log('Admin account: admin@chessmaster.com / Admin@123456')
  console.log('Created 3 sample tournaments.')
}

main()
  .catch((e) => {
    console.error('Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
