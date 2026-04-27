import { Router } from 'express'
import { userController } from '../controllers/user.controller'
import { authenticate } from '../middlewares/auth.middleware'
import { validate } from '../middlewares/validate.middleware'
import { uploadSingle } from '../middlewares/upload.middleware'
import { updateProfileSchema } from '../validators/profile.validators'

const router = Router()

router.get('/me/profile', authenticate, userController.getProfile)
router.put('/me/profile', authenticate, uploadSingle, validate(updateProfileSchema), userController.updateProfile)
router.get('/:id', userController.getPublicProfile)
router.get('/:id/posts', userController.getUserPosts)

export default router
