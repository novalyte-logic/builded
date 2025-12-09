'use client'

import { motion, HTMLMotionProps } from 'framer-motion'
import { useMemo } from 'react'
import { prefersReducedMotion } from '@/lib/motion/utils'
import { motionDurations, motionEasing } from '@/lib/motion/config'

export interface PageTransitionProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode
}

/**
 * PageTransition - Lightweight page entrance animation
 * 
 * Features:
 * - Fade + slight slide on mount
 * - Respects prefers-reduced-motion
 * - Fast duration for instant feel
 * - Use to wrap admin pages
 */
export default function PageTransition({ children, ...props }: PageTransitionProps) {
  const reducedMotion = useMemo(() => prefersReducedMotion(), [])

  const initial = reducedMotion
    ? {}
    : {
        opacity: 0,
        y: 4,
      }

  const animate = reducedMotion
    ? {}
    : {
        opacity: 1,
        y: 0,
      }

  const transition = reducedMotion
    ? { duration: 0 }
    : {
        duration: motionDurations.fast / 1000, // ~150ms
        ease: motionEasing.entrance,
      }

  return (
    <motion.div
      initial={initial}
      animate={animate}
      transition={transition}
      {...props}
    >
      {children}
    </motion.div>
  )
}

