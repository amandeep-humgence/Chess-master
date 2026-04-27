import type { Request, Response, NextFunction } from 'express'
import type { ZodSchema } from 'zod'
import { sendError } from '../utils/apiResponse'

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
      const messages = result.error.errors.map((e) => e.message).join(', ')
      sendError(res, 'Validation failed', 422, messages)
      return
    }
    req.body = result.data
    next()
  }
}
