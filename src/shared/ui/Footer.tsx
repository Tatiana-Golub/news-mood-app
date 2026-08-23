import styles from './Footer.module.css'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className={styles.footer}>
      <p>© {year} Mood News Grid</p>
      <p>
        News data powered by{' '}
        <a
          href="https://freenewsapi.io"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.link}
        >
          FreeNewsAPI
        </a>
      </p>
    </footer>
  )
}