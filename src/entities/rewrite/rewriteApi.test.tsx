import { describe, it, expect, vi, beforeEach } from 'vitest'
import { configureStore } from '@reduxjs/toolkit'
import { rewriteApi } from './rewriteApi'
import { supabase } from '../../shared/lib/supabaseClient'
import { makeQueryBuilder } from '../../test/supabase-mock-utils'
import { mockRewriteJoyful } from '../../test/mocked-articles'

vi.mock('../../shared/lib/supabaseClient')

function makeStore() {
  return configureStore({
    reducer: { [rewriteApi.reducerPath]: rewriteApi.reducer },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(rewriteApi.middleware),
  })
}

describe('rewriteApi.getRewrite', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns the cached rewrite without calling the edge function on a cache hit', async () => {
    vi.mocked(supabase.from).mockImplementation(
      () => makeQueryBuilder({ data: mockRewriteJoyful, error: null }) as never
    )

    const store = makeStore()
    const result = await store.dispatch(
      rewriteApi.endpoints.getRewrite.initiate({ articleId: 'article-1', mood: 'joyful' })
    )

    expect(result.data).toEqual(mockRewriteJoyful)
    expect(supabase.functions.invoke).not.toHaveBeenCalled()
  })

  it('calls the edge function to generate a rewrite on a cache miss', async () => {
    vi.mocked(supabase.from).mockImplementation(
      () => makeQueryBuilder({ data: null, error: null }) as never
    )
    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: { ...mockRewriteJoyful, mood: 'sad', rewritten_text: 'Freshly generated sad version.' },
      error: null,
    } as never)

    const store = makeStore()
    const result = await store.dispatch(
      rewriteApi.endpoints.getRewrite.initiate({ articleId: 'article-1', mood: 'sad' })
    )

    expect(supabase.functions.invoke).toHaveBeenCalledWith(
      'rewrite-article',
      expect.objectContaining({ body: { articleId: 'article-1', mood: 'sad' } })
    )
    expect(result.data).toMatchObject({ rewritten_text: 'Freshly generated sad version.' })
  })

   it('propagates an error if the edge function call fails', async () => {
    vi.mocked(supabase.from).mockImplementation(
      () => makeQueryBuilder({ data: null, error: null }) as never
    )
    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: null,
      error: { message: 'Groq API error' },
    } as never)

    const store = makeStore()
    const result = await store.dispatch(
      rewriteApi.endpoints.getRewrite.initiate({ articleId: 'article-1', mood: 'ironic' })
    )

    expect(result.error).toMatchObject({ message: 'Groq API error' })
  })
})