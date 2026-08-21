import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const GROQ_BASE_URL = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_MODEL = 'openai/gpt-oss-120b'

const VALID_MOODS = ['joyful', 'sad', 'neutral', 'ironic'] as const
type Mood = (typeof VALID_MOODS)[number]

interface RequestBody {
  articleId: string
  mood: Mood
}

interface GroqResponse {
  choices?: {
    message: { content: string }
  }[]
}

async function callGroq(prompt: string): Promise<string> {
  const res = await fetch(GROQ_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    }),
  })

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`Groq API error: ${errText}`)
  }

  const data: GroqResponse = await res.json()
  const text = data.choices?.[0]?.message?.content
  if (!text) throw new Error('Groq returned no text')
  return text.trim()
}

const NUMBER_WORDS: Record<string, string> = {
  zero: '0', one: '1', two: '2', three: '3', four: '4', five: '5',
  six: '6', seven: '7', eight: '8', nine: '9', ten: '10',
  eleven: '11', twelve: '12', thirteen: '13', fourteen: '14', fifteen: '15',
  sixteen: '16', seventeen: '17', eighteen: '18', nineteen: '19', twenty: '20',
}

function extractFacts(text: string): Set<string> {
  const numbers = text.match(/\b\d[\d,.:%]*\b/g) ?? []
  const capitalizedWords = text.match(/\b[A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*\b/g) ?? []
  const normalizedNumbers = numbers.map((n) => n.toLowerCase())

  const words = text.toLowerCase().match(/\b[a-z]+\b/g) ?? []
  const spelledNumbers = words.filter((w) => w in NUMBER_WORDS).map((w) => NUMBER_WORDS[w])

  return new Set([
    ...normalizedNumbers,
    ...spelledNumbers,
    ...capitalizedWords.map((s) => s.trim().toLowerCase()),
  ])
}

function factCheck(original: string, rewritten: string): boolean {
  const originalFacts = extractFacts(original)
  const rewrittenFacts = extractFacts(rewritten)

  if (originalFacts.size === 0) return true 

  let missing = 0
  for (const fact of originalFacts) {
    if (!rewrittenFacts.has(fact)) missing++
  }

  const missingRatio = missing / originalFacts.size
  return missingRatio <= 0.3
}

function buildPrompt(mood: Mood, originalText: string): string {
  return `Rewrite the following news text in a ${mood} tone.

Strict rules:
- Do NOT change, remove, or invent any names, dates, numbers, locations, or quotes.
- Do NOT add facts, events, or details that are not present in the original.
- Only adjust word choice, sentence rhythm, and framing to convey a ${mood} tone.
- Keep roughly the same length as the original.
- Return ONLY the rewritten text. No preamble, no explanation, no markdown.

Original text:
"""
${originalText}
"""`
}

Deno.serve(async (req: Request) => {
  try {
    const body: RequestBody = await req.json()
    const { articleId, mood } = body

    if (!articleId || !VALID_MOODS.includes(mood)) {
      return new Response(JSON.stringify({ error: 'Invalid articleId or mood' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    const { data: existing } = await supabase
      .from('rewrites')
      .select('*')
      .match({ article_id: articleId, mood })
      .maybeSingle()

    if (existing) {
      return new Response(JSON.stringify(existing), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const { data: article, error: articleError } = await supabase
      .from('articles')
      .select('original_text')
      .eq('id', articleId)
      .single()

    if (articleError || !article) {
      return new Response(JSON.stringify({ error: 'Article not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const prompt = buildPrompt(mood, article.original_text)
    const rewrittenText = await callGroq(prompt)
    const factCheckPassed = factCheck(article.original_text, rewrittenText)

    const { data: inserted, error: insertError } = await supabase
      .from('rewrites')
      .insert({
        article_id: articleId,
        mood,
        rewritten_text: rewrittenText,
        fact_check_passed: factCheckPassed,
      })
      .select()
      .single()

    if (insertError) {
      return new Response(JSON.stringify({ error: insertError.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify(inserted), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})