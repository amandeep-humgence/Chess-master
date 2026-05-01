/**
 * Tests for GET/POST /api/posts, DELETE /api/posts/[id],
 * GET/POST /api/posts/[id]/comments, POST /api/posts/[id]/like
 */
import { GET as listPosts, POST as createPost } from '@/app/api/posts/route'
import { DELETE as deletePost } from '@/app/api/posts/[id]/route'
import { GET as getComments, POST as createComment } from '@/app/api/posts/[id]/comments/route'
import { POST as toggleLike } from '@/app/api/posts/[id]/like/route'

jest.mock('next/headers', () => ({
  cookies: jest.fn(() => Promise.resolve({ get: jest.fn(), set: jest.fn(), delete: jest.fn() })),
}))

jest.mock('@/lib/db/post', () => ({
  postDb: {
    findAll: jest.fn(),
    count: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    softDelete: jest.fn(),
    findComments: jest.fn(),
    createComment: jest.fn(),
    findLike: jest.fn(),
    addLike: jest.fn(),
    removeLike: jest.fn(),
  },
}))

jest.mock('@/lib/upload', () => ({ saveUploadedFile: jest.fn(() => Promise.resolve(null)) }))

jest.mock('@/lib/auth-server', () => ({
  ...jest.requireActual('@/lib/auth-server'),
  requireAuth: jest.fn(),
  getSession: jest.fn(),
}))

import { postDb } from '@/lib/db/post'
import { requireAuth, getSession } from '@/lib/auth-server'

const userSession = { id: 'user-1', email: 'user@chess.com', role: 'USER' }
const adminSession = { id: 'admin-1', email: 'admin@chess.com', role: 'ADMIN' }

const makePost = (overrides = {}) => ({
  id: 'post-1',
  userId: 'user-1',
  content: 'Just played a great game of chess!',
  imageUrl: null,
  isDeleted: false,
  likesCount: 0,
  commentsCount: 0,
  createdAt: new Date(),
  likes: [],
  ...overrides,
})

const makeNextRequest = (url: string, options?: RequestInit) =>
  Object.assign(new Request(url, options), { nextUrl: new URL(url) }) as any

// ─── GET /api/posts ───────────────────────────────────────────────────────────
describe('GET /api/posts', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns paginated posts for unauthenticated users', async () => {
    ;(getSession as jest.Mock).mockResolvedValue(null)
    ;(postDb.findAll as jest.Mock).mockResolvedValue([makePost()])
    ;(postDb.count as jest.Mock).mockResolvedValue(1)
    const req = makeNextRequest('http://localhost/api/posts')
    const res = await listPosts(req)
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.data.data).toHaveLength(1)
    expect(body.data.total).toBe(1)
  })

  it('marks posts as liked when user is authenticated and has liked them', async () => {
    ;(getSession as jest.Mock).mockResolvedValue(userSession)
    ;(postDb.findAll as jest.Mock).mockResolvedValue([makePost({ likes: [{ userId: 'user-1' }] })])
    ;(postDb.count as jest.Mock).mockResolvedValue(1)
    const req = makeNextRequest('http://localhost/api/posts')
    const res = await listPosts(req)
    const body = await res.json()
    expect(body.data.data[0].isLikedByMe).toBe(true)
  })

  it('respects page and limit query params', async () => {
    ;(getSession as jest.Mock).mockResolvedValue(null)
    ;(postDb.findAll as jest.Mock).mockResolvedValue([])
    ;(postDb.count as jest.Mock).mockResolvedValue(0)
    const req = makeNextRequest('http://localhost/api/posts?page=2&limit=5')
    await listPosts(req)
    expect(postDb.findAll).toHaveBeenCalledWith(5, 5, undefined)
  })
})

// ─── POST /api/posts ──────────────────────────────────────────────────────────
describe('POST /api/posts', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 401 when not authenticated', async () => {
    ;(requireAuth as jest.Mock).mockRejectedValue(new Error('UNAUTHORIZED'))
    const req = new Request('http://localhost/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: 'Hello chess world!' }),
    })
    const res = await createPost(req)
    expect(res.status).toBe(401)
  })

  it('returns 422 when content is empty', async () => {
    ;(requireAuth as jest.Mock).mockResolvedValue(userSession)
    const req = new Request('http://localhost/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: '' }),
    })
    const res = await createPost(req)
    expect(res.status).toBe(422)
  })

  it('creates post and returns 201', async () => {
    ;(requireAuth as jest.Mock).mockResolvedValue(userSession)
    ;(postDb.create as jest.Mock).mockResolvedValue(makePost())
    const req = new Request('http://localhost/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: 'Great chess match today!' }),
    })
    const res = await createPost(req)
    const body = await res.json()
    expect(res.status).toBe(201)
    expect(body.success).toBe(true)
  })
})

// ─── DELETE /api/posts/[id] ───────────────────────────────────────────────────
describe('DELETE /api/posts/[id]', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 401 when not authenticated', async () => {
    ;(requireAuth as jest.Mock).mockRejectedValue(new Error('UNAUTHORIZED'))
    const req = new Request('http://localhost/api/posts/post-1', { method: 'DELETE' })
    const res = await deletePost(req, { params: Promise.resolve({ id: 'post-1' }) })
    expect(res.status).toBe(401)
  })

  it('returns 404 when post does not exist', async () => {
    ;(requireAuth as jest.Mock).mockResolvedValue(userSession)
    ;(postDb.findById as jest.Mock).mockResolvedValue(null)
    const req = new Request('http://localhost/api/posts/ghost', { method: 'DELETE' })
    const res = await deletePost(req, { params: Promise.resolve({ id: 'ghost' }) })
    expect(res.status).toBe(404)
  })

  it('returns 403 when user tries to delete another user\'s post', async () => {
    ;(requireAuth as jest.Mock).mockResolvedValue(userSession)
    ;(postDb.findById as jest.Mock).mockResolvedValue(makePost({ userId: 'other-user' }))
    const req = new Request('http://localhost/api/posts/post-1', { method: 'DELETE' })
    const res = await deletePost(req, { params: Promise.resolve({ id: 'post-1' }) })
    expect(res.status).toBe(403)
  })

  it('allows user to delete their own post', async () => {
    ;(requireAuth as jest.Mock).mockResolvedValue(userSession)
    ;(postDb.findById as jest.Mock).mockResolvedValue(makePost({ userId: 'user-1' }))
    ;(postDb.softDelete as jest.Mock).mockResolvedValue(undefined)
    const req = new Request('http://localhost/api/posts/post-1', { method: 'DELETE' })
    const res = await deletePost(req, { params: Promise.resolve({ id: 'post-1' }) })
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.message).toBe('Post deleted')
  })

  it('allows admin to delete any post', async () => {
    ;(requireAuth as jest.Mock).mockResolvedValue(adminSession)
    ;(postDb.findById as jest.Mock).mockResolvedValue(makePost({ userId: 'other-user' }))
    ;(postDb.softDelete as jest.Mock).mockResolvedValue(undefined)
    const req = new Request('http://localhost/api/posts/post-1', { method: 'DELETE' })
    const res = await deletePost(req, { params: Promise.resolve({ id: 'post-1' }) })
    expect(res.status).toBe(200)
  })
})

// ─── GET /api/posts/[id]/comments ─────────────────────────────────────────────
describe('GET /api/posts/[id]/comments', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns comments for a post', async () => {
    ;(postDb.findComments as jest.Mock).mockResolvedValue([{ id: 'comment-1', content: 'Nice move!' }])
    const req = new Request('http://localhost/api/posts/post-1/comments')
    const res = await getComments(req, { params: Promise.resolve({ id: 'post-1' }) })
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.data).toHaveLength(1)
  })
})

// ─── POST /api/posts/[id]/comments ────────────────────────────────────────────
describe('POST /api/posts/[id]/comments', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 401 when not authenticated', async () => {
    ;(requireAuth as jest.Mock).mockRejectedValue(new Error('UNAUTHORIZED'))
    const req = new Request('http://localhost/api/posts/post-1/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: 'Great post!' }),
    })
    const res = await createComment(req, { params: Promise.resolve({ id: 'post-1' }) })
    expect(res.status).toBe(401)
  })

  it('returns 422 when comment content is empty', async () => {
    ;(requireAuth as jest.Mock).mockResolvedValue(userSession)
    const req = new Request('http://localhost/api/posts/post-1/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: '' }),
    })
    const res = await createComment(req, { params: Promise.resolve({ id: 'post-1' }) })
    expect(res.status).toBe(422)
  })

  it('returns 404 when post does not exist', async () => {
    ;(requireAuth as jest.Mock).mockResolvedValue(userSession)
    ;(postDb.findById as jest.Mock).mockResolvedValue(null)
    const req = new Request('http://localhost/api/posts/ghost/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: 'Hello!' }),
    })
    const res = await createComment(req, { params: Promise.resolve({ id: 'ghost' }) })
    expect(res.status).toBe(404)
  })

  it('creates comment and returns 201', async () => {
    ;(requireAuth as jest.Mock).mockResolvedValue(userSession)
    ;(postDb.findById as jest.Mock).mockResolvedValue(makePost())
    ;(postDb.createComment as jest.Mock).mockResolvedValue([{ id: 'comment-1', content: 'Great post!' }])
    const req = new Request('http://localhost/api/posts/post-1/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: 'Great post!' }),
    })
    const res = await createComment(req, { params: Promise.resolve({ id: 'post-1' }) })
    expect(res.status).toBe(201)
  })
})

// ─── POST /api/posts/[id]/like ─────────────────────────────────────────────────
describe('POST /api/posts/[id]/like (toggle)', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 401 when not authenticated', async () => {
    ;(requireAuth as jest.Mock).mockRejectedValue(new Error('UNAUTHORIZED'))
    const req = new Request('http://localhost/api/posts/post-1/like', { method: 'POST' })
    const res = await toggleLike(req, { params: Promise.resolve({ id: 'post-1' }) })
    expect(res.status).toBe(401)
  })

  it('returns 404 when post does not exist', async () => {
    ;(requireAuth as jest.Mock).mockResolvedValue(userSession)
    ;(postDb.findById as jest.Mock).mockResolvedValue(null)
    const req = new Request('http://localhost/api/posts/ghost/like', { method: 'POST' })
    const res = await toggleLike(req, { params: Promise.resolve({ id: 'ghost' }) })
    expect(res.status).toBe(404)
  })

  it('adds like when post is not yet liked', async () => {
    ;(requireAuth as jest.Mock).mockResolvedValue(userSession)
    ;(postDb.findById as jest.Mock).mockResolvedValue(makePost())
    ;(postDb.findLike as jest.Mock).mockResolvedValue(null)
    ;(postDb.addLike as jest.Mock).mockResolvedValue(undefined)
    const req = new Request('http://localhost/api/posts/post-1/like', { method: 'POST' })
    const res = await toggleLike(req, { params: Promise.resolve({ id: 'post-1' }) })
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.data.liked).toBe(true)
  })

  it('removes like when post is already liked', async () => {
    ;(requireAuth as jest.Mock).mockResolvedValue(userSession)
    ;(postDb.findById as jest.Mock).mockResolvedValue(makePost())
    ;(postDb.findLike as jest.Mock).mockResolvedValue({ userId: 'user-1', postId: 'post-1' })
    ;(postDb.removeLike as jest.Mock).mockResolvedValue(undefined)
    const req = new Request('http://localhost/api/posts/post-1/like', { method: 'POST' })
    const res = await toggleLike(req, { params: Promise.resolve({ id: 'post-1' }) })
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.data.liked).toBe(false)
  })
})
