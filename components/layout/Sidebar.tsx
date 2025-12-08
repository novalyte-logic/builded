'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { ChevronDown, LogOut } from 'lucide-react'
import clsx from 'clsx'
import TooltipInfoModal from '@/components/TooltipInfoModal'
import { navigationConfig, NavigationItem, findNavigationSectionByHref } from '@/config/navigation'

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({})
  const [isMini, setIsMini] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<NavigationItem[]>([])

  const allNavItems = useMemo(
    () => navigationConfig.flatMap((section) => section.items),
    []
  )

  const filteredGroups = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return navigationConfig
    return navigationConfig
      .map((section) => {
        const items = section.items.filter(
          (item) =>
            item.label.toLowerCase().includes(term) || item.description.toLowerCase().includes(term)
        )
        return items.length ? { ...section, items } : null
      })
      .filter(Boolean) as typeof navigationConfig
  }, [searchTerm])

  useEffect(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) {
      setSearchResults([])
      return
    }
    const filtered = allNavItems.filter((item) => item.label.toLowerCase().includes(term))
    setSearchResults(filtered.slice(0, 8))
  }, [searchTerm, allNavItems])

  // Auto-expand groups containing active items
  useEffect(() => {
    setOpenGroups((prev) => {
      const next: Record<string, boolean> = { ...prev }
      navigationConfig.forEach((section) => {
        if (prev[section.id] === undefined) {
          const hasActive = section.items.some(
            (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
          )
          // Auto-expand if contains active item, or if it's the first section (core-platform)
          next[section.id] = hasActive || section.id === 'core-platform'
        }
      })
      // Ensure at least one section is open
      if (Object.keys(next).length === 0) {
        next['core-platform'] = true
      }
      return next
    })
  }, [pathname])

  const toggleGroup = (id: string) => {
    setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div
      className={clsx(
        'bg-dark-surface border-r border-dark-border flex flex-col h-screen transition-all duration-200',
        isMini ? 'w-16' : 'w-64'
      )}
    >
      {/* Header */}
      <div className="p-6 border-b border-dark-border flex-shrink-0">
        {!isMini ? (
          <>
            <h1 className="text-xl font-bold text-white">
              Novalyte<sup className="text-xs text-gray-400">™</sup>
            </h1>
            <p className="text-xs text-gray-500 mt-1">God&apos;s Eye Admin</p>
          </>
        ) : (
          <div className="text-center text-sm font-bold text-white">
            N<sup className="text-[10px] text-gray-400">™</sup>
          </div>
        )}
        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsMini((prev) => !prev)}
            className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-dark-border hover:bg-dark-hover text-gray-400"
            title={isMini ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isMini ? '<' : '>'}
          </button>
          {!isMini && (
            <input
              aria-label="Search navigation"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchResults.length > 0) {
                  router.push(searchResults[0].href)
                  setSearchTerm('')
                  setSearchResults([])
                }
              }}
              placeholder="Search navigation…"
              className="flex-1 bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-sm text-gray-200 focus:border-primary focus:outline-none"
            />
          )}
        </div>
        {!isMini && searchResults.length > 0 && (
          <div className="mt-2 rounded-lg bg-dark-bg border border-dark-border divide-y divide-dark-border shadow-lg overflow-hidden">
            {searchResults.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                  setSearchTerm('')
                  setSearchResults([])
                }}
                className="block px-3 py-2 text-sm text-gray-200 hover:bg-dark-hover transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className={clsx('flex-1 overflow-y-auto p-4 space-y-1 min-h-0', isMini && 'px-2')}>
        {filteredGroups.map((section, sectionIndex) => (
          <div key={section.id} className="space-y-1">
            <button
              type="button"
              onClick={() => toggleGroup(section.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  toggleGroup(section.id)
                }
              }}
              aria-expanded={!!openGroups[section.id]}
              className={clsx(
                'w-full flex items-center justify-between px-4 py-2 text-[11px] tracking-wide text-gray-500 uppercase mt-4 rounded-lg hover:bg-dark-hover transition-colors text-left',
                isMini && 'px-2 justify-center'
              )}
              title={isMini ? section.label : section.items.slice(0, 3).map((i) => i.label).join(' · ')}
            >
              {!isMini && <span>{section.label}</span>}
              <ChevronDown
                className={clsx(
                  'w-4 h-4 transition-transform text-gray-500',
                  openGroups[section.id] ? 'rotate-180' : 'rotate-0'
                )}
              />
            </button>
            {openGroups[section.id] && (
              <div className={clsx('space-y-1', isMini && 'pl-1')}>
                {section.items.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)

                  return (
                    <div key={item.id} className="relative group">
                      <Link
                        href={item.href}
                        className={clsx(
                          'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                          isActive
                            ? 'bg-primary/20 text-primary border border-primary/30'
                            : 'text-gray-400 hover:text-white hover:bg-dark-hover',
                          isMini && 'px-2 justify-center'
                        )}
                        title={isMini ? item.label : undefined}
                      >
                        <Icon className="w-5 h-5" />
                        {!isMini && (
                          <>
                            <span className="flex-1">{item.label}</span>
                            {item.badge && (
                              <span className="px-2 py-0.5 text-xs bg-status-live/10 text-status-live rounded">
                                {item.badge}
                              </span>
                            )}
                            <div className="ml-auto">
                              <TooltipInfoModal
                                title={item.label}
                                description={item.description}
                                howTo={item.howTo}
                                examples={item.examples}
                              />
                            </div>
                          </>
                        )}
                      </Link>
                    </div>
                  )
                })}
              </div>
            )}
            {sectionIndex !== navigationConfig.length - 1 && <div className="h-px bg-dark-border my-3" />}
          </div>
        ))}
      </nav>

      {/* Footer - Superadmin Status & Logout */}
      <div className="p-4 border-t border-dark-border space-y-2 flex-shrink-0">
        <div className="px-4 py-2 bg-dark-accent rounded-lg">
          <p className="text-xs text-gray-400">Superadmin</p>
          <p className="text-sm font-medium text-white mt-1">Active</p>
        </div>
        <button
          onClick={async () => {
            await fetch('/api/auth/logout', { method: 'POST' })
            window.location.href = '/login'
          }}
          className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-dark-hover transition-colors"
        >
          <LogOut className="w-5 h-5" />
          {!isMini && <span>Logout</span>}
        </button>
      </div>
    </div>
  )
}

