import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Your Company Name',
    template: '%s | Your Company Name',
  },
  description:
    'Independent contract development for teams that need thoughtful engineering and reliable delivery.',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
