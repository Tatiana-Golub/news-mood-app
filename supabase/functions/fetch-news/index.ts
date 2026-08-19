import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const NEWS_API_KEY = Deno.env.get('NEWS_API_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

interface NewsApiArticle {
  title: string
  description: string | null
  content: string | null
  url: string
  urlToImage: string | null
  publishedAt: string
  source: { name: string }
}

interface NewsApiResponse {
  status: string
  totalResults: number
  articles: NewsApiArticle[]
}

interface ArticleRow {
  external_id: string
  title: string
  original_text: string
  source_name: string
  source_url: string
  image_url: string | null
  published_at: string
}

Deno.serve(async (_req: Request) => {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    const newsRes = await fetch(
      `https://newsapi.org/v2/top-headlines?language=en&pageSize=20&apiKey=${NEWS_API_KEY}`
    )

    if (!newsRes.ok) {
      const errText = await newsRes.text()
      return new Response(JSON.stringify({ error: `News API error: ${errText}` }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const { articles }: NewsApiResponse = await newsRes.json()

    const usable = articles.filter(
      (a: NewsApiArticle) =>
        a.title && a.title !== '[Removed]' && (a.description || a.content) && a.url
    )

    const rows: ArticleRow[] = usable.map((a: NewsApiArticle) => ({
      external_id: a.url,
      title: a.title,
      original_text: a.description ?? a.content ?? '',
      source_name: a.source?.name ?? 'Unknown',
      source_url: a.url,
      image_url: a.urlToImage ?? null,
      published_at: a.publishedAt,
    }))

    const { data, error } = await supabase
      .from('articles')
      .upsert(rows, { onConflict: 'external_id', ignoreDuplicates: true })
      .select()

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return new Response(
      JSON.stringify({ inserted: data?.length ?? 0, total_fetched: usable.length }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})