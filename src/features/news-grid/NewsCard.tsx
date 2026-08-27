import { Link } from 'react-router-dom'
import type { Article } from '../../entities/article/types'
import styles from './NewsCard.module.css'

export function NewsCard({ article }: { article: Article }) {
  const date = new Date(article.published_at).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <Link to={`/article/${article.id}`} className={styles.card}>
      {article.image_url && (
        <img src={article.image_url} alt={article.title} className={styles.image} />
      )}
      <div className={styles.body}>
        <h3 className={styles.title}>{article.title}</h3>
        <span className={styles.meta}>
          {article.source_name} · {date}
        </span>
      </div>
    </Link>
  )
}