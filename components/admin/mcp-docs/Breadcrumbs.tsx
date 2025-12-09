'use client'

import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'
import clsx from 'clsx'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center gap-2 text-sm mb-6">
      <Link
        href="/admin/mcp-docs"
        className="text-gray-500/80 hover:text-white transition-colors flex items-center gap-1.5"
      >
        <Home className="w-3.5 h-3.5" />
        <span>MCP Docs</span>
      </Link>
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <ChevronRight className="w-3.5 h-3.5 text-gray-500/60" />
          {item.href ? (
            <Link
              href={item.href}
              className="text-gray-500/80 hover:text-white transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-white">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  )
}

