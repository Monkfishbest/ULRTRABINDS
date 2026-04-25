import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import SleeperHitPhotographyLayout from './layout'
import SleeperHitPhotographyPage from './page'

vi.mock('../../src/features/photography/SleeperHitPhotographyDrive.server', () => ({
  loadGalleryCovers: async () => [
    {
      photos: [
        {
          alt: 'Mock event cover',
          caption: 'Mock event cover',
          height: 960,
          id: 'mock-event-cover',
          src: '/cat.webp',
          width: 1280,
        },
      ],
      section: {
        fallbackPhotos: [],
        folderEnvVar: 'PHOTOGRAPHY_EVENTS_FOLDER_ID',
        id: 'events',
        intro: '',
        title: 'Events',
      },
      source: 'fallback',
    },
  ],
}))

describe('sleeper hit photography page', () => {
  it('renders the photography home page with route-based navigation', async () => {
    const page = await SleeperHitPhotographyPage()

    render(
      <SleeperHitPhotographyLayout>
        {page}
      </SleeperHitPhotographyLayout>,
    )

    expect(screen.getByRole('link', { name: 'Back to site' })).toHaveAttribute('href', '/')
    expect(screen.getAllByRole('heading', { name: 'Sleeper Hit Photography' })).toHaveLength(2)
    expect(screen.getByRole('link', { name: 'Events' })).toHaveAttribute(
      'href',
      '/sleeper-hit-photography/events',
    )
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute(
      'href',
      '/sleeper-hit-photography',
    )
  })
})
