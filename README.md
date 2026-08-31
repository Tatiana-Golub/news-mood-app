# News Mood App
Web application that pulls real news articles from an open source and rewrites them on demand in a chosen emotional tone (joyful, sad, neutral or ironic) keeping all factual details accurate.

---

## Screenshot
### Main Page
![Home page](./src/assets/screenshots/home-page.png)
### Article Details Page
![Article detail — original and rewritten side by side](./src/assets/screenshots/article-details-page.png)

---

🔗 Live Demo: https://news-mood-app.netlify.app/

---
## Features
- Real news articles fetched from an open source (FreeNewsApi.io), stored in Supabase Postgres
- Grid view of article titles, source, and publish date
- Click an article to open its detail page
- Mood toggle: joyful, sad, neutral, ironic
- Original and AI-rewritten text shown side by side
- Rewrites generated on demand and cached per article + mood, so a given combination is only generated once
- Automated fact-check pass flags rewrites that may have dropped a name, date, or number
- Link back to the original source article on detail view
- Manual "Refresh news" action to pull new articles
- Full unit & component test coverage

---

## Tech Stack
- **Frontend**
  - React
  - TypeScript
  - Redux Toolkit / RTK Query
  - Vite
  - React Router
  - CSS Modules
- **Backend**
  - Supabase (Postgres, Edge Functions, scheduled jobs)
  - Groq API (`openai/gpt-oss-120b`) for mood rewriting
  - FreeNewsApi.io as news source
- **Testing**
  - Vitest
  - React Testing Library
  - user-event

---

## Architecture
Project structure follows a feature-based approach:

```
src/
  app/                    # Store setup
  entities/
    article/                # Article types, RTK Query endpoints
    rewrite/                 # Rewrite types, RTK Query endpoints
  features/
    article-detail/          # Original + rewritten side-by-side view
    mood-toggle/               # Mood selector
    news-grid/                  # Grid, cards, refresh action
  pages/
    HomePage.tsx
    ArticlePage.tsx
  shared/
    lib/                     # Supabase client
    ui/                        # Footer
  test/                     # Mock utilities, setup

supabase/
  functions/
    fetch-news/               # Pulls articles from FreeNewsApi.io
    rewrite-article/            # Generates mood rewrites via Groq
```

---

## How news gets rewritten
`rewrite-article` sends the original text to Groq with an explicit instruction set: preserve every name, date, number, location, and quote exactly; don't summarize or add facts; only shift tone. After generation, a fact-check pass compares a "fact fingerprint" (numbers and capitalized names/places, spelled-out numbers normalized) between original and rewrite — if too much is missing, the rewrite is flagged in the UI with a warning badge rather than silently trusted.

---

## Fact-checking — how it works and what it doesn't catch
After each rewrite is generated, an automated pass compares a "fact fingerprint" extracted from the original and the rewritten text:
- All numbers, including spelled-out forms (`"5"` and `"five"` are normalized to match)
- All capitalized word sequences (names, places, organizations)

If more than 30% of the original's facts are missing from the rewrite, `fact_check_passed` is set to `false` and a warning badge is shown next to that rewrite in the UI.

This is a heuristic safety net, not a guarantee. The original text is always shown side by side with the rewrite specifically so a reader can verify accuracy themselves rather than relying on the badge alone.

---

## FreeNewsApi.io — known limitations
- Two-step API (`/v1/news` for a list of UUIDs, then `/v1/details` per UUID), so fetching N articles costs N+1 requests, not one
- Rate-limited to ~2 requests/second, so `fetch-news` paces requests with a delay, making a full refresh noticeably slower than a single-call API
- Response bodies can include unescaped HTML entities (`&amp;`) and occasional stray markup, cleaned client-side in `fetch-news` before storage

---

## How to run locally

```bash
# Clone the repo
https://github.com/Tatiana-Golub/news-mood-app.git
cd news-mood-app

# Install dependencies
npm install
```

Create `.env.local`:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-publishable-key
```

Set up Supabase (schema, RLS policies, edge function secrets — see `supabase/functions/`), then:

```bash
# Start the development server
npm run dev

# Run tests
npm run test
npm run test:coverage
```