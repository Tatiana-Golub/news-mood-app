import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { renderWithProviders } from '../../test/test-utils'
import { makeQueryBuilder, makeTableRouter } from '../../test/supabase-mock-utils'
import {
  mockArticle,
  mockRewriteJoyful,
  mockRewriteNeutral,
  mockRewriteSadFailedCheck,
} from '../../test/mocked-articles'
import { ArticleDetail } from './ArticleDetail'
import { supabase } from '../../shared/lib/supabaseClient'

vi.mock('../../shared/lib/supabaseClient')

function renderArticleDetail() {
  return renderWithProviders(
    <MemoryRouter initialEntries={['/article/article-1']}>
      <ArticleDetail articleId="article-1" />
    </MemoryRouter>
  )
}

describe('ArticleDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the original article and generates a rewrite for the default mood', async () => {
    vi.mocked(supabase.from).mockImplementation(
      makeTableRouter({
        articles: makeQueryBuilder({ data: mockArticle, error: null }),
        rewrites: makeQueryBuilder({ data: null, error: null }), // no cache yet
      }) as never
    )

    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: mockRewriteNeutral,
      error: null,
    } as never)

    renderArticleDetail()

    expect(await screen.findByText(mockArticle.title)).toBeInTheDocument()
    expect(screen.getByText(mockArticle.original_text)).toBeInTheDocument()
    expect(screen.getByText(mockRewriteNeutral.rewritten_text)).toBeInTheDocument()
    expect(screen.getByText(mockArticle.source_name)).toBeInTheDocument()

    await waitFor(() => {
      expect(supabase.functions.invoke).toHaveBeenCalledWith(
        'rewrite-article',
        expect.objectContaining({ body: { articleId: 'article-1', mood: 'neutral' } })
      )
    })
  })

  it('switches mood and fetches a fresh rewrite without refetching the article', async () => {
    const user = userEvent.setup()

    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === 'articles') {
        return makeQueryBuilder({ data: mockArticle, error: null }) as never
      }
      if (table === 'rewrites') {
        return {
          select: vi.fn().mockReturnThis(),
          match: vi.fn(function (this: Record<string, unknown>, args: { mood: string }) {
            this._mood = args.mood
            return this
          }),
          maybeSingle: vi.fn(function (this: { _mood?: string }) {
            if (this._mood === 'neutral') {
              return Promise.resolve({ data: mockRewriteNeutral, error: null })
            }
            return Promise.resolve({ data: null, error: null })
          }),
        } as never
      }
      throw new Error(`Unexpected table: ${table}`)
    })

    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: mockRewriteJoyful,
      error: null,
    } as never)

    renderArticleDetail()

    await screen.findByText(mockArticle.title)
    await screen.findByText(mockRewriteNeutral.rewritten_text)

    await user.click(screen.getByRole('button', { name: 'joyful' }))

    await waitFor(() => {
      expect(screen.getByText(mockRewriteJoyful.rewritten_text)).toBeInTheDocument()
    })

    const articlesCalls = vi.mocked(supabase.from).mock.calls.filter(([t]) => t === 'articles')
    expect(articlesCalls.length).toBe(1)
  })

  it('shows the fact-check warning badge when a rewrite fails verification', async () => {
    vi.mocked(supabase.from).mockImplementation(
      makeTableRouter({
        articles: makeQueryBuilder({ data: mockArticle, error: null }),
        rewrites: makeQueryBuilder({ data: mockRewriteSadFailedCheck, error: null }),
      }) as never
    )

    renderArticleDetail()

    await screen.findByText(mockArticle.title)

    await waitFor(() => {
      expect(screen.getByText(/may have been altered/i)).toBeInTheDocument()
    })
  })

  it('shows an error message when the rewrite fails to generate', async () => {
    vi.mocked(supabase.from).mockImplementation(
      makeTableRouter({
        articles: makeQueryBuilder({ data: mockArticle, error: null }),
        rewrites: makeQueryBuilder({ data: null, error: null }), // no cache, forces edge function call
      }) as never
    )

    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: null,
      error: { message: 'Groq API error' },
    } as never)

    renderArticleDetail()

    await screen.findByText(mockArticle.title)

    expect(await screen.findByText(/couldn't generate this rewrite/i)).toBeInTheDocument()
  })

  it('shows an error state when the article fails to load', async () => {
    vi.mocked(supabase.from).mockImplementation(
      makeTableRouter({
        articles: makeQueryBuilder({ data: null, error: { message: 'not found' } }),
        rewrites: makeQueryBuilder({ data: null, error: null }),
      }) as never
    )

    renderArticleDetail()

    expect(await screen.findByText(/couldn't load this article/i)).toBeInTheDocument()
  })
})
