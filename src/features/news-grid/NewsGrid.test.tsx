import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { renderWithProviders } from '../../test/test-utils'
import { makeQueryBuilder } from '../../test/supabase-mock-utils'
import { mockArticles } from '../../test/mocked-articles'
import { NewsGrid } from './NewsGrid'
import { supabase } from '../../shared/lib/supabaseClient'

vi.mock('../../shared/lib/supabaseClient')

function renderGrid() {
  return renderWithProviders(
    <MemoryRouter>
      <NewsGrid />
    </MemoryRouter>
  )
}

describe('NewsGrid', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows skeleton placeholders while loading', () => {
    vi.mocked(supabase.from).mockImplementation(
      () => makeQueryBuilder({ data: mockArticles, error: null }, 1000) as never
    )

    renderGrid()

    expect(screen.queryByText(mockArticles[0].title)).not.toBeInTheDocument()
  })

  it('renders a card for each article once loaded', async () => {
    vi.mocked(supabase.from).mockImplementation(
      () => makeQueryBuilder({ data: mockArticles, error: null }) as never
    )

    renderGrid()

    expect(await screen.findByText(mockArticles[0].title)).toBeInTheDocument()
    expect(screen.getByText(mockArticles[1].title)).toBeInTheDocument()
  })

  it('shows an empty state when there are no articles', async () => {
    vi.mocked(supabase.from).mockImplementation(
      () => makeQueryBuilder({ data: [], error: null }) as never
    )

    renderGrid()

    expect(await screen.findByText(/no articles yet/i)).toBeInTheDocument()
  })

  it('shows an error message when the fetch fails', async () => {
    vi.mocked(supabase.from).mockImplementation(
      () => makeQueryBuilder({ data: null, error: { message: 'network error' } }) as never
    )

    renderGrid()

    expect(await screen.findByText(/couldn't load articles/i)).toBeInTheDocument()
  })
})
