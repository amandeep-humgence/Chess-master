import { userRepository } from '../repositories/user.repository'
import { tournamentRepository } from '../repositories/tournament.repository'
import { registrationRepository } from '../repositories/registration.repository'
import { paymentRepository } from '../repositories/payment.repository'
import { postRepository } from '../repositories/post.repository'

export const adminService = {
  async getDashboardStats() {
    const [
      totalUsers,
      totalTournaments,
      totalRegistrations,
      totalRevenue,
      upcomingTournaments,
      activeTournaments,
    ] = await Promise.all([
      userRepository.countAll(),
      tournamentRepository.count(),
      registrationRepository.countAll(),
      paymentRepository.totalRevenue(),
      tournamentRepository.countByStatus('UPCOMING'),
      tournamentRepository.countByStatus('RUNNING'),
    ])

    return {
      totalUsers,
      totalTournaments,
      totalRegistrations,
      totalRevenue,
      upcomingTournaments,
      activeTournaments,
    }
  },

  async listUsers(page: number, limit: number) {
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

  async listRegistrations(page: number, limit: number) {
    const skip = (page - 1) * limit
    const [registrations, total] = await Promise.all([
      registrationRepository.listAll(skip, limit),
      registrationRepository.countAll(),
    ])
    return { data: registrations, total, page, limit, totalPages: Math.ceil(total / limit) }
  },

  async listPayments(page: number, limit: number) {
    const skip = (page - 1) * limit
    const [payments, total] = await Promise.all([
      paymentRepository.listAll(skip, limit),
      paymentRepository.countAll(),
    ])
    return { data: payments, total, page, limit, totalPages: Math.ceil(total / limit) }
  },

  async listPosts(page: number, limit: number) {
    const skip = (page - 1) * limit
    const posts = await postRepository.findAllForAdmin(skip, limit)
    return { data: posts, page, limit }
  },

  async deletePost(postId: string) {
    const post = await postRepository.findById(postId)
    if (!post) throw new Error('Post not found')
    return postRepository.softDelete(postId)
  },
}
