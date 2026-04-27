import { z } from 'zod'

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  bio: z.string().max(500).optional(),
  phone: z.string().max(20).optional(),
  chessRating: z.number().int().min(0).max(3000).optional(),
})
