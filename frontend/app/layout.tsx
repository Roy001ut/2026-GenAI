import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MedAudit — Medical Bill Analyzer',
  description: 'AI-powered medical bill analysis, explanation, and anomaly detection',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
