import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { NewsCard } from './NewsCard'
import { mockArticle } from '../../test/mocked-articles'

describe('NewsCard', () => {
  it('renders the article title and source', () => {
    render(
      <MemoryRouter>
        <NewsCard article={mockArticle} />
      </MemoryRouter>
    )
    expect(screen.getByText(mockArticle.title)).toBeInTheDocument()
    expect(screen.getByText(new RegExp(mockArticle.source_name))).toBeInTheDocument()
  })

  it('renders the image when image_url is present', () => {
    const articleWithImage = { ...mockArticle, image_url: 'https://example.com/photo.jpg' }
    render(
      <MemoryRouter>
        <NewsCard article={articleWithImage} />
      </MemoryRouter>
    )
    expect(screen.getByRole('img')).toHaveAttribute('src', 'https://example.com/photo.jpg')
  })

  it('links to the article detail page', () => {
    render(
      <MemoryRouter>
        <NewsCard article={mockArticle} />
      </MemoryRouter>
    )
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', `/article/${mockArticle.id}`)
  })
})
