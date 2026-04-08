import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import TrainerPage from './page'

describe('trainer page', () => {
  it('renders the standalone trainer route with a way back to the main site', async () => {
    render(<TrainerPage />)

    expect(screen.getByRole('link', { name: 'Back to site' })).toHaveAttribute('href', '/')
    expect(await screen.findByRole('heading', { name: 'ULTRABINDS' })).toBeInTheDocument()
  })
})
