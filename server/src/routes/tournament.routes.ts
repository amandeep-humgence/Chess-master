import { Router } from 'express'
import { tournamentController } from '../controllers/tournament.controller'
import { authenticate, requireAdmin } from '../middlewares/auth.middleware'
import { validate } from '../middlewares/validate.middleware'
import {
  createTournamentSchema,
  updateTournamentSchema,
} from '../validators/tournament.validators'
import { registrationRepository } from '../repositories/registration.repository'
import { sendSuccess, sendError } from '../utils/apiResponse'

const router = Router()

router.get('/', tournamentController.list)
router.get('/registrations/mine', authenticate, async (req, res) => {
  try {
    const registrations = await registrationRepository.findByUser(req.user!.id)
    sendSuccess(res, registrations)
  } catch (err) {
    sendError(res, (err as Error).message)
  }
})
router.get('/:id', tournamentController.getById)
router.post('/', authenticate, requireAdmin, validate(createTournamentSchema), tournamentController.create)
router.put('/:id', authenticate, requireAdmin, validate(updateTournamentSchema), tournamentController.update)
router.delete('/:id', authenticate, requireAdmin, tournamentController.delete)
router.get('/:id/registrations', authenticate, requireAdmin, tournamentController.getRegistrations)

export default router
