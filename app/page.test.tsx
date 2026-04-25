import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Page from './page'

describe('home page', () => {
  it('renders the lean company sections and reveals the fun stuff link', () => {
    render(<Page />)

    expect(
      screen.getAllByRole('img', {
        name: 'a fish jumping out of water with a laptop with some terminal feedback',
      }),
    ).toHaveLength(1)
    expect(
      screen.getByRole('heading', {
        name: 'Software development and tutoring services',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: "Hi, I'm John" }),
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Start a conversation.' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Fun stuff' }))

    expect(screen.getByRole('link', { name: 'ULTRABINDS' })).toHaveAttribute('href', '/trainer')
  })
})
