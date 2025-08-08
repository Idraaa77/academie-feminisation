import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Académie de Féminisation',
  description: 'École girly avec une touche Sabrina Carpenter',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}
