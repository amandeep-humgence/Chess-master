import { postRepository } from '../repositories/post.repository'
import path from 'path'

export const postService = {
  async getFeed(page: number, limit: number, requestingUserId?: string) {
    const skip = (page - 1) * limit
    const [posts, total] = await Promise.all([
      postRepository.findAll(skip, limit, requestingUserId),
      postRepository.count(),
    ])

    const data = posts.map((post) => ({
      ...post,
      isLikedByMe: requestingUserId ? post.likes.length > 0 : false,
      likes: undefined,
    }))

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  },

  async create(userId: string, content: string, imageFile?: Express.Multer.File) {
    const imageUrl = imageFile ? `/uploads/${path.basename(imageFile.path)}` : undefined
    return postRepository.create({ userId, content, imageUrl })
  },

  async delete(postId: string, requesterId: string, isAdmin: boolean) {
    const post = await postRepository.findById(postId)
    if (!post) throw new Error('Post not found')
    if (!isAdmin && post.userId !== requesterId) {
      throw new Error('Forbidden — you can only delete your own posts')
    }
    return postRepository.softDelete(postId)
  },

  async toggleLike(userId: string, postId: string) {
    const post = await postRepository.findById(postId)
    if (!post || post.isDeleted) throw new Error('Post not found')

    const existing = await postRepository.findLike(userId, postId)
    if (existing) {
      await postRepository.removeLike(userId, postId)
      return { liked: false }
    } else {
      await postRepository.addLike(userId, postId)
      return { liked: true }
    }
  },

  async getComments(postId: string) {
    return postRepository.findComments(postId)
  },

  async addComment(userId: string, postId: string, content: string) {
    const post = await postRepository.findById(postId)
    if (!post || post.isDeleted) throw new Error('Post not found')
    const [comment] = await postRepository.createComment({ userId, postId, content })
    return comment
  },
}
