import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from '@/components/providers/Providers'
import { SiteHeader } from '@/components/navigation/SiteHeader'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'EstrichManager - Qualitätsmanagement für Estrichwerke',
  description: 'Die führende Compliance-Management-Software für EN13813 konforme Estrichproduktion. Digitales Qualitätsmanagement für Estrichwerke.',
  keywords: 'Estrich, EN13813, Qualitätsmanagement, Compliance, Estrichwerke, CE-Kennzeichnung, FPC, ITT',
  metadataBase: new URL('https://estrichmanager.de'),
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon.png', type: 'image/png' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: '/favicon.png',
  },
  openGraph: {
    title: 'EstrichManager',
    description: 'Digitales Qualitätsmanagement für Estrichwerke',
    url: 'https://estrichmanager.de',
    siteName: 'EstrichManager',
    type: 'website',
    images: [
      {
        url: '/logo.png',
        width: 1024,
        height: 1024,
        alt: 'EstrichManager Logo',
      },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <SiteHeader />
            <main className="flex-1">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  )
}