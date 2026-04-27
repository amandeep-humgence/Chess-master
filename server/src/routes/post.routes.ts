import { Router } from 'express'
import { postController } from '../controllers/post.controller'
import { authenticate } from '../middlewares/auth.middleware'
import { validate } from '../middlewares/validate.middleware'
import { uploadSingle } from '../middlewares/upload.middleware'
import { createPostSchema, createCommentSchema } from '../validators/post.validators'

const router = Router()

router.get('/', postController.getFeed)
router.post('/', authenticate, uploadSingle, validate(createPostSchema), postController.createPost)
router.delete('/:id', authenticate, postController.deletePost)
router.post('/:id/like', authenticate, postController.likePost)
router.get('/:id/comments', postController.getComments)
router.post('/:id/comments', authenticate, validate(createCommentSchema), postController.addComment)

export default router
