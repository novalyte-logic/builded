'use client'

import { LucideIcon } from 'lucide-react'
import clsx from 'clsx'
import CinematicKPICard, { CinematicKPICardProps } from './CinematicKPICard'

export interface KPIClusterProps {
  title: string
  icon: LucideIcon
  description?: string
  kpis: CinematicKPICardProps[]
  columns?: 1 | 2 | 3 | 4
}

export default function KPICluster({
  title,
  icon: Icon,
  description,
  kpis,
  columns = 3,
}: KPIClusterProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  }

  return (
    <div className="mb-8">
      {/* Cluster Header */}
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
        <div className="p-2 bg-primary/8 rounded-lg border border-primary/12">
          <Icon className="w-4 h-4 text-primary/90" />
        </div>
        <div className="flex-1">
          <h3 className="text-base font-semibold text-white tracking-tight">{title}</h3>
          {description && (
            <p className="text-xs text-gray-500/80 mt-1.5">{description}</p>
          )}
        </div>
      </div>

      {/* KPI Grid */}
      <div className={clsx('grid gap-5', gridCols[columns])}>
        {kpis.map((kpi, index) => (
          <CinematicKPICard
            key={index}
            {...kpi}
            priority={index === 0 ? 'high' : 'medium'}
          />
        ))}
      </div>
    </div>
  )
}

