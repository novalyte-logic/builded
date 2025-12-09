'use client'

import { useState, useMemo, memo } from 'react'
import { motion } from 'framer-motion'
import { LucideIcon, Info, Sparkles } from 'lucide-react'
import clsx from 'clsx'
import { kpiCardHover, kpiCardTap, tooltipAnimation, aiInsightReveal } from '@/lib/motion/config'
import { prefersReducedMotion } from '@/lib/motion/utils'

export interface KPITooltip {
  explanation: string
  calculation: string
  whyItMatters: string
}

export interface KPIAIInsight {
  insight: string
  context?: string
}

export interface CinematicKPICardProps {
  label: string
  value: string | number
  subtitle?: string
  trend?: {
    value: number
    direction: 'up' | 'down' | 'neutral'
  }
  icon: LucideIcon
  isLoading?: boolean
  tooltip?: KPITooltip
  aiInsight?: KPIAIInsight
  priority?: 'high' | 'medium' | 'low' // For z-index stacking
}

function CinematicKPICard({
  label,
  value,
  subtitle,
  trend,
  icon: Icon,
  isLoading,
  tooltip,
  aiInsight,
  priority = 'medium',
}: CinematicKPICardProps) {
  // All hooks must be called before any conditional returns
  const [showTooltip, setShowTooltip] = useState(false)
  const [showAIInsight, setShowAIInsight] = useState(false)
  
  // Memoize reduced motion check
  const reducedMotion = useMemo(() => prefersReducedMotion(), [])

  const zIndexClass = priority === 'high' ? 'z-10' : priority === 'medium' ? 'z-5' : 'z-0'
  
  // Memoize hover config
  const hoverConfig = useMemo(() => 
    reducedMotion ? {} : {
      scale: kpiCardHover.scale,
      borderColor: 'rgba(59, 130, 246, 0.5)',
      boxShadow: '0px 4px 14px rgba(0,0,0,0.35)',
      y: -2,
      transition: kpiCardHover.transition,
    },
    [reducedMotion]
  )

  // Early return after all hooks
  if (isLoading) {
    return (
      <div className="bg-dark-surface/60 border border-white/5 rounded-xl p-6 animate-pulse">
        <div className="flex items-center justify-between mb-5">
          <div className="h-4 w-28 bg-white/5 rounded"></div>
          <div className="h-9 w-9 bg-white/5 rounded-lg"></div>
        </div>
        <div className="h-9 w-32 bg-white/5 rounded mb-3"></div>
        {subtitle && <div className="h-3.5 w-36 bg-white/5 rounded"></div>}
      </div>
    )
  }

  return (
    <motion.div
      className={clsx(
        'relative bg-dark-surface/80 border border-white/5 rounded-xl p-6',
        'cursor-pointer backdrop-blur-sm',
        'transition-all duration-200',
        zIndexClass
      )}
      style={{
        boxShadow: '0px 1px 3px rgba(0,0,0,0.3), 0px 0px 0px 1px rgba(255,255,255,0.02)',
      }}
      whileHover={hoverConfig}
      whileTap={reducedMotion ? {} : kpiCardTap}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Tooltip */}
      {tooltip && showTooltip && (
        <motion.div
          className={clsx(
            'absolute left-full ml-4 top-0 w-80 bg-dark-accent border border-primary/30 rounded-lg p-4',
            'shadow-[0px_8px_24px_rgba(0,0,0,0.5)]',
            'z-50 backdrop-blur-sm'
          )}
          style={{
            boxShadow: '0px 8px 24px rgba(0,0,0,0.5), 0px 0px 0px 1px rgba(255,255,255,0.1)',
          }}
          initial={reducedMotion ? {} : tooltipAnimation.initial}
          animate={reducedMotion ? {} : tooltipAnimation.animate}
          exit={reducedMotion ? {} : tooltipAnimation.exit}
          transition={reducedMotion ? { duration: 0 } : tooltipAnimation.transition}
        >
          <div className="flex items-start gap-2 mb-3">
            <Info className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-white mb-2">{label}</h4>
              <p className="text-xs text-gray-300 mb-3 leading-relaxed">{tooltip.explanation}</p>
              <div className="mb-3">
                <p className="text-xs font-medium text-gray-400 mb-1">How it&apos;s calculated:</p>
                <p className="text-xs text-gray-300 leading-relaxed">{tooltip.calculation}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 mb-1">Why it matters:</p>
                <p className="text-xs text-gray-300 leading-relaxed">{tooltip.whyItMatters}</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-500/90 uppercase tracking-wider">{label}</span>
          {tooltip && (
            <Info
              className={clsx(
                'w-3.5 h-3.5 text-gray-500/60 transition-colors',
                'hover:text-primary/80 cursor-help'
              )}
            />
          )}
        </div>
        <div className="p-2 bg-primary/8 rounded-lg border border-primary/15">
          <Icon className="w-4 h-4 text-primary/90" />
        </div>
      </div>

      {/* Value */}
      <div className="flex items-baseline gap-3 mb-3">
        <span className="text-3xl font-bold text-white tracking-tight">{value}</span>
        {trend && (
          <div
            className={clsx(
              'flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md',
              trend.direction === 'up' && 'text-status-live bg-status-live/12 border border-status-live/20',
              trend.direction === 'down' && 'text-status-degraded bg-status-degraded/12 border border-status-degraded/20',
              trend.direction === 'neutral' && 'text-gray-500 bg-white/5 border border-white/5'
            )}
          >
            {trend.direction === 'up' && '↑'}
            {trend.direction === 'down' && '↓'}
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>

      {/* Subtitle */}
      {subtitle && (
        <p className="text-xs text-gray-500/80 mb-0">{subtitle}</p>
      )}

      {/* AI Insight */}
      {aiInsight && (
        <motion.div
          className={clsx(
            'mt-4 pt-4 border-t border-white/5',
            showAIInsight ? 'opacity-100' : 'opacity-70'
          )}
          onMouseEnter={() => setShowAIInsight(true)}
          onMouseLeave={() => setShowAIInsight(false)}
          initial={reducedMotion ? {} : aiInsightReveal.initial}
          animate={reducedMotion ? {} : (showAIInsight ? aiInsightReveal.animate : {})}
          transition={reducedMotion ? { duration: 0 } : aiInsightReveal.transition}
        >
          <div className="flex items-start gap-2">
            <Sparkles className="w-3.5 h-3.5 text-primary/70 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-gray-500/90 leading-relaxed">
              <span className="font-medium text-primary/70">AI Insight: </span>
              {aiInsight.insight}
            </p>
          </div>
          {aiInsight.context && showAIInsight && (
            <motion.p
              className="text-xs text-gray-500/70 mt-1.5 ml-5 leading-relaxed"
              initial={reducedMotion ? {} : { opacity: 0, y: 4 }}
              animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
              transition={reducedMotion ? { duration: 0 } : { duration: 0.2 }}
            >
              {aiInsight.context}
            </motion.p>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}

// Memoize to prevent unnecessary re-renders
export default memo(CinematicKPICard)

