import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const FREENEWS_API_KEY = Deno.env.get('FREENEWS_API_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const LIST_URL = 'https://api.freenewsapi.io/v1/news'
const DETAILS_URL = 'https://api.freenewsapi.io/v1/details'

const REQUEST_DELAY_MS = 600
const ARTICLE_LIMIT = 20

interface NewsListItem {
  uuid: string
}

interface NewsListResponse {
  data: NewsListItem[]
}

interface ArticleDetails {
  uuid: string
  title: string
  body: string
  original_url: string
  publisher: string
  thumbnail: string | null
  published_at: string
}

interface DetailsResponse {
  data: ArticleDetails
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

function cleanText(raw: string): string {
  let text = raw
  text = text.replace(/<[^>]*>/g, ' ')

  const entities: Record<string, string> = {
    '&amp;': '&',
    '&quot;': '"',
    '&#39;': "'",
    '&apos;': "'",
    '&lt;': '<',
    '&gt;': '>',
    '&nbsp;': ' ',
    '&#8217;': '\u2019',
    '&#8216;': '\u2018',
    '&#8220;': '\u201c',
    '&#8221;': '\u201d',
    '&#8211;': '\u2013',
    '&#8212;': '\u2014',
  }
  for (const [entity, char] of Object.entries(entities)) {
    text = text.split(entity).join(char)
  }

  text = text.replace(/\s+/g, ' ').trim()
  return text
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

Deno.serve(async (_req: Request) => {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    const listRes = await fetch(`${LIST_URL}?language=en&publisher_uuid=13e6a296-f159-49ec-bb3c-6afd71109a16&publisher_uuid=2e86b1e6-fb77-422f-aa12-386892060bda`, {
      headers: { 'x-api-key': FREENEWS_API_KEY },
    })

    if (!listRes.ok) {
      const errText = await listRes.text()
      return new Response(JSON.stringify({ error: `FreeNewsApi list error: ${errText}` }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const listData: NewsListResponse = await listRes.json()
    const uuids = (listData.data ?? [])
      .slice(0, ARTICLE_LIMIT)
      .map((i) => i.uuid)
      .filter(Boolean)

    if (uuids.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No article UUIDs returned from list endpoint' }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const rows: ArticleRow[] = []
    for (const uuid of uuids) {
      const detailsRes = await fetch(
        `${DETAILS_URL}?uuid=${encodeURIComponent(uuid)}`,
        { headers: { 'x-api-key': FREENEWS_API_KEY } }
      )

      if (detailsRes.ok) {
        const { data: d }: DetailsResponse = await detailsRes.json()
        const bodyText = d.body ? cleanText(d.body) : ''

        if (bodyText.length > 0 && d.original_url) {
          rows.push({
            external_id: d.uuid,
            title: cleanText(d.title),
            original_text: bodyText,
            source_name: d.publisher ?? 'Unknown',
            source_url: d.original_url,
            image_url: d.thumbnail ?? null,
            published_at: d.published_at,
          })
        }
      }

      await sleep(REQUEST_DELAY_MS)
    }

    if (rows.length === 0) {
      return new Response(JSON.stringify({ error: 'No usable article details fetched' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      })
    }

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
      JSON.stringify({ inserted: data?.length ?? 0, total_fetched: rows.length }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})