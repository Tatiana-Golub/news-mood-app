import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../../test/test-utils'
import { RefreshButton } from './RefreshButton'
import { supabase } from '../../shared/lib/supabaseClient'

vi.mock('../../shared/lib/supabaseClient')

describe('RefreshButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows "Refreshing…" while the mutation is in flight', async () => {
    const user = userEvent.setup()
    let resolveInvoke: (v: unknown) => void = () => {}
    vi.mocked(supabase.functions.invoke).mockReturnValue(
      new Promise((resolve) => {
        resolveInvoke = resolve
      }) as never
    )

    renderWithProviders(<RefreshButton />)

    await user.click(screen.getByRole('button', { name: /refresh news/i }))

    expect(await screen.findByRole('button', { name: /refreshing/i })).toBeDisabled()

    resolveInvoke({ data: { inserted: 1, total_fetched: 1 }, error: null })
  })

  it('shows singular wording when exactly one article is inserted', async () => {
    const user = userEvent.setup()
    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: { inserted: 1, total_fetched: 5 },
      error: null,
    } as never)

    renderWithProviders(<RefreshButton />)
    await user.click(screen.getByRole('button', { name: /refresh news/i }))

    expect(await screen.findByText('Added 1 new article.')).toBeInTheDocument()
  })

  it('shows plural wording when multiple articles are inserted', async () => {
    const user = userEvent.setup()
    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: { inserted: 4, total_fetched: 10 },
      error: null,
    } as never)

    renderWithProviders(<RefreshButton />)
    await user.click(screen.getByRole('button', { name: /refresh news/i }))

    expect(await screen.findByText('Added 4 new articles.')).toBeInTheDocument()
  })

  it('shows plural wording when zero articles are inserted', async () => {
    const user = userEvent.setup()
    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: { inserted: 0, total_fetched: 3 },
      error: null,
    } as never)

    renderWithProviders(<RefreshButton />)
    await user.click(screen.getByRole('button', { name: /refresh news/i }))

    expect(await screen.findByText('Added 0 new articles.')).toBeInTheDocument()
  })

  it('shows an error message when the refresh fails', async () => {
    const user = userEvent.setup()
    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: null,
      error: { message: 'CORS error' },
    } as never)

    renderWithProviders(<RefreshButton />)
    await user.click(screen.getByRole('button', { name: /refresh news/i }))

    expect(await screen.findByText(/couldn't refresh/i)).toBeInTheDocument()
  })
})
