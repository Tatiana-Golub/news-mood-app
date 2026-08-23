import styles from './FactCheckBadge.module.css'

export function FactCheckBadge({ passed }: { passed: boolean }) {
  if (passed) return null
  return (
    <div className={styles.warning}>
      ⚠️ Some facts (names, dates, or numbers) may have been altered in this rewrite.
      Compare with the original for accuracy.
    </div>
  )
}