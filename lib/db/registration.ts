import { prisma } from '@/lib/prisma'

export const registrationDb = {
  findByUserAndTournament: (userId: string, tournamentId: string) =>
    prisma.tournamentRegistration.findUnique({
      where: { userId_tournamentId: { userId, tournamentId } },
    }),

  create: (data: {
    userId: string
    tournamentId: string
    paymentId?: string
    status: string
  }) => prisma.tournamentRegistration.create({ data }),

  updateStatus: (id: string, status: string, paymentId?: string) =>
    prisma.tournamentRegistration.update({
      where: { id },
      data: { status, ...(paymentId && { paymentId }) },
    }),

  findByTournament: (tournamentId: string) =>
    prisma.tournamentRegistration.findMany({
      where: { tournamentId },
      include: {
        user: { include: { profile: true } },
        payment: true,
      },
    }),

  findByUser: (userId: string) =>
    prisma.tournamentRegistration.findMany({
      where: { userId },
      include: { tournament: true, payment: true },
      orderBy: { createdAt: 'desc' },
    }),

  listAll: (skip: number, take: number) =>
    prisma.tournamentRegistration.findMany({
      skip,
      take,
      include: {
        user: { include: { profile: true } },
        tournament: true,
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    }),

  countAll: () => prisma.tournamentRegistration.count(),
}
