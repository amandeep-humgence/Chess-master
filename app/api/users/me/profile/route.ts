export const dynamic = 'force-dynamic'

import { userDb } from '@/lib/db/user'
import { requireAuth } from '@/lib/auth-server'
import { successResponse, errorResponse, handleError } from '@/lib/api-helpers'
import { updateProfileSchema } from '@/lib/validators/profile'
import { saveUploadedFile } from '@/lib/upload'

export async function GET() {
  try {
    const session = await requireAuth()
    const user = await userDb.findById(session.id)
    if (!user) return errorResponse('User not found', 404)
    const { password: _p, ...safeUser } = user
    return successResponse(safeUser)
  } catch (err) {
    return handleError(err)
  }
}

export async function PUT(request: Request) {
  try {
    const session = await requireAuth()

    let data: Record<string, unknown> = {}
    let avatarUrl: string | null = null

    const contentType = request.headers.get('content-type') || ''
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      avatarUrl = await saveUploadedFile(formData, 'image')
      const fields = ['firstName', 'lastName', 'bio', 'phone', 'chessRating']
      for (const field of fields) {
        const val = formData.get(field)
        if (val !== null) {
          data[field] = field === 'chessRating' ? Number(val) : String(val)
        }
      }
    } else {
      data = await request.json()
    }

    const result = updateProfileSchema.safeParse(data)
    if (!result.success) {
      const messages = result.error.errors.map((e) => e.message).join(', ')
      return errorResponse(`Validation failed: ${messages}`, 422)
    }

    const updateData = { ...result.data, ...(avatarUrl && { avatar: avatarUrl }) }
    const profile = await userDb.updateProfile(session.id, updateData)
    return successResponse(profile, 'Profile updated')
  } catch (err) {
    return handleError(err)
  }
}
