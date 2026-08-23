import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react'
import { supabase } from '../../shared/lib/supabaseClient'
import type { Article } from './types'

interface RefreshResult {
  inserted: number
  total_fetched: number
}

export const articleApi = createApi({
  reducerPath: 'articleApi',
  baseQuery: fakeBaseQuery<{ message: string }>(),
  tagTypes: ['Article'],
  endpoints: (builder) => ({
    getArticles: builder.query<Article[], void>({
      queryFn: async () => {
        const { data, error } = await supabase
          .from('articles')
          .select('*')
          .order('published_at', { ascending: false })

        if (error) return { error: { message: error.message } }
        return { data: data as Article[] }
      },
      providesTags: ['Article'],
    }),

    getArticleById: builder.query<Article, string>({
      queryFn: async (id) => {
        const { data, error } = await supabase
          .from('articles')
          .select('*')
          .eq('id', id)
          .single()

        if (error) return { error: { message: error.message } }
        return { data: data as Article }
      },
      providesTags: (_result, _err, id) => [{ type: 'Article', id }],
    }),

    refreshNews: builder.mutation<RefreshResult, void>({
      queryFn: async () => {
        const { data, error } = await supabase.functions.invoke('fetch-news', {
          method: 'POST',
        })

        if (error) return { error: { message: error.message } }
        return { data: data as RefreshResult }
      },
      invalidatesTags: ['Article'],
    }),
  }),
})

export const {
  useGetArticlesQuery,
  useGetArticleByIdQuery,
  useRefreshNewsMutation,
} = articleApi