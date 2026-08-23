import { useRefreshNewsMutation } from '../../entities/article/articleApi'
import styles from './RefreshButton.module.css'

export function RefreshButton() {
  const [refreshNews, { isLoading, data, error }] = useRefreshNewsMutation()

  return (
    <div className={styles.wrap}>
      <button onClick={() => refreshNews()} disabled={isLoading} className={styles.button}>
        {isLoading ? 'Refreshing…' : 'Refresh news'}
      </button>
      {data && (
        <span className={styles.status}>
          Added {data.inserted} new article{data.inserted === 1 ? '' : 's'}.
        </span>
      )}
      {error && <span className={styles.error}>Couldn't refresh — try again shortly.</span>}
    </div>
  )
}