import type { Request, Response } from 'express'
import { tournamentService } from '../services/tournament.service'
import { registrationRepository } from '../repositories/registration.repository'
import { sendSuccess, sendError } from '../utils/apiResponse'

export const tournamentController = {
  async list(req: Request, res: Response): Promise<void> {
    try {
      const status = req.query.status as string | undefined
      const tournaments = await tournamentService.list(status)
      sendSuccess(res, tournaments)
    } catch (err) {
      sendError(res, (err as Error).message)
    }
  },

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const tournament = await tournamentService.getById(req.params.id)
      sendSuccess(res, tournament)
    } catch (err) {
      sendError(res, (err as Error).message, 404)
    }
  },

  async create(req: Request, res: Response): Promise<void> {
    try {
      const tournament = await tournamentService.create(req.body, req.user!.id)
      sendSuccess(res, tournament, 'Tournament created', 201)
    } catch (err) {
      sendError(res, (err as Error).message)
    }
  },

  async update(req: Request, res: Response): Promise<void> {
    try {
      const tournament = await tournamentService.update(req.params.id, req.body)
      sendSuccess(res, tournament, 'Tournament updated')
    } catch (err) {
      sendError(res, (err as Error).message, 404)
    }
  },

  async delete(req: Request, res: Response): Promise<void> {
    try {
      await tournamentService.delete(req.params.id)
      sendSuccess(res, null, 'Tournament deleted')
    } catch (err) {
      sendError(res, (err as Error).message, 404)
    }
  },

  async getRegistrations(req: Request, res: Response): Promise<void> {
    try {
      const registrations = await registrationRepository.findByTournament(req.params.id)
      sendSuccess(res, registrations)
    } catch (err) {
      sendError(res, (err as Error).message)
    }
  },
}
