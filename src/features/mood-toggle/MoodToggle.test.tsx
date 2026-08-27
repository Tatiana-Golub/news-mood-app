import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MoodToggle } from './MoodToggle'

describe('MoodToggle', () => {
  it('renders a button for every mood', () => {
    render(<MoodToggle value="neutral" onChange={vi.fn()} />)
    expect(screen.getByText('joyful')).toBeInTheDocument()
    expect(screen.getByText('sad')).toBeInTheDocument()
    expect(screen.getByText('neutral')).toBeInTheDocument()
    expect(screen.getByText('ironic')).toBeInTheDocument()
  })

  it('calls onChange with the clicked mood', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<MoodToggle value="neutral" onChange={onChange} />)

    await user.click(screen.getByText('joyful'))

    expect(onChange).toHaveBeenCalledWith('joyful')
  })

  it('applies the active class to the current mood', () => {
    render(<MoodToggle value="sad" onChange={vi.fn()} />)
    const sadButton = screen.getByText('sad')
    const joyfulButton = screen.getByText('joyful')

    expect(sadButton.className).toContain('active')
    expect(joyfulButton.className).not.toContain('active')
  })
})