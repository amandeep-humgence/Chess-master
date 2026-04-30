export const dynamic = 'force-dynamic'

import type { NextRequest } from 'next/server'
import { postDb } from '@/lib/db/post'
import { requireAdmin } from '@/lib/auth-server'
import { successResponse, handleError } from '@/lib/api-helpers'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()
    const page = parseInt(request.nextUrl.searchParams.get('page') ?? '1')
    const limit = parseInt(request.nextUrl.searchParams.get('limit') ?? '20')
    const skip = (page - 1) * limit

    const posts = await postDb.findAllForAdmin(skip, limit)
    return successResponse({ data: posts, page, limit })
  } catch (err) {
    return handleError(err)
  }
}
