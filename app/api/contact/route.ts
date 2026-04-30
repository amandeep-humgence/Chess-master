export const dynamic = 'force-dynamic'

import { contactDb } from '@/lib/db/contact'
import { successResponse, errorResponse } from '@/lib/api-helpers'
import { contactSchema } from '@/lib/validators/contact'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const result = contactSchema.safeParse(body)
    if (!result.success) {
      const messages = result.error.errors.map((e) => e.message).join(', ')
      return errorResponse(`Validation failed: ${messages}`, 422)
    }

    await contactDb.create(result.data)
    return successResponse(null, 'Message sent successfully', 201)
  } catch (err) {
    return errorResponse((err as Error).message)
  }
}
