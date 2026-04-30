export const dynamic = 'force-dynamic'

import type { NextRequest } from 'next/server'
import { userDb } from '@/lib/db/user'
import { requireAdmin } from '@/lib/auth-server'
import { successResponse, handleError } from '@/lib/api-helpers'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()
    const page = parseInt(request.nextUrl.searchParams.get('page') ?? '1')
    const limit = parseInt(request.nextUrl.searchParams.get('limit') ?? '20')
    const skip = (page - 1) * limit

    const [users, total] = await Promise.all([userDb.listAll(skip, limit), userDb.countAll()])
    return successResponse({
      data: users.map(({ password: _p, ...u }) => u),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (err) {
    return handleError(err)
  }
}
