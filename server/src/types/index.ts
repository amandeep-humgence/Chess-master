// Server-local type definitions (mirrors /types/index.ts for use within the Express server)

export type UserRole = 'USER' | 'ADMIN'

export interface AuthUser {
  id: string
  email: string
  role: UserRole
}

export interface RegisterPayload {
  email: string
  password: string
  firstName: string
  lastName: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface UpdateProfilePayload {
  firstName?: string
  lastName?: string
  bio?: string
  phone?: string
  chessRating?: number
}

export type TournamentStatus = 'UPCOMING' | 'RUNNING' | 'PAST' | 'CANCELLED'

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

export interface VerifyPaymentPayload {
  razorpayOrderId: string
  razorpayPaymentId: string
  razorpaySignature: string
  tournamentId: string
}

export interface ContactPayload {
  name: string
  email: string
  subject: string
  message: string
}

export interface DashboardStats {
  totalUsers: number
  totalTournaments: number
  totalRegistrations: number
  totalRevenue: number
  upcomingTournaments: number
  activeTournaments: number
}
