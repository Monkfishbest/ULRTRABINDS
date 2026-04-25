import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Page from './page'

describe('home page', () => {
  it('renders the lean company sections and reveals the fun stuff link', () => {
    render(<Page />)

    expect(
      screen.getByRole('heading', {
        name: 'this is the hero title',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: "I'm John, I don't quite know what i'm doing with my life" }),
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Start a conversation.' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Fun stuff' }))

    expect(screen.getByRole('link', { name: 'ULTRABINDS' })).toHaveAttribute('href', '/trainer')
  })
})
