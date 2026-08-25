import { useGetArticlesQuery } from '../../entities/article/articleApi'
import { NewsCard } from './NewsCard'
import { NewsCardSkeleton } from './NewsCardSkeleton'
import styles from './NewsGrid.module.css'

export function NewsGrid() {
  const { data: articles, isLoading, error } = useGetArticlesQuery()

  if (isLoading) {
    return (
      <div className={styles.grid}>
        {Array.from({ length: 10 }).map((_, i) => (
          <NewsCardSkeleton key={i} />
        ))}
      </div>
    )
  }
  if (error) return <p className={styles.status}>Couldn't load articles. Try refreshing.</p>
  if (!articles || articles.length === 0) return <p className={styles.status}>No articles yet. Try refreshing.</p>

  return (
    <div className={styles.grid}>
      {articles.map((article) => (
        <NewsCard key={article.id} article={article} />
      ))}
    </div>
  )
}