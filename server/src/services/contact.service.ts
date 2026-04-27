import { contactRepository } from '../repositories/contact.repository'
import type { ContactPayload } from '../types'

export const contactService = {
  async submit(data: ContactPayload) {
    return contactRepository.create(data)
  },

  async listAll(page: number, limit: number) {
    const skip = (page - 1) * limit
    const [messages, total] = await Promise.all([
      contactRepository.findAll(skip, limit),
      contactRepository.countAll(),
    ])
    return { data: messages, total, page, limit, totalPages: Math.ceil(total / limit) }
  },

  async markRead(id: string) {
    return contactRepository.markRead(id)
  },
}
