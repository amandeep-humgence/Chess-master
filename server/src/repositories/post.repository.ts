import { prisma } from '../config/prisma'

export const postRepository = {
  findAll: (skip: number, take: number, requestingUserId?: string) =>
    prisma.post.findMany({
      where: { isDeleted: false },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { include: { profile: true } },
        likes: requestingUserId
          ? { where: { userId: requestingUserId }, take: 1 }
          : false,
      },
    }),

  count: () => prisma.post.count({ where: { isDeleted: false } }),

  create: (data: { userId: string; content: string; imageUrl?: string }) =>
    prisma.post.create({
      data,
      include: { user: { include: { profile: true } } },
    }),

  findById: (id: string) => prisma.post.findUnique({ where: { id } }),

  softDelete: (id: string) =>
    prisma.post.update({ where: { id }, data: { isDeleted: true } }),

  findLike: (userId: string, postId: string) =>
    prisma.postLike.findUnique({
      where: { userId_postId: { userId, postId } },
    }),

  addLike: (userId: string, postId: string) =>
    prisma.$transaction([
      prisma.postLike.create({ data: { userId, postId } }),
      prisma.post.update({
        where: { id: postId },
        data: { likesCount: { increment: 1 } },
      }),
    ]),

  removeLike: (userId: string, postId: string) =>
    prisma.$transaction([
      prisma.postLike.delete({ where: { userId_postId: { userId, postId } } }),
      prisma.post.update({
        where: { id: postId },
        data: { likesCount: { decrement: 1 } },
      }),
    ]),

  findComments: (postId: string) =>
    prisma.postComment.findMany({
      where: { postId },
      include: { user: { include: { profile: true } } },
      orderBy: { createdAt: 'asc' },
    }),

  createComment: (data: { userId: string; postId: string; content: string }) =>
    prisma.$transaction([
      prisma.postComment.create({
        data,
        include: { user: { include: { profile: true } } },
      } as Parameters<typeof prisma.postComment.create>[0]),
      prisma.post.update({
        where: { id: data.postId },
        data: { commentsCount: { increment: 1 } },
      }),
    ]),

  findByUser: (userId: string) =>
    prisma.post.findMany({
      where: { userId, isDeleted: false },
      orderBy: { createdAt: 'desc' },
      include: { user: { include: { profile: true } } },
    }),

  findAllForAdmin: (skip: number, take: number) =>
    prisma.post.findMany({
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: { user: { include: { profile: true } } },
    }),
}
