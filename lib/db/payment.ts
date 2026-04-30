import { prisma } from '@/lib/prisma'

export const paymentDb = {
  create: (data: {
    userId: string
    tournamentId: string
    amount: number
    currency?: string
    razorpayOrderId: string
  }) => prisma.payment.create({ data }),

  findByRazorpayOrderId: (razorpayOrderId: string) =>
    prisma.payment.findUnique({ where: { razorpayOrderId } }),

  updateStatus: (
    id: string,
    data: { status: string; razorpayPaymentId?: string; razorpaySignature?: string }
  ) => prisma.payment.update({ where: { id }, data }),

  findUserHistory: (userId: string) =>
    prisma.payment.findMany({
      where: { userId },
      include: { tournament: true },
      orderBy: { createdAt: 'desc' },
    }),

  listAll: (skip: number, take: number) =>
    prisma.payment.findMany({
      skip,
      take,
      include: {
        user: { include: { profile: true } },
        tournament: true,
      },
      orderBy: { createdAt: 'desc' },
    }),

  countAll: () => prisma.payment.count(),

  totalRevenue: async () => {
    const result = await prisma.payment.aggregate({
      where: { status: 'PAID' },
      _sum: { amount: true },
    })
    return result._sum.amount ?? 0
  },
}
