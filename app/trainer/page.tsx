import type { Metadata } from 'next'
import { TrainerRoute } from '../../src/features/trainer/TrainerRoute'

export const metadata: Metadata = {
  title: { absolute: 'ULTRABINDS' },
  description: 'A browser-based ULTRAKILL weapon and variant bind trainer.',
  icons: {
    icon: '/favicon_ultrabinds.ico',
  },
  robots: {
    index: false,
    follow: false,
  },
}

export default function TrainerPage() {
  return <TrainerRoute />
}
