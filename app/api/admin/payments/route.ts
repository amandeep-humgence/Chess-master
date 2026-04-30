export const dynamic = 'force-dynamic'

import type { NextRequest } from 'next/server'
import { paymentDb } from '@/lib/db/payment'
import { requireAdmin } from '@/lib/auth-server'
import { successResponse, handleError } from '@/lib/api-helpers'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()
    const page = parseInt(request.nextUrl.searchParams.get('page') ?? '1')
    const limit = parseInt(request.nextUrl.searchParams.get('limit') ?? '20')
    const skip = (page - 1) * limit

    const [payments, total] = await Promise.all([
      paymentDb.listAll(skip, limit),
      paymentDb.countAll(),
    ])
    return successResponse({ data: payments, total, page, limit, totalPages: Math.ceil(total / limit) })
  } catch (err) {
    return handleError(err)
  }
}
