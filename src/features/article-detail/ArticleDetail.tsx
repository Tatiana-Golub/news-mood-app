import { useState } from 'react'
import { useGetArticleByIdQuery } from '../../entities/article/articleApi'
import { useGetRewriteQuery } from '../../entities/rewrite/rewriteApi'
import { MoodToggle } from '../mood-toggle/MoodToggle'
import { FactCheckBadge } from './FactCheckBadge'
import type { Mood } from '../../entities/article/types'
import styles from './ArticleDetail.module.css'

export function ArticleDetail({ articleId }: { articleId: string }) {
  const [mood, setMood] = useState<Mood>('neutral')

  const { data: article, isLoading: articleLoading, error: articleError } =
    useGetArticleByIdQuery(articleId)

  const { data: rewrite, isFetching: rewriteLoading, error: rewriteError } =
    useGetRewriteQuery({ articleId, mood })

  if (articleLoading) return <p className={styles.status}>Loading article…</p>
  if (articleError || !article) return <p className={styles.status}>Couldn't load this article.</p>

  const date = new Date(article.published_at).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className={styles.wrap}>
      <h1 className={styles.title}>{article.title}</h1>
      <div className={styles.meta}>
        <span>{article.source_name}</span>
        <span> · {date}</span>
        <a href={article.source_url} target="_blank" rel="noopener noreferrer" className={styles.sourceLink}>
          View original source ↗
        </a>
      </div>

      <MoodToggle value={mood} onChange={setMood} />

      <div className={styles.columns}>
        <div className={styles.column}>
          <h2 className={styles.columnTitle}>Original</h2>
          <p className={styles.text}>{article.original_text}</p>
        </div>

        <div className={styles.column}>
          <h2 className={styles.columnTitle}>Rewritten — {mood}</h2>
          {rewriteLoading && <p className={styles.loading}>Generating {mood} version…</p>}
          {rewriteError && <p className={styles.error}>Couldn't generate this rewrite.</p>}
          {rewrite && (
            <>
              <FactCheckBadge passed={rewrite.fact_check_passed} />
              <p className={styles.text}>{rewrite.rewritten_text}</p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}