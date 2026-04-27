import { userRepository } from '../repositories/user.repository'
import { hashPassword, comparePassword } from '../utils/hashPassword'
import { signToken } from '../utils/jwt'
import type { RegisterPayload, LoginPayload } from '../types'

export const authService = {
  async register(payload: RegisterPayload) {
    const existing = await userRepository.findByEmail(payload.email)
    if (existing) throw new Error('Email already in use')

    const hashed = await hashPassword(payload.password)
    const user = await userRepository.create({
      email: payload.email,
      password: hashed,
      profile: {
        firstName: payload.firstName,
        lastName: payload.lastName,
      },
    })

    const token = signToken({ id: user.id, email: user.email, role: user.role as 'USER' | 'ADMIN' })
    return { user, token }
  },

  async login(payload: LoginPayload) {
    const user = await userRepository.findByEmail(payload.email)
    if (!user) throw new Error('Invalid email or password')

    const valid = await comparePassword(payload.password, user.password)
    if (!valid) throw new Error('Invalid email or password')

    const token = signToken({ id: user.id, email: user.email, role: user.role as 'USER' | 'ADMIN' })
    return { user, token }
  },

  async me(userId: string) {
    const user = await userRepository.findById(userId)
    if (!user) throw new Error('User not found')
    return user
  },
}
