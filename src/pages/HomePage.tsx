import { RefreshButton } from '../features/news-grid/RefreshButton'
import { NewsGrid } from '../features/news-grid/NewsGrid'
import styles from './Homepage.module.css'


export function HomePage() {
    return (
        <div className={styles.wrap}>
            <div className={styles.headerWrap}>
                <h1 className={styles.title}>HOW DO YOU WANT TO READ THE NEWS TODAY?</h1>
                <p>Pick an article. Choose a mood. See it differently.</p>
                <RefreshButton />
            </div>
            <NewsGrid />
        </div>
    )
}