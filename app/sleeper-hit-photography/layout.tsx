import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { SleeperHitPhotographyLayout } from '../../src/features/photography/SleeperHitPhotographyLayout'

export const metadata: Metadata = {
  title: { absolute: 'Sleeper Hit Photography' },
  description: 'A minimal photography gallery with side navigation and placeholder collections.',
  icons: {
    icon: '📷',
  },
  robots: {
    index: false,
    follow: false,
  },
}

export default function SleeperHitPhotographyRootLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return <SleeperHitPhotographyLayout>{children}</SleeperHitPhotographyLayout>
}
