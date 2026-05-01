/**
 * Component tests for CreatePostForm
 * Covers: rendering, content validation, submit flow, image attach/remove
 */
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CreatePostForm from '@/components/social/CreatePostForm'

jest.mock('@/lib/api', () => ({ __esModule: true, default: { post: jest.fn() } }))

jest.mock('@/lib/store/authStore', () => ({
  useAuthStore: () => ({
    user: { id: 'user-1', email: 'user@chess.com', profile: { firstName: 'John', lastName: 'Doe', avatar: null } },
  }),
}))

// jsdom does not implement URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'blob:mock-url')
global.URL.revokeObjectURL = jest.fn()

import api from '@/lib/api'

describe('CreatePostForm', () => {
  const mockOnCreated = jest.fn()

  beforeEach(() => jest.clearAllMocks())

  it('renders textarea with placeholder', () => {
    render(<CreatePostForm onCreated={mockOnCreated} />)
    expect(screen.getByPlaceholderText(/share a chess moment/i)).toBeInTheDocument()
  })

  it('renders photo attachment button', () => {
    render(<CreatePostForm onCreated={mockOnCreated} />)
    expect(screen.getByText(/photo/i)).toBeInTheDocument()
  })

  it('submit button is disabled when content is empty', () => {
    render(<CreatePostForm onCreated={mockOnCreated} />)
    expect(screen.getByRole('button', { name: /post/i })).toBeDisabled()
  })

  it('enables submit button when content is typed', async () => {
    const user = userEvent.setup()
    render(<CreatePostForm onCreated={mockOnCreated} />)
    await user.type(screen.getByPlaceholderText(/share a chess moment/i), 'Hello chess world!')
    expect(screen.getByRole('button', { name: /post/i })).not.toBeDisabled()
  })

  it('calls API and onCreated when post is submitted', async () => {
    const user = userEvent.setup()
    const mockPost = { id: 'post-1', content: 'Hello chess world!', userId: 'user-1' }
    ;(api.post as jest.Mock).mockResolvedValue({ data: { data: mockPost } })
    render(<CreatePostForm onCreated={mockOnCreated} />)
    await user.type(screen.getByPlaceholderText(/share a chess moment/i), 'Hello chess world!')
    await user.click(screen.getByRole('button', { name: /post/i }))
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/api/posts', expect.any(FormData), expect.any(Object))
      expect(mockOnCreated).toHaveBeenCalledWith(mockPost)
    })
  })

  it('clears content after successful post submission', async () => {
    const user = userEvent.setup()
    ;(api.post as jest.Mock).mockResolvedValue({ data: { data: { id: 'post-1' } } })
    render(<CreatePostForm onCreated={mockOnCreated} />)
    const textarea = screen.getByPlaceholderText(/share a chess moment/i)
    await user.type(textarea, 'My chess moment')
    await user.click(screen.getByRole('button', { name: /post/i }))
    await waitFor(() => {
      expect(textarea).toHaveValue('')
    })
  })

  it('shows image preview when file is attached', async () => {
    const user = userEvent.setup()
    render(<CreatePostForm onCreated={mockOnCreated} />)
    const file = new File(['image-data'], 'chess.png', { type: 'image/png' })
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    await user.upload(fileInput, file)
    await waitFor(() => {
      expect(screen.getByAltText(/preview/i)).toBeInTheDocument()
    })
  })
})
