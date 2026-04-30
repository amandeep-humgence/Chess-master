import type { NextRequest } from 'next/server'
import { postDb } from '@/lib/db/post'
import { getSession, requireAuth } from '@/lib/auth-server'
import { successResponse, errorResponse, handleError } from '@/lib/api-helpers'
import { createPostSchema } from '@/lib/validators/post'
import { saveUploadedFile } from '@/lib/upload'

export async function GET(request: NextRequest) {
  try {
    const page = parseInt(request.nextUrl.searchParams.get('page') ?? '1')
    const limit = parseInt(request.nextUrl.searchParams.get('limit') ?? '10')
    const skip = (page - 1) * limit

    const session = await getSession()
    const [posts, total] = await Promise.all([
      postDb.findAll(skip, limit, session?.id),
      postDb.count(),
    ])

    const data = posts.map((post) => ({
      ...post,
      isLikedByMe: session ? post.likes.length > 0 : false,
      likes: undefined,
    }))

    return successResponse({ data, total, page, limit, totalPages: Math.ceil(total / limit) })
  } catch (err) {
    return handleError(err)
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAuth()
    let content = ''
    let imageUrl: string | null = null

    const contentType = request.headers.get('content-type') || ''
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      content = String(formData.get('content') ?? '')
      imageUrl = await saveUploadedFile(formData, 'image')
    } else {
      const body = await request.json()
      content = body.content
    }

    const result = createPostSchema.safeParse({ content })
    if (!result.success) {
      const messages = result.error.errors.map((e) => e.message).join(', ')
      return errorResponse(`Validation failed: ${messages}`, 422)
    }

    const post = await postDb.create({
      userId: session.id,
      content: result.data.content,
      ...(imageUrl && { imageUrl }),
    })
    return successResponse(post, 'Post created', 201)
  } catch (err) {
    return handleError(err)
  }
}
