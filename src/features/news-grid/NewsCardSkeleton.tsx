import styles from './NewsCardSkeleton.module.css'

export function NewsCardSkeleton() {
  return (
    <div className={styles.card}>
      <div className={styles.image} />
      <div className={styles.body}>
        <div className={styles.line} />
        <div className={styles.lineShort} />
        <div className={styles.meta} />
      </div>
    </div>
  )
}