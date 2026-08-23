export type Mood = 'joyful' | 'sad' | 'neutral' | 'ironic'

export const MOODS: Mood[] = ['joyful', 'sad', 'neutral', 'ironic']

export interface Article {
  id: string
  external_id: string
  title: string
  original_text: string
  source_name: string
  source_url: string
  image_url: string | null
  published_at: string
  created_at: string
}

export interface Rewrite {
  id: string
  article_id: string
  mood: Mood
  rewritten_text: string
  fact_check_passed: boolean
  created_at: string
}