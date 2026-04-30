export const dynamic = 'force-dynamic'

import type { NextRequest } from 'next/server'
import { contactDb } from '@/lib/db/contact'
import { requireAdmin } from '@/lib/auth-server'
import { successResponse, handleError } from '@/lib/api-helpers'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()
    const page = parseInt(request.nextUrl.searchParams.get('page') ?? '1')
    const limit = parseInt(request.nextUrl.searchParams.get('limit') ?? '20')
    const skip = (page - 1) * limit

    const [messages, total] = await Promise.all([
      contactDb.findAll(skip, limit),
      contactDb.countAll(),
    ])
    return successResponse({ data: messages, total, page, limit, totalPages: Math.ceil(total / limit) })
  } catch (err) {
    return handleError(err)
  }
}
