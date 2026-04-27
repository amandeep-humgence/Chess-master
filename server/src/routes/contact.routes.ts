import { Router } from 'express'
import { contactController } from '../controllers/contact.controller'
import { validate } from '../middlewares/validate.middleware'
import { contactSchema } from '../validators/contact.validators'

const router = Router()

router.post('/', validate(contactSchema), contactController.submit)

export default router
