import { MOODS, type Mood } from '../../entities/article/types'
import styles from './MoodToggle.module.css'

interface Props {
  value: Mood
  onChange: (mood: Mood) => void
}

export function MoodToggle({ value, onChange }: Props) {
  return (
    <div className={styles.toggle}>
      {MOODS.map((mood) => (
        <button
          key={mood}
          onClick={() => onChange(mood)}
          className={mood === value ? styles.active : styles.button}
        >
          {mood}
        </button>
      ))}
    </div>
  )
}