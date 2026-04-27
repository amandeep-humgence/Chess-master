import { tournamentRepository } from '../repositories/tournament.repository'
import type { CreateTournamentPayload, UpdateTournamentPayload } from '../types'

export const tournamentService = {
  async list(status?: string) {
    return tournamentRepository.findAll(status)
  },

  async getById(id: string) {
    const tournament = await tournamentRepository.findById(id)
    if (!tournament) throw new Error('Tournament not found')
    return tournament
  },

  async create(payload: CreateTournamentPayload, createdBy: string) {
    return tournamentRepository.create({
      ...payload,
      startDate: new Date(payload.startDate),
      endDate: new Date(payload.endDate),
      createdBy,
    })
  },

  async update(id: string, payload: UpdateTournamentPayload) {
    const existing = await tournamentRepository.findById(id)
    if (!existing) throw new Error('Tournament not found')

    const updateData: Parameters<typeof tournamentRepository.update>[1] = {
      title: payload.title,
      description: payload.description,
      location: payload.location,
      entryFee: payload.entryFee,
      prizePool: payload.prizePool,
      maxPlayers: payload.maxPlayers,
      status: payload.status,
      ...(payload.startDate && { startDate: new Date(payload.startDate) }),
      ...(payload.endDate && { endDate: new Date(payload.endDate) }),
    }

    return tournamentRepository.update(id, updateData)
  },

  async delete(id: string) {
    const existing = await tournamentRepository.findById(id)
    if (!existing) throw new Error('Tournament not found')
    return tournamentRepository.delete(id)
  },
}
