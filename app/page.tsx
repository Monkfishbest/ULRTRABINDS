import type { Metadata } from 'next'
import { HomePage } from '../src/features/site/HomePage'

export const metadata: Metadata = {
  title: 'Independent Contract Development',
  description:
    'A lean contract development studio site with services, background, and contact details.',
}

export default function Page() {
  return <HomePage />
}
