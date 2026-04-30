import { prisma } from '@/lib/prisma'

export const tournamentDb = {
  findAll: (status?: string) =>
    prisma.tournament.findMany({
      where: status ? { status } : undefined,
      orderBy: { startDate: 'asc' },
    }),

  findById: (id: string) =>
    prisma.tournament.findUnique({
      where: { id },
      include: { creator: { include: { profile: true } } },
    }),

  create: (data: {
    title: string
    description: string
    startDate: Date
    endDate: Date
    location: string
    entryFee: number
    prizePool: number
    maxPlayers: number
    createdBy: string
  }) => prisma.tournament.create({ data }),

  update: (
    id: string,
    data: Partial<{
      title: string
      description: string
      startDate: Date
      endDate: Date
      location: string
      entryFee: number
      prizePool: number
      maxPlayers: number
      status: string
    }>
  ) => prisma.tournament.update({ where: { id }, data }),

  incrementCurrentPlayers: (id: string) =>
    prisma.tournament.update({
      where: { id },
      data: { currentPlayers: { increment: 1 } },
    }),

  delete: (id: string) => prisma.tournament.delete({ where: { id } }),

  count: () => prisma.tournament.count(),

  countByStatus: (status: string) => prisma.tournament.count({ where: { status } }),
}
