import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Page from './page'

describe('home page', () => {
  it('renders the lean company sections and reveals the fun stuff link', () => {
    render(<Page />)

    expect(
      screen.getByRole('heading', {
        name: 'Build calmer systems, ship faster, and keep complexity under control.',
      }),
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'About' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Start a conversation.' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Fun stuff' }))

    expect(screen.getByRole('link', { name: 'ULTRABINDS' })).toHaveAttribute('href', '/trainer')
  })
})
