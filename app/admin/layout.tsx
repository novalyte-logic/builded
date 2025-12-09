'use client'

import AdminSidebar from '@/components/admin/AdminSidebar'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-dark-bg">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto overflow-x-hidden px-8 py-8 min-w-0 lg:ml-0">
        <div className="max-w-[1920px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}

