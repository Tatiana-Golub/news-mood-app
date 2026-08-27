import type { Article, Rewrite } from '../entities/article/types'

export const mockArticle: Article = {
  id: 'article-1',
  external_id: 'ext-1',
  title: 'Local Council Approves New Park Budget',
  original_text: 'The council approved a $2 million budget for the new park on Tuesday.',
  source_name: 'Test Publisher',
  source_url: 'https://example.com/article-1',
  image_url: null,
  published_at: '2026-08-20T12:00:00Z',
  created_at: '2026-08-20T12:00:00Z',
}

export const mockArticleSecondary: Article = {
  id: 'article-2',
  external_id: 'ext-2',
  title: 'Second Headline',
  original_text: 'Body text two.',
  source_name: 'Publisher B',
  source_url: 'https://example.com/article-2',
  image_url: null,
  published_at: '2026-08-19T12:00:00Z',
  created_at: '2026-08-19T12:00:00Z',
}

export const mockArticles: Article[] = [mockArticle, mockArticleSecondary]

export const mockRewriteJoyful: Rewrite = {
  id: 'rewrite-1',
  article_id: 'article-1',
  mood: 'joyful',
  rewritten_text: 'Great news! The council happily approved a $2 million budget for the new park.',
  fact_check_passed: true,
  created_at: '2026-08-20T12:05:00Z',
}

export const mockRewriteNeutral: Rewrite = {
  id: 'rewrite-3',
  article_id: 'article-1',
  mood: 'neutral',
  rewritten_text: 'A $2 million budget for the new park was approved by the council on Tuesday.',
  fact_check_passed: true,
  created_at: '2026-08-20T12:04:00Z',
}

export const mockRewriteSadFailedCheck: Rewrite = {
  id: 'rewrite-2',
  article_id: 'article-1',
  mood: 'sad',
  rewritten_text: 'Sadly, funds were set aside for a park.',
  fact_check_passed: false,
  created_at: '2026-08-20T12:06:00Z',
}