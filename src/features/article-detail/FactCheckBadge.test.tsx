import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FactCheckBadge } from './FactCheckBadge'

describe('FactCheckBadge', () => {
  it('renders nothing when fact check passed', () => {
    const { container } = render(<FactCheckBadge passed={true} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders a warning when fact check failed', () => {
    render(<FactCheckBadge passed={false} />)
    expect(screen.getByText(/may have been altered/i)).toBeInTheDocument()
  })
})