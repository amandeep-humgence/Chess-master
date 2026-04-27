// ── Auth ──────────────────────────────────────────────────────────────────────
export type UserRole = 'USER' | 'ADMIN'

export interface AuthUser {
  id: string
  email: string
  role: UserRole
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  email: string
  password: string
  firstName: string
  lastName: string
}

// ── Profile ───────────────────────────────────────────────────────────────────
export interface ProfileDTO {
  id: string
  userId: string
  firstName: string
  lastName: string
  avatar: string | null
  bio: string | null
  phone: string | null
  chessRating: number | null
}

export interface UpdateProfilePayload {
  firstName?: string
  lastName?: string
  bio?: string
  phone?: string
  chessRating?: number
}

// ── User ──────────────────────────────────────────────────────────────────────
export interface UserDTO {
  id: string
  email: string
  role: UserRole
  createdAt: string
  profile: ProfileDTO | null
}

// ── Tournaments ───────────────────────────────────────────────────────────────
export type TournamentStatus = 'UPCOMING' | 'RUNNING' | 'PAST' | 'CANCELLED'

export interface TournamentDTO {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string
  location: string
  entryFee: number
  prizePool: number
  maxPlayers: number
  currentPlayers: number
  status: TournamentStatus
  createdBy: string
  createdAt: string
}

export interface CreateTournamentPayload {
  title: string
  description: string
  startDate: string
  endDate: string
  location: string
  entryFee: number
  prizePool: number
  maxPlayers: number
}

export interface UpdateTournamentPayload extends Partial<CreateTournamentPayload> {
  status?: TournamentStatus
}

// ── Registrations ─────────────────────────────────────────────────────────────
export type RegistrationStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED'

export interface RegistrationDTO {
  id: string
  userId: string
  tournamentId: string
  paymentId: string | null
  status: RegistrationStatus
  createdAt: string
  tournament?: TournamentDTO
  user?: UserDTO
}

// ── Payments ──────────────────────────────────────────────────────────────────
export type PaymentStatus = 'CREATED' | 'PAID' | 'FAILED'

export interface PaymentDTO {
  id: string
  userId: string
  tournamentId: string
  amount: number
  currency: string
  razorpayOrderId: string | null
  razorpayPaymentId: string | null
  status: PaymentStatus
  createdAt: string
  tournament?: TournamentDTO
}

export interface CreateOrderResponse {
  orderId: string
  amount: number
  currency: string
  keyId: string
}

export interface VerifyPaymentPayload {
  razorpayOrderId: string
  razorpayPaymentId: string
  razorpaySignature: string
  tournamentId: string
}

// ── Posts ─────────────────────────────────────────────────────────────────────
export interface PostDTO {
  id: string
  userId: string
  content: string
  imageUrl: string | null
  likesCount: number
  commentsCount: number
  createdAt: string
  isDeleted: boolean
  isLikedByMe?: boolean
  author: {
    id: string
    email: string
    profile: ProfileDTO | null
  }
}

export interface CommentDTO {
  id: string
  userId: string
  postId: string
  content: string
  createdAt: string
  author: {
    id: string
    profile: ProfileDTO | null
  }
}

// ── Admin ─────────────────────────────────────────────────────────────────────
export interface DashboardStats {
  totalUsers: number
  totalTournaments: number
  totalRegistrations: number
  totalRevenue: number
  upcomingTournaments: number
  activeTournaments: number
}

// ── API Responses ─────────────────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// ── Contact ───────────────────────────────────────────────────────────────────
export interface ContactPayload {
  name: string
  email: string
  subject: string
  message: string
}

export interface ContactMessageDTO {
  id: string
  name: string
  email: string
  subject: string
  message: string
  isRead: boolean
  createdAt: string
}
