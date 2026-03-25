import type { Metadata } from 'next'
import { Public_Sans, Source_Serif_4 } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const publicSans = Public_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-public-sans',
})

const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-source-serif',
})

export const metadata: Metadata = {
  title: {
    default: 'PahiraQuiz',
    template: '%s | PahiraQuiz',
  },
  description:
    'Gusto mo ba pahirapan (matuto) students mo? Build clear classroom quizzes from lesson notes with PahiraQuiz.',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${publicSans.variable} ${sourceSerif.variable} antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
