import { z } from 'zod'

export const contactSchema = z.object({
  name: z.string().min(1, 'Name required').max(100),
  email: z.string().email('Invalid email'),
  subject: z.string().min(1, 'Subject required').max(200),
  message: z.string().min(10, 'Message too short').max(5000),
})
