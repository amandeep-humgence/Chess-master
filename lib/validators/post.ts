import { z } from 'zod'

export const createPostSchema = z.object({
  content: z.string().min(1, 'Content required').max(2000),
})

export const createCommentSchema = z.object({
  content: z.string().min(1, 'Comment required').max(1000),
})
