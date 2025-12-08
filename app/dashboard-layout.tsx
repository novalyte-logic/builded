'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'
import { Loader2 } from 'lucide-react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [authenticated, setAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    // Check authentication
    fetch('/api/auth/check')
      .then((res) => res.json())
      .then((data) => {
        if (!data.authenticated) {
          router.push('/login')
        } else {
          setAuthenticated(true)
        }
      })
      .catch(() => {
        router.push('/login')
      })
  }, [router])

  // Don't render dashboard layout on login page
  if (pathname === '/login') {
    return <>{children}</>
  }

  if (authenticated === null) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  if (!authenticated) {
    return null
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-dark-bg">
      <div className="flex-shrink-0">
        <Sidebar />
      </div>
      <main className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-6 min-w-0">
        {children}
      </main>
    </div>
  )
}

