import { prisma } from '../config/prisma'

export const contactRepository = {
  create: (data: { name: string; email: string; subject: string; message: string }) =>
    prisma.contactMessage.create({ data }),

  findAll: (skip: number, take: number) =>
    prisma.contactMessage.findMany({
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    }),

  countAll: () => prisma.contactMessage.count(),

  markRead: (id: string) =>
    prisma.contactMessage.update({ where: { id }, data: { isRead: true } }),

  countUnread: () => prisma.contactMessage.count({ where: { isRead: false } }),
}
