import { Router } from 'express'
import { adminController } from '../controllers/admin.controller'
import { contactController } from '../controllers/contact.controller'
import { authenticate, requireAdmin } from '../middlewares/auth.middleware'

const router = Router()

router.use(authenticate, requireAdmin)

router.get('/stats', adminController.getDashboardStats)
router.get('/users', adminController.listUsers)
router.get('/registrations', adminController.listRegistrations)
router.get('/payments', adminController.listPayments)
router.get('/posts', adminController.listPosts)
router.delete('/posts/:id', adminController.deletePost)
router.get('/contacts', contactController.listAll)
router.patch('/contacts/:id/read', contactController.markRead)

export default router
