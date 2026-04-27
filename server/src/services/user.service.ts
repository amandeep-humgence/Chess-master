import { userRepository } from '../repositories/user.repository'
import { postRepository } from '../repositories/post.repository'
import type { UpdateProfilePayload } from '../types'
import path from 'path'

export const userService = {
  async getProfile(userId: string) {
    const user = await userRepository.findById(userId)
    if (!user) throw new Error('User not found')
    return user
  },

  async updateProfile(
    userId: string,
    data: UpdateProfilePayload,
    avatarFile?: Express.Multer.File
  ) {
    const user = await userRepository.findById(userId)
    if (!user) throw new Error('User not found')

    const updateData: Parameters<typeof userRepository.updateProfile>[1] = { ...data }

    if (avatarFile) {
      updateData.avatar = `/uploads/${path.basename(avatarFile.path)}`
    }

    return userRepository.updateProfile(userId, updateData)
  },

  async getPublicProfile(userId: string) {
    const user = await userRepository.findById(userId)
    if (!user) throw new Error('User not found')
    const { password: _password, ...safeUser } = user
    return safeUser
  },

  async getUserPosts(userId: string) {
    return postRepository.findByUser(userId)
  },

  async listAll(page: number, limit: number) {
    const skip = (page - 1) * limit
    const [users, total] = await Promise.all([
      userRepository.listAll(skip, limit),
      userRepository.countAll(),
    ])
    return {
      data: users.map(({ password: _p, ...u }) => u),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  },
}
