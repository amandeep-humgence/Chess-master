'use client'

import { supabase } from './client'
import type {
  CommentDTO,
  ContactMessageDTO,
  ContactPayload,
  CreateTournamentPayload,
  DashboardStats,
  PaginatedResponse,
  PaymentDTO,
  PostDTO,
  ProfileDTO,
  RegistrationDTO,
  TournamentDTO,
  UpdateProfilePayload,
  UpdateTournamentPayload,
  UserDTO,
  UserRole,
} from '../../types'

// Supabase responses are intentionally mapped at the app boundary.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRow = Record<string, any>

function assertResult<T>(data: T | null, error: { message: string } | null): T {
  if (error) throw new Error(error.message)
  if (data === null) throw new Error('No data returned')
  return data
}

function paginate<T>(data: T[], page: number, limit: number): PaginatedResponse<T> {
  return {
    data,
    total: data.length,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(data.length / limit)),
  }
}

function toProfile(row: AnyRow | null | undefined): ProfileDTO | null {
  if (!row) return null
  return {
    id: row.id,
    userId: row.userId,
    firstName: row.firstName,
    lastName: row.lastName,
    avatar: row.avatar ?? null,
    bio: row.bio ?? null,
    phone: row.phone ?? null,
    chessRating: row.chessRating ?? null,
  }
}

function toUser(row: AnyRow): UserDTO {
  return {
    id: row.id,
    email: row.email,
    role: row.role as UserRole,
    createdAt: row.createdAt,
    profile: toProfile(Array.isArray(row.profiles) ? row.profiles[0] : row.profiles ?? row.profile),
  }
}

function toTournament(row: AnyRow): TournamentDTO {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    startDate: row.startDate,
    endDate: row.endDate,
    location: row.location,
    entryFee: Number(row.entryFee),
    prizePool: Number(row.prizePool),
    maxPlayers: Number(row.maxPlayers),
    currentPlayers: Number(row.currentPlayers ?? 0),
    status: row.status,
    createdBy: row.createdBy,
    createdAt: row.createdAt,
  }
}

function toPayment(row: AnyRow): PaymentDTO {
  return {
    id: row.id,
    userId: row.userId,
    tournamentId: row.tournamentId,
    amount: Number(row.amount),
    currency: row.currency,
    razorpayOrderId: row.razorpayOrderId ?? null,
    razorpayPaymentId: row.razorpayPaymentId ?? null,
    status: row.status,
    createdAt: row.createdAt,
    tournament: row.tournaments ? toTournament(row.tournaments) : undefined,
    ...(row.users ? { user: toUser(row.users) } : {}),
  } as PaymentDTO
}

function toRegistration(row: AnyRow): RegistrationDTO {
  return {
    id: row.id,
    userId: row.userId,
    tournamentId: row.tournamentId,
    paymentId: row.paymentId ?? null,
    status: row.status,
    createdAt: row.createdAt,
    tournament: row.tournaments ? toTournament(row.tournaments) : undefined,
    user: row.users ? toUser(row.users) : undefined,
  }
}

function toPost(row: AnyRow, requestingUserId?: string): PostDTO {
  const likes = Array.isArray(row.post_likes) ? row.post_likes : []
  return {
    id: row.id,
    userId: row.userId,
    content: row.content,
    imageUrl: row.imageUrl ?? null,
    likesCount: Number(row.likesCount ?? 0),
    commentsCount: Number(row.commentsCount ?? 0),
    createdAt: row.createdAt,
    isDeleted: Boolean(row.isDeleted),
    isLikedByMe: requestingUserId ? likes.some((like: AnyRow) => like.userId === requestingUserId) : false,
    author: {
      id: row.users?.id ?? row.userId,
      email: row.users?.email ?? '',
      profile: toProfile(row.users?.profiles),
    },
  }
}

function toComment(row: AnyRow): CommentDTO {
  return {
    id: row.id,
    userId: row.userId,
    postId: row.postId,
    content: row.content,
    createdAt: row.createdAt,
    author: {
      id: row.users?.id ?? row.userId,
      profile: toProfile(row.users?.profiles),
    },
  }
}

async function currentUserId() {
  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) throw new Error('Please sign in to continue')
  return data.user.id
}

async function currentUser() {
  const userId = await currentUserId()
  return users.getById(userId)
}

async function uploadPublicFile(bucket: string, file: File, prefix: string) {
  const ext = file.name.split('.').pop() || 'jpg'
  const path = `${prefix}/${crypto.randomUUID()}.${ext}`
  const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: false })
  if (error) throw new Error(error.message)
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

export const auth = {
  async login(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw new Error(error.message)
    return currentUser()
  },

  async register(input: { email: string; password: string; firstName: string; lastName: string }) {
    const { data, error } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: {
          firstName: input.firstName,
          lastName: input.lastName,
          role: 'USER',
        },
      },
    })
    if (error) throw new Error(error.message)
    if (!data.user) throw new Error('Account creation failed')
    return users.getById(data.user.id)
  },

  async me() {
    const { data } = await supabase.auth.getSession()
    if (!data.session) return null
    return currentUser()
  },

  async logout() {
    const { error } = await supabase.auth.signOut()
    if (error) throw new Error(error.message)
  },
}

export const users = {
  async getById(id: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*, profiles(*)')
      .eq('id', id)
      .single()
    return toUser(assertResult(data, error))
  },

  async list(page = 1, limit = 20) {
    const from = (page - 1) * limit
    const to = from + limit - 1
    const { data, error, count } = await supabase
      .from('users')
      .select('*, profiles(*)', { count: 'exact' })
      .order('createdAt', { ascending: false })
      .range(from, to)
    const rows = assertResult(data, error).map(toUser)
    return { data: rows, total: count ?? rows.length, page, limit, totalPages: Math.max(1, Math.ceil((count ?? rows.length) / limit)) }
  },

  async updateProfile(input: UpdateProfilePayload & { avatarFile?: File }) {
    const userId = await currentUserId()
    const avatar = input.avatarFile ? await uploadPublicFile('avatars', input.avatarFile, userId) : undefined
    const payload = {
      ...(input.firstName !== undefined && { firstName: input.firstName }),
      ...(input.lastName !== undefined && { lastName: input.lastName }),
      ...(input.bio !== undefined && { bio: input.bio }),
      ...(input.phone !== undefined && { phone: input.phone }),
      ...(input.chessRating !== undefined && { chessRating: input.chessRating }),
      ...(avatar && { avatar }),
    }
    const { error } = await supabase.from('profiles').update(payload).eq('userId', userId)
    if (error) throw new Error(error.message)
    return users.getById(userId)
  },
}

export const tournaments = {
  async list(status?: string) {
    let query = supabase.from('tournaments').select('*').order('startDate', { ascending: true })
    if (status) query = query.eq('status', status)
    const { data, error } = await query
    return assertResult(data, error).map(toTournament)
  },

  async get(id: string) {
    const { data, error } = await supabase.from('tournaments').select('*').eq('id', id).single()
    return toTournament(assertResult(data, error))
  },

  async create(input: CreateTournamentPayload) {
    const userId = await currentUserId()
    const { data, error } = await supabase
      .from('tournaments')
      .insert({ ...input, createdBy: userId })
      .select('*')
      .single()
    return toTournament(assertResult(data, error))
  },

  async update(id: string, input: UpdateTournamentPayload) {
    const { data, error } = await supabase.from('tournaments').update(input).eq('id', id).select('*').single()
    return toTournament(assertResult(data, error))
  },

  async remove(id: string) {
    const { error } = await supabase.from('tournaments').delete().eq('id', id)
    if (error) throw new Error(error.message)
  },
}

export const registrations = {
  async mine() {
    const userId = await currentUserId()
    const { data, error } = await supabase
      .from('tournament_registrations')
      .select('*, tournaments(*)')
      .eq('userId', userId)
      .order('createdAt', { ascending: false })
    return assertResult(data, error).map(toRegistration)
  },

  async list(page = 1, limit = 20) {
    const from = (page - 1) * limit
    const to = from + limit - 1
    const { data, error, count } = await supabase
      .from('tournament_registrations')
      .select('*, tournaments(*), users(*, profiles(*))', { count: 'exact' })
      .order('createdAt', { ascending: false })
      .range(from, to)
    const rows = assertResult(data, error).map(toRegistration)
    return { data: rows, total: count ?? rows.length, page, limit, totalPages: Math.max(1, Math.ceil((count ?? rows.length) / limit)) }
  },
}

export const payments = {
  async list(page = 1, limit = 20) {
    const from = (page - 1) * limit
    const to = from + limit - 1
    const { data, error, count } = await supabase
      .from('payments')
      .select('*, tournaments(*), users(*, profiles(*))', { count: 'exact' })
      .order('createdAt', { ascending: false })
      .range(from, to)
    const rows = assertResult(data, error).map(toPayment)
    return { data: rows, total: count ?? rows.length, page, limit, totalPages: Math.max(1, Math.ceil((count ?? rows.length) / limit)) }
  },
}

export const posts = {
  async feed(page = 1, limit = 10) {
    const userId = (await supabase.auth.getUser()).data.user?.id
    const from = (page - 1) * limit
    const to = from + limit - 1
    const { data, error, count } = await supabase
      .from('posts')
      .select('*, users(*, profiles(*)), post_likes(userId)', { count: 'exact' })
      .eq('isDeleted', false)
      .order('createdAt', { ascending: false })
      .range(from, to)
    const rows = assertResult(data, error).map((row) => toPost(row, userId))
    return { data: rows, total: count ?? rows.length, page, limit, totalPages: Math.max(1, Math.ceil((count ?? rows.length) / limit)) }
  },

  async byUser(userId: string) {
    const currentId = (await supabase.auth.getUser()).data.user?.id
    const { data, error } = await supabase
      .from('posts')
      .select('*, users(*, profiles(*)), post_likes(userId)')
      .eq('userId', userId)
      .eq('isDeleted', false)
      .order('createdAt', { ascending: false })
    return assertResult(data, error).map((row) => toPost(row, currentId))
  },

  async listAdmin(page = 1, limit = 20) {
    const from = (page - 1) * limit
    const to = from + limit - 1
    const { data, error, count } = await supabase
      .from('posts')
      .select('*, users(*, profiles(*)), post_likes(userId)', { count: 'exact' })
      .order('createdAt', { ascending: false })
      .range(from, to)
    const rows = assertResult(data, error).map((row) => toPost(row))
    return { data: rows, total: count ?? rows.length, page, limit, totalPages: Math.max(1, Math.ceil((count ?? rows.length) / limit)) }
  },

  async create(content: string, imageFile?: File | null) {
    const userId = await currentUserId()
    const imageUrl = imageFile ? await uploadPublicFile('post-images', imageFile, userId) : null
    const { data, error } = await supabase
      .from('posts')
      .insert({ userId, content, imageUrl })
      .select('*, users(*, profiles(*)), post_likes(userId)')
      .single()
    return toPost(assertResult(data, error), userId)
  },

  async remove(id: string) {
    const { error } = await supabase.from('posts').update({ isDeleted: true }).eq('id', id)
    if (error) throw new Error(error.message)
  },

  async toggleLike(postId: string) {
    const userId = await currentUserId()
    const { data: existing, error: findError } = await supabase
      .from('post_likes')
      .select('id')
      .eq('userId', userId)
      .eq('postId', postId)
      .maybeSingle()
    if (findError) throw new Error(findError.message)

    if (existing) {
      const { error } = await supabase.from('post_likes').delete().eq('id', existing.id)
      if (error) throw new Error(error.message)
      return false
    }

    const { error } = await supabase.from('post_likes').insert({ userId, postId })
    if (error) throw new Error(error.message)
    return true
  },

  async comments(postId: string) {
    const { data, error } = await supabase
      .from('post_comments')
      .select('*, users(*, profiles(*))')
      .eq('postId', postId)
      .order('createdAt', { ascending: true })
    return assertResult(data, error).map(toComment)
  },

  async addComment(postId: string, content: string) {
    const userId = await currentUserId()
    const { data, error } = await supabase
      .from('post_comments')
      .insert({ userId, postId, content })
      .select('*, users(*, profiles(*))')
      .single()
    return toComment(assertResult(data, error))
  },
}

export const contacts = {
  async create(input: ContactPayload) {
    const { error } = await supabase.from('contact_messages').insert(input)
    if (error) throw new Error(error.message)
  },

  async list(page = 1, limit = 20) {
    const from = (page - 1) * limit
    const to = from + limit - 1
    const { data, error, count } = await supabase
      .from('contact_messages')
      .select('*', { count: 'exact' })
      .order('createdAt', { ascending: false })
      .range(from, to)
    const rows = assertResult(data, error) as ContactMessageDTO[]
    return { data: rows, total: count ?? rows.length, page, limit, totalPages: Math.max(1, Math.ceil((count ?? rows.length) / limit)) }
  },

  async markRead(id: string) {
    const { error } = await supabase.from('contact_messages').update({ isRead: true }).eq('id', id)
    if (error) throw new Error(error.message)
  },
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const [{ count: totalUsers }, { count: totalTournaments }, { count: totalRegistrations }, { count: upcomingTournaments }, { count: activeTournaments }, paid] =
    await Promise.all([
      supabase.from('users').select('id', { count: 'exact', head: true }),
      supabase.from('tournaments').select('id', { count: 'exact', head: true }),
      supabase.from('tournament_registrations').select('id', { count: 'exact', head: true }),
      supabase.from('tournaments').select('id', { count: 'exact', head: true }).eq('status', 'UPCOMING'),
      supabase.from('tournaments').select('id', { count: 'exact', head: true }).eq('status', 'RUNNING'),
      supabase.from('payments').select('amount').eq('status', 'PAID'),
    ])

  const totalRevenue = (paid.data ?? []).reduce((sum, row: AnyRow) => sum + Number(row.amount ?? 0), 0)
  return {
    totalUsers: totalUsers ?? 0,
    totalTournaments: totalTournaments ?? 0,
    totalRegistrations: totalRegistrations ?? 0,
    totalRevenue,
    upcomingTournaments: upcomingTournaments ?? 0,
    activeTournaments: activeTournaments ?? 0,
  }
}

export const supabaseData = {
  auth,
  users,
  tournaments,
  registrations,
  payments,
  posts,
  contacts,
  getDashboardStats,
  paginate,
}
