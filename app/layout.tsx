import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Secret Game',
  description: 'Laruin mo to beh',
  icons: {
    icon: '/buti%20nalang%20na%20solve%20mo%20beh.png',
    shortcut: '/buti%20nalang%20na%20solve%20mo%20beh.png',
    apple: '/buti%20nalang%20na%20solve%20mo%20beh.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
