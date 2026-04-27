import { prisma } from '../config/prisma'

export const userRepository = {
  findByEmail: (email: string) =>
    prisma.user.findUnique({ where: { email }, include: { profile: true } }),

  findById: (id: string) =>
    prisma.user.findUnique({ where: { id }, include: { profile: true } }),

  create: (data: {
    email: string
    password: string
    profile: { firstName: string; lastName: string }
  }) =>
    prisma.user.create({
      data: {
        email: data.email,
        password: data.password,
        profile: { create: data.profile },
      },
      include: { profile: true },
    }),

  updateProfile: (
    userId: string,
    data: {
      firstName?: string
      lastName?: string
      bio?: string
      phone?: string
      chessRating?: number
      avatar?: string
    }
  ) => prisma.profile.update({ where: { userId }, data }),

  listAll: (skip: number, take: number) =>
    prisma.user.findMany({
      skip,
      take,
      include: { profile: true },
      orderBy: { createdAt: 'desc' },
    }),

  countAll: () => prisma.user.count(),
}
