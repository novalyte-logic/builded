'use client'

import { memo, useMemo } from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'
import { motionVariants, motionDurations } from '@/lib/motion/config'
import { prefersReducedMotion } from '@/lib/motion/utils'

export interface MotionSectionProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode
  variant?: keyof typeof motionVariants
  delay?: number
  stagger?: boolean
}

/**
 * Section-level motion wrapper - optimized for performance
 * Uses minimal delay to avoid blocking content visibility
 */
function MotionSection({
  children,
  variant = 'fadeInUp',
  delay = 0,
  stagger = false,
  ...props
}: MotionSectionProps) {
  const reducedMotion = useMemo(() => prefersReducedMotion(), [])
  const variantConfig = useMemo(() => motionVariants[variant], [variant])

  // Minimal delay - content appears quickly
  const transition = useMemo(() => 
    reducedMotion 
      ? { duration: 0 }
      : {
          duration: motionDurations.fast / 1000, // Fast - 80ms
          delay: Math.min(delay, 0.05), // Cap delay at 50ms max
        },
    [reducedMotion, delay]
  )

  return (
    <motion.div
      initial={reducedMotion ? {} : variantConfig.initial}
      animate={reducedMotion ? {} : variantConfig.animate}
      transition={transition}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// Memoize to prevent unnecessary re-renders
export default memo(MotionSection)

