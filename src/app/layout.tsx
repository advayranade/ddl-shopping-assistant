import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ShopSmart — AI Shopping Assistant Demo',
  description: 'AI agent demo: shopping assistant with natural language product search',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-gray-50">{children}</body>
    </html>
  )
}
