/**
 * Component tests for LikeButton
 * Covers: initial render, like/unlike toggle, unauthenticated redirect, onToggle callback
 */
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LikeButton from '@/components/social/LikeButton'

const mockPush = jest.fn()
jest.mock('next/navigation', () => ({ useRouter: () => ({ push: mockPush }) }))

jest.mock('@/lib/api', () => ({ __esModule: true, default: { post: jest.fn() } }))

let mockUser: { id: string; email: string } | null = null
jest.mock('@/lib/store/authStore', () => ({
  useAuthStore: () => ({ user: mockUser }),
}))

import api from '@/lib/api'

describe('LikeButton', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUser = { id: 'user-1', email: 'user@chess.com' }
  })

  it('renders the like count', () => {
    render(<LikeButton postId="post-1" liked={false} count={5} />)
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('shows correct initial state when post is liked', () => {
    render(<LikeButton postId="post-1" liked={true} count={10} />)
    const btn = screen.getByRole('button')
    expect(btn).toHaveClass('text-red-400')
  })

  it('shows correct initial state when post is not liked', () => {
    render(<LikeButton postId="post-1" liked={false} count={3} />)
    const btn = screen.getByRole('button')
    expect(btn).toHaveClass('text-slate-500')
  })

  it('increments count when like is added', async () => {
    const user = userEvent.setup()
    ;(api.post as jest.Mock).mockResolvedValue({})
    render(<LikeButton postId="post-1" liked={false} count={5} />)
    await user.click(screen.getByRole('button'))
    await waitFor(() => {
      expect(screen.getByText('6')).toBeInTheDocument()
    })
  })

  it('decrements count when like is removed', async () => {
    const user = userEvent.setup()
    ;(api.post as jest.Mock).mockResolvedValue({})
    render(<LikeButton postId="post-1" liked={true} count={5} />)
    await user.click(screen.getByRole('button'))
    await waitFor(() => {
      expect(screen.getByText('4')).toBeInTheDocument()
    })
  })

  it('calls onToggle callback with new liked state', async () => {
    const user = userEvent.setup()
    const onToggle = jest.fn()
    ;(api.post as jest.Mock).mockResolvedValue({})
    render(<LikeButton postId="post-1" liked={false} count={0} onToggle={onToggle} />)
    await user.click(screen.getByRole('button'))
    await waitFor(() => {
      expect(onToggle).toHaveBeenCalledWith(true)
    })
  })

  it('redirects to login when user is not authenticated', async () => {
    mockUser = null
    const user = userEvent.setup()
    render(<LikeButton postId="post-1" liked={false} count={0} />)
    await user.click(screen.getByRole('button'))
    expect(mockPush).toHaveBeenCalledWith('/auth/login')
    expect(api.post).not.toHaveBeenCalled()
  })

  it('calls API with correct post id', async () => {
    const user = userEvent.setup()
    ;(api.post as jest.Mock).mockResolvedValue({})
    render(<LikeButton postId="my-post-id" liked={false} count={0} />)
    await user.click(screen.getByRole('button'))
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/api/posts/my-post-id/like')
    })
  })
})
