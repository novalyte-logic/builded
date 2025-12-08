'use client'

import { motion } from 'framer-motion'
import StatusBadge from './StatusBadge'

interface KpiCardProps {
  title: string
  value: string | number
  delta: number
  description: string
  liveStatus?: boolean
}

export default function KpiCard({ title, value, delta, description, liveStatus }: KpiCardProps) {
  const isPositive = delta > 0
  const isZero = delta === 0
  const deltaColor = isZero ? 'text-gray-300' : isPositive ? 'text-emerald-400' : 'text-rose-400'
  const deltaLabel = `${isPositive ? '+' : ''}${delta}%`

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="bg-[#0f0f15] border border-white/5 rounded-xl p-5 shadow-lg hover:shadow-xl transition"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm text-gray-400">{title}</p>
          <p className="text-3xl font-bold text-white mt-1">{value}</p>
        </div>
        {liveStatus ? <StatusBadge status="live" /> : null}
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className={`font-medium ${deltaColor}`}>{deltaLabel}</span>
        <span className="text-gray-400 text-right">{description}</span>
      </div>
    </motion.div>
  )
}