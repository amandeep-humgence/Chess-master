/**
 * Component tests for TournamentForm (admin create/edit tournament)
 * Covers: field rendering, validation, submit callback, cancel callback
 */
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TournamentForm from '@/components/tournament/TournamentForm'
import type { TournamentDTO } from '@/types'

describe('TournamentForm', () => {
  const mockOnSubmit = jest.fn()
  const mockOnCancel = jest.fn()

  beforeEach(() => jest.clearAllMocks())

  it('renders all required fields', () => {
    render(<TournamentForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
    // Description textarea is identified via its label text (no htmlFor in component)
    expect(screen.getByText('Description')).toBeInTheDocument()
    expect(screen.getByLabelText(/start date/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/end date/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/location/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/entry fee/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/prize pool/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/max players/i)).toBeInTheDocument()
  })

  it('renders "Create Tournament" button when no initial data', () => {
    render(<TournamentForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)
    expect(screen.getByRole('button', { name: /create tournament/i })).toBeInTheDocument()
  })

  it('renders "Update Tournament" button when initial data is provided', () => {
    render(
      <TournamentForm
        initial={{ title: 'Test', id: 'tournament-1' } as Partial<TournamentDTO> as TournamentDTO}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    )
    expect(screen.getByRole('button', { name: /update tournament/i })).toBeInTheDocument()
  })

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup()
    render(<TournamentForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)
    await user.click(screen.getByRole('button', { name: /cancel/i }))
    expect(mockOnCancel).toHaveBeenCalledTimes(1)
  })

  it('shows validation error when title is too short (does not call onSubmit)', async () => {
    const user = userEvent.setup()
    render(<TournamentForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)
    await user.type(screen.getByLabelText(/title/i), 'Hi')
    await user.click(screen.getByRole('button', { name: /create tournament/i }))
    await waitFor(() => {
      expect(mockOnSubmit).not.toHaveBeenCalled()
    })
  })

  it('calls onSubmit when all required fields are filled', async () => {
    const user = userEvent.setup()
    mockOnSubmit.mockResolvedValue(undefined)
    render(<TournamentForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)
    await user.type(screen.getByLabelText(/title/i), 'Autumn Classic')
    // Get the textarea (it follows the Description label in the DOM)
    const textarea = screen.getByRole('textbox', { name: '' })
    await user.type(textarea, 'A grand chess tournament for the autumn season with prizes')
    await user.type(screen.getByLabelText(/location/i), 'Mumbai')
    // Fill datetime-local fields
    const [startInput, endInput] = screen.getAllByDisplayValue('')
      .filter((el) => (el as HTMLInputElement).type === 'datetime-local')
    if (startInput) await user.type(startInput, '2025-09-01T09:00')
    if (endInput) await user.type(endInput, '2025-09-03T18:00')
    await user.click(screen.getByRole('button', { name: /create tournament/i }))
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled()
    })
  })

  it('pre-fills fields with initial values', () => {
    render(
      <TournamentForm
        initial={{
          id: 'tournament-1',
          title: 'Pre-filled Title',
          description: 'Pre-filled description text here',
          location: 'Delhi',
          entryFee: 200,
          prizePool: 3000,
          maxPlayers: 16,
        } as Partial<TournamentDTO> as TournamentDTO}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    )
    expect(screen.getByLabelText(/title/i)).toHaveValue('Pre-filled Title')
    expect(screen.getByLabelText(/location/i)).toHaveValue('Delhi')
    expect(screen.getByLabelText(/entry fee/i)).toHaveValue(200)
    expect(screen.getByLabelText(/max players/i)).toHaveValue(16)
  })

  it('displays server error when onSubmit throws', async () => {
    const user = userEvent.setup()
    mockOnSubmit.mockRejectedValue(new Error('Server error occurred'))
    render(<TournamentForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)
    await user.type(screen.getByLabelText(/title/i), 'Autumn Classic')
    const textarea = screen.getByRole('textbox', { name: '' })
    await user.type(textarea, 'A grand chess tournament for the autumn season with prizes')
    await user.type(screen.getByLabelText(/location/i), 'Mumbai')
    const [startInput, endInput] = screen.getAllByDisplayValue('')
      .filter((el) => (el as HTMLInputElement).type === 'datetime-local')
    if (startInput) await user.type(startInput, '2025-09-01T09:00')
    if (endInput) await user.type(endInput, '2025-09-03T18:00')
    await user.click(screen.getByRole('button', { name: /create tournament/i }))
    await waitFor(() => {
      expect(screen.getByText(/server error occurred/i)).toBeInTheDocument()
    })
  })
})
