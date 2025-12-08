import type { Metadata } from 'next'
import './globals.css'
import DashboardLayout from './dashboard-layout'

export const metadata: Metadata = {
  title: 'Novalyte™ AI | God\'s Eye Admin Dashboard',
  description: 'Mission Control for Men\'s Health AI Platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <DashboardLayout>{children}</DashboardLayout>
      </body>
    </html>
  )
}

