import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react'
import { supabase } from '../../shared/lib/supabaseClient'
import type { Mood, Rewrite } from '../article/types'

interface GetRewriteArgs {
  articleId: string
  mood: Mood
}

export const rewriteApi = createApi({
  reducerPath: 'rewriteApi',
  baseQuery: fakeBaseQuery<{ message: string }>(),
  tagTypes: ['Rewrite'],
  keepUnusedDataFor: 300,
  endpoints: (builder) => ({
    getRewrite: builder.query<Rewrite, GetRewriteArgs>({
      queryFn: async ({ articleId, mood }) => {
        const { data: existing, error: fetchError } = await supabase
          .from('rewrites')
          .select('*')
          .match({ article_id: articleId, mood })
          .maybeSingle()

        if (fetchError) return { error: { message: fetchError.message } }
        if (existing) return { data: existing as Rewrite }

        const { data, error } = await supabase.functions.invoke('rewrite-article', {
          body: { articleId, mood },
        })

        if (error) return { error: { message: error.message } }
        return { data: data as Rewrite }
      },
      providesTags: (_result, _err, { articleId, mood }) => [
        { type: 'Rewrite', id: `${articleId}-${mood}` },
      ],
    }),
  }),
})

export const { useGetRewriteQuery } = rewriteApi