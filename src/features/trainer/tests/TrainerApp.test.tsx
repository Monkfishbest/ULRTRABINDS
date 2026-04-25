import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { createDefaultTrainerConfig } from '../config'
import { TrainerApp } from '../TrainerApp'

describe('TrainerApp', () => {
  it('renders the cue image through next/image after starting a round', () => {
    const config = createDefaultTrainerConfig()

    for (const actionId of Object.keys(config.enabledActions)) {
      config.enabledActions[actionId as keyof typeof config.enabledActions] = actionId === 'shotgun-1'
    }

    config.showTextLabels = true
    window.localStorage.setItem('ultrakill-bind-trainer/v1/config', JSON.stringify(config))

    render(<TrainerApp />)

    fireEvent.click(screen.getByRole('button', { name: 'Start' }))

    const cueImage = screen.getByRole('img', { name: 'Shotgun Variant 1' })
    expect(cueImage).toHaveAttribute('src', '/trainer-images/shotgun-1.png')
  })
})
