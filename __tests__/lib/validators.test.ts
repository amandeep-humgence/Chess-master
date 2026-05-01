/**
 * Unit tests for all Zod validation schemas
 * Covers: auth, tournament, post, contact, profile validators
 */
import { loginSchema, registerSchema } from '@/lib/validators/auth'
import { createTournamentSchema, updateTournamentSchema } from '@/lib/validators/tournament'
import { createPostSchema, createCommentSchema } from '@/lib/validators/post'
import { contactSchema } from '@/lib/validators/contact'
import { updateProfileSchema } from '@/lib/validators/profile'

// ─── Auth validators ──────────────────────────────────────────────────────────
describe('loginSchema', () => {
  it('accepts valid credentials', () => {
    expect(loginSchema.safeParse({ email: 'user@example.com', password: 'secret' }).success).toBe(true)
  })
  it('rejects invalid email', () => {
    expect(loginSchema.safeParse({ email: 'not-email', password: 'secret' }).success).toBe(false)
  })
  it('rejects missing password', () => {
    expect(loginSchema.safeParse({ email: 'user@example.com' }).success).toBe(false)
  })
  it('rejects empty password', () => {
    expect(loginSchema.safeParse({ email: 'user@example.com', password: '' }).success).toBe(false)
  })
})

describe('registerSchema', () => {
  const valid = { email: 'user@example.com', password: 'Password1', firstName: 'John', lastName: 'Doe' }

  it('accepts valid registration data', () => {
    expect(registerSchema.safeParse(valid).success).toBe(true)
  })
  it('rejects password shorter than 8 chars', () => {
    expect(registerSchema.safeParse({ ...valid, password: 'short' }).success).toBe(false)
  })
  it('rejects password longer than 72 chars', () => {
    expect(registerSchema.safeParse({ ...valid, password: 'a'.repeat(73) }).success).toBe(false)
  })
  it('rejects missing firstName', () => {
    const { firstName: _, ...rest } = valid
    expect(registerSchema.safeParse(rest).success).toBe(false)
  })
  it('rejects empty firstName', () => {
    expect(registerSchema.safeParse({ ...valid, firstName: '' }).success).toBe(false)
  })
  it('rejects missing lastName', () => {
    const { lastName: _, ...rest } = valid
    expect(registerSchema.safeParse(rest).success).toBe(false)
  })
  it('rejects invalid email', () => {
    expect(registerSchema.safeParse({ ...valid, email: 'bad-email' }).success).toBe(false)
  })
  it('rejects firstName longer than 50 chars', () => {
    expect(registerSchema.safeParse({ ...valid, firstName: 'a'.repeat(51) }).success).toBe(false)
  })
})

// ─── Tournament validators ────────────────────────────────────────────────────
describe('createTournamentSchema', () => {
  const valid = {
    title: 'Spring Open 2025',
    description: 'A chess tournament for all skill levels',
    startDate: '2025-06-01T09:00:00.000Z',
    endDate: '2025-06-03T18:00:00.000Z',
    location: 'New Delhi',
    entryFee: 500,
    prizePool: 10000,
    maxPlayers: 64,
  }

  it('accepts valid tournament data', () => {
    expect(createTournamentSchema.safeParse(valid).success).toBe(true)
  })
  it('rejects title shorter than 3 chars', () => {
    expect(createTournamentSchema.safeParse({ ...valid, title: 'Hi' }).success).toBe(false)
  })
  it('rejects title longer than 200 chars', () => {
    expect(createTournamentSchema.safeParse({ ...valid, title: 'a'.repeat(201) }).success).toBe(false)
  })
  it('rejects description shorter than 10 chars', () => {
    expect(createTournamentSchema.safeParse({ ...valid, description: 'Short' }).success).toBe(false)
  })
  it('rejects invalid startDate format', () => {
    expect(createTournamentSchema.safeParse({ ...valid, startDate: 'not-a-date' }).success).toBe(false)
  })
  it('rejects negative entryFee', () => {
    expect(createTournamentSchema.safeParse({ ...valid, entryFee: -1 }).success).toBe(false)
  })
  it('accepts zero entryFee (free tournament)', () => {
    expect(createTournamentSchema.safeParse({ ...valid, entryFee: 0 }).success).toBe(true)
  })
  it('rejects negative prizePool', () => {
    expect(createTournamentSchema.safeParse({ ...valid, prizePool: -100 }).success).toBe(false)
  })
  it('rejects maxPlayers less than 2', () => {
    expect(createTournamentSchema.safeParse({ ...valid, maxPlayers: 1 }).success).toBe(false)
  })
  it('rejects maxPlayers greater than 1024', () => {
    expect(createTournamentSchema.safeParse({ ...valid, maxPlayers: 1025 }).success).toBe(false)
  })
})

describe('updateTournamentSchema', () => {
  it('accepts empty object (all fields optional)', () => {
    expect(updateTournamentSchema.safeParse({}).success).toBe(true)
  })
  it('accepts valid status value', () => {
    expect(updateTournamentSchema.safeParse({ status: 'RUNNING' }).success).toBe(true)
    expect(updateTournamentSchema.safeParse({ status: 'CANCELLED' }).success).toBe(true)
  })
  it('rejects invalid status value', () => {
    expect(updateTournamentSchema.safeParse({ status: 'INVALID_STATUS' }).success).toBe(false)
  })
  it('rejects invalid startDate when provided', () => {
    expect(updateTournamentSchema.safeParse({ startDate: 'bad' }).success).toBe(false)
  })
})

// ─── Post validators ──────────────────────────────────────────────────────────
describe('createPostSchema', () => {
  it('accepts valid content', () => {
    expect(createPostSchema.safeParse({ content: 'Hello chess world!' }).success).toBe(true)
  })
  it('rejects empty content', () => {
    expect(createPostSchema.safeParse({ content: '' }).success).toBe(false)
  })
  it('rejects content longer than 2000 chars', () => {
    expect(createPostSchema.safeParse({ content: 'a'.repeat(2001) }).success).toBe(false)
  })
})

describe('createCommentSchema', () => {
  it('accepts valid comment', () => {
    expect(createCommentSchema.safeParse({ content: 'Great move!' }).success).toBe(true)
  })
  it('rejects empty comment', () => {
    expect(createCommentSchema.safeParse({ content: '' }).success).toBe(false)
  })
  it('rejects comment longer than 1000 chars', () => {
    expect(createCommentSchema.safeParse({ content: 'a'.repeat(1001) }).success).toBe(false)
  })
})

// ─── Contact validator ────────────────────────────────────────────────────────
describe('contactSchema', () => {
  const valid = {
    name: 'John Doe',
    email: 'john@example.com',
    subject: 'Tournament Question',
    message: 'I have a question about the upcoming tournament and how to register.',
  }

  it('accepts valid contact message', () => {
    expect(contactSchema.safeParse(valid).success).toBe(true)
  })
  it('rejects empty name', () => {
    expect(contactSchema.safeParse({ ...valid, name: '' }).success).toBe(false)
  })
  it('rejects invalid email', () => {
    expect(contactSchema.safeParse({ ...valid, email: 'bad-email' }).success).toBe(false)
  })
  it('rejects empty subject', () => {
    expect(contactSchema.safeParse({ ...valid, subject: '' }).success).toBe(false)
  })
  it('rejects message shorter than 10 chars', () => {
    expect(contactSchema.safeParse({ ...valid, message: 'Too short' }).success).toBe(false)
  })
  it('rejects message longer than 5000 chars', () => {
    expect(contactSchema.safeParse({ ...valid, message: 'a'.repeat(5001) }).success).toBe(false)
  })
})

// ─── Profile validator ────────────────────────────────────────────────────────
describe('updateProfileSchema', () => {
  it('accepts empty object (all optional)', () => {
    expect(updateProfileSchema.safeParse({}).success).toBe(true)
  })
  it('accepts valid partial update', () => {
    expect(updateProfileSchema.safeParse({ firstName: 'Jane', chessRating: 1500 }).success).toBe(true)
  })
  it('rejects empty firstName when provided', () => {
    expect(updateProfileSchema.safeParse({ firstName: '' }).success).toBe(false)
  })
  it('rejects chessRating below 0', () => {
    expect(updateProfileSchema.safeParse({ chessRating: -1 }).success).toBe(false)
  })
  it('rejects chessRating above 3000', () => {
    expect(updateProfileSchema.safeParse({ chessRating: 3001 }).success).toBe(false)
  })
  it('accepts max valid chess rating (3000)', () => {
    expect(updateProfileSchema.safeParse({ chessRating: 3000 }).success).toBe(true)
  })
})
