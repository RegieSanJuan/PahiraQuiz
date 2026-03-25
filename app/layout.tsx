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
        url: '/c6ed42b8-8a65-49d8-b93a-7e8daef81e3f.png',
        type: 'image/png',
        sizes: '1024x1024',
      },
    ],
    shortcut: '/c6ed42b8-8a65-49d8-b93a-7e8daef81e3f.png',
    apple: '/c6ed42b8-8a65-49d8-b93a-7e8daef81e3f.png',
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
