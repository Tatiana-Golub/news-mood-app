import { useParams, Link } from 'react-router-dom'
import { ArticleDetail } from '../features/article-detail/ArticleDetail'
import styles from './ArticlePage.module.css'

export function ArticlePage() {
  const { id } = useParams<{ id: string }>()

  if (!id) return <p>Article not found.</p>

  return (
    <div>
      <div className={styles.wrap}>
        <Link to="/">← Back to all articles</Link>
      </div>
      <ArticleDetail articleId={id} />
    </div>
  )
}