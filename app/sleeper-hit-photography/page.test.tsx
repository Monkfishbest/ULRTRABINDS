import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import SleeperHitPhotographyLayout from './layout'
import SleeperHitPhotographyPage from './page'

describe('sleeper hit photography page', () => {
  it('renders the photography home page with route-based navigation', () => {
    render(
      <SleeperHitPhotographyLayout>
        <SleeperHitPhotographyPage />
      </SleeperHitPhotographyLayout>,
    )

    expect(screen.getByRole('link', { name: 'Back to site' })).toHaveAttribute('href', '/')
    expect(screen.getAllByRole('heading', { name: 'Sleeper Hit Photography' })).toHaveLength(2)
    expect(screen.getByRole('link', { name: 'Events' })).toHaveAttribute(
      'href',
      '/sleeper-hit-photography/events',
    )
    expect(screen.getAllByText('Home')).toHaveLength(2)
  })
})
