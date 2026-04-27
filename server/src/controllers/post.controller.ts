import type { Request, Response } from 'express'
import { postService } from '../services/post.service'
import { sendSuccess, sendError } from '../utils/apiResponse'

export const postController = {
  async getFeed(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 10
      const userId = req.user?.id
      const result = await postService.getFeed(page, limit, userId)
      sendSuccess(res, result)
    } catch (err) {
      sendError(res, (err as Error).message)
    }
  },

  async createPost(req: Request, res: Response): Promise<void> {
    try {
      const post = await postService.create(req.user!.id, req.body.content, req.file)
      sendSuccess(res, post, 'Post created', 201)
    } catch (err) {
      sendError(res, (err as Error).message)
    }
  },

  async deletePost(req: Request, res: Response): Promise<void> {
    try {
      const isAdmin = req.user?.role === 'ADMIN'
      await postService.delete(req.params.id, req.user!.id, isAdmin)
      sendSuccess(res, null, 'Post deleted')
    } catch (err) {
      sendError(res, (err as Error).message, 403)
    }
  },

  async likePost(req: Request, res: Response): Promise<void> {
    try {
      const result = await postService.toggleLike(req.user!.id, req.params.id)
      sendSuccess(res, result)
    } catch (err) {
      sendError(res, (err as Error).message)
    }
  },

  async getComments(req: Request, res: Response): Promise<void> {
    try {
      const comments = await postService.getComments(req.params.id)
      sendSuccess(res, comments)
    } catch (err) {
      sendError(res, (err as Error).message)
    }
  },

  async addComment(req: Request, res: Response): Promise<void> {
    try {
      const comment = await postService.addComment(
        req.user!.id,
        req.params.id,
        req.body.content
      )
      sendSuccess(res, comment, 'Comment added', 201)
    } catch (err) {
      sendError(res, (err as Error).message)
    }
  },
}
