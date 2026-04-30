import { z } from 'zod'

export const createTournamentSchema = z.object({
  title: z.string().min(3, 'Title too short').max(200),
  description: z.string().min(10, 'Description too short'),
  startDate: z.string().datetime({ message: 'Invalid start date' }),
  endDate: z.string().datetime({ message: 'Invalid end date' }),
  location: z.string().min(2, 'Location required'),
  entryFee: z.number().nonnegative('Entry fee cannot be negative'),
  prizePool: z.number().nonnegative('Prize pool cannot be negative'),
  maxPlayers: z.number().int().min(2).max(1024),
})

export const updateTournamentSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().min(10).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  location: z.string().min(2).optional(),
  entryFee: z.number().nonnegative().optional(),
  prizePool: z.number().nonnegative().optional(),
  maxPlayers: z.number().int().min(2).max(1024).optional(),
  status: z.enum(['UPCOMING', 'RUNNING', 'PAST', 'CANCELLED']).optional(),
})
