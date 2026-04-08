import type { Metadata } from 'next'
import { TrainerRoute } from '../../src/features/trainer/TrainerRoute'

export const metadata: Metadata = {
  title: 'ULTRABINDS',
  description: 'A browser-based ULTRAKILL weapon and variant bind trainer.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function TrainerPage() {
  return <TrainerRoute />
}
