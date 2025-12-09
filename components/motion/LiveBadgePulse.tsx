'use client'

import { motion } from 'framer-motion'
import { liveBadgePulse } from '@/lib/motion/config'
import { prefersReducedMotion } from '@/lib/motion/utils'

export interface LiveBadgePulseProps {
  children: React.ReactNode
  className?: string
}

/**
 * Wrapper for LIVE badges with gentle pulsing glow
 */
export default function LiveBadgePulse({ children, className }: LiveBadgePulseProps) {
  const reducedMotion = prefersReducedMotion()

  if (reducedMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      animate={liveBadgePulse.animate}
      transition={liveBadgePulse.transition}
      className={className}
    >
      {children}
    </motion.div>
  )
}

