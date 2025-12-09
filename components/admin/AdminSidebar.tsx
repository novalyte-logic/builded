'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import {
  Target,
  TrendingUp,
  Briefcase,
  Settings,
  Code2,
  Terminal,
  BookOpen,
  Menu,
  X,
  ChevronRight,
  LucideIcon,
} from 'lucide-react'
import clsx from 'clsx'

interface NavItem {
  id: string
  label: string
  href: string
  icon: LucideIcon
  badge?: string
}

interface NavGroup {
  id: string
  label: string
  items: NavItem[]
}

const navConfig: NavGroup[] = [
  {
    id: 'intelligence',
    label: 'Intelligence & Growth',
    items: [
      {
        id: 'ai-core',
        label: 'AI Core',
        href: '/ai-core',
        icon: Target,
      },
      {
        id: 'ai-monitoring',
        label: 'AI Monitoring',
        href: '/ai-monitoring',
        icon: TrendingUp,
      },
      {
        id: 'ai-console',
        label: 'AI Console',
        href: '/admin/ai-console',
        icon: Code2,
        badge: 'LIVE',
      },
      {
        id: 'dealflow',
        label: 'Dealflow Intelligence',
        href: '/admin/dealflow',
        icon: Briefcase,
      },
      {
        id: 'market-intel',
        label: 'Market Intelligence',
        href: '/admin/market-intelligence',
        icon: TrendingUp,
      },
      {
        id: 'workforce',
        label: 'Workforce Intelligence',
        href: '/admin/workforce',
        icon: Briefcase,
      },
    ],
  },
  {
    id: 'system',
    label: 'System',
    items: [
      {
        id: 'settings',
        label: 'Settings',
        href: '/admin/settings',
        icon: Settings,
      },
      {
        id: 'mcp-registry',
        label: 'MCP Registry',
        href: '/admin/mcp-dashboard',
        icon: Code2,
        badge: 'LIVE',
      },
      {
        id: 'mcp-dashboard',
        label: 'MCP Orchestration',
        href: '/admin/mcp-dashboard',
        icon: Code2,
      },
      {
        id: 'signal-console',
        label: 'Signal Console',
        href: '/admin/signal-console',
        icon: Terminal,
        badge: 'LIVE',
      },
      {
        id: 'mcp-docs',
        label: 'MCP Docs',
        href: '/admin/mcp-docs',
        icon: BookOpen,
      },
    ],
  },
]

interface AdminSidebarProps {
  className?: string
}

export default function AdminSidebar({ className }: AdminSidebarProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    intelligence: true,
    system: true,
  })

  // Auto-expand groups containing active items
  useEffect(() => {
    setExpandedGroups((prev) => {
      const next = { ...prev }
      navConfig.forEach((group) => {
        const hasActive = group.items.some(
          (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
        )
        if (hasActive && !prev[group.id]) {
          next[group.id] = true
        }
      })
      return next
    })
  }, [pathname])

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }))
  }

  const NavItemComponent = ({
    item,
    isActive,
    isCollapsed: collapsed,
  }: {
    item: NavItem
    isActive: boolean
    isCollapsed: boolean
  }) => {
    const Icon = item.icon

    return (
      <Link
        href={item.href}
        onClick={() => setIsMobileOpen(false)}
        className={clsx(
          'group relative flex items-center gap-3 px-3.5 py-2.5 rounded-md text-sm font-medium transition-all duration-150',
          isActive
            ? 'bg-primary/8 text-primary border-l-2 border-primary shadow-[0_0_0_1px_rgba(59,130,246,0.08)]'
            : 'text-gray-400 hover:text-white hover:bg-white/5 border-l-2 border-transparent',
          collapsed && 'px-2 justify-center'
        )}
        title={collapsed ? item.label : undefined}
      >
        <Icon className={clsx('w-4 h-4 flex-shrink-0', isActive ? 'text-primary' : 'text-gray-500 group-hover:text-gray-300')} />
        {!collapsed && (
          <>
            <span className="flex-1 text-[13px] tracking-tight">{item.label}</span>
            {item.badge && (
              <span className="px-1.5 py-0.5 text-[10px] font-medium bg-status-live/12 text-status-live rounded border border-status-live/25">
                {item.badge}
              </span>
            )}
          </>
        )}
      </Link>
    )
  }

  const SidebarContent = ({ collapsed }: { collapsed: boolean }) => (
    <>
      {/* Header */}
      <div className="p-5 border-b border-white/5 flex-shrink-0">
        {!collapsed ? (
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2.5 tracking-tight">
              <span className="w-1.5 h-1.5 rounded-full bg-status-live animate-pulse" />
              Intelligence Console
            </h2>
            <p className="text-[11px] text-gray-500/80 mt-1.5 tracking-wide uppercase">Novalyte™ AI</p>
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-status-live animate-pulse" />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2 min-h-0 scrollbar-hide">
        {navConfig.map((group) => (
          <div key={group.id} className="space-y-1.5">
            {!collapsed && (
              <button
                type="button"
                onClick={() => toggleGroup(group.id)}
                className="w-full flex items-center justify-between px-3 py-2 text-[10px] tracking-wider text-gray-500/70 uppercase rounded-md hover:bg-white/5 hover:text-gray-400 transition-all duration-150"
              >
                <span>{group.label}</span>
                <ChevronRight
                  className={clsx(
                    'w-3 h-3 transition-transform duration-200 text-gray-500/50',
                    expandedGroups[group.id] ? 'rotate-90' : 'rotate-0'
                  )}
                />
              </button>
            )}
            {expandedGroups[group.id] && (
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive =
                    pathname === item.href || pathname.startsWith(`${item.href}/`)
                  return (
                    <NavItemComponent
                      key={item.id}
                      item={item}
                      isActive={isActive}
                      isCollapsed={collapsed}
                    />
                  )
                })}
              </div>
            )}
          </div>
        ))}
      </nav>
    </>
  )

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-dark-surface/95 backdrop-blur-sm border border-dark-border rounded-lg text-gray-400 hover:text-white hover:bg-dark-hover transition-colors shadow-lg"
        aria-label="Toggle menu"
      >
        {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <aside
        className={clsx(
          'hidden lg:flex flex-col h-screen bg-dark-surface/98 backdrop-blur-sm border-r border-white/5 transition-all duration-300',
          isCollapsed ? 'w-16' : 'w-64',
          className
        )}
      >
        <SidebarContent collapsed={isCollapsed} />
        {/* Collapse Toggle */}
        <div className="p-4 border-t border-white/5 flex-shrink-0">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full flex items-center justify-center p-2 rounded-md border border-white/5 hover:bg-white/5 text-gray-500 hover:text-gray-300 transition-all duration-150"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4 rotate-180" />
            )}
          </button>
        </div>
      </aside>

      {/* Mobile Drawer */}
      <aside
        className={clsx(
          'lg:hidden fixed left-0 top-0 h-full w-64 bg-dark-surface/98 backdrop-blur-md border-r border-dark-border z-50 transform transition-transform duration-300 ease-in-out shadow-xl',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <SidebarContent collapsed={false} />
      </aside>
    </>
  )
}

