'use client'

import { memo, useMemo } from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'
import { pageTransition } from '@/lib/motion/config'
import { prefersReducedMotion } from '@/lib/motion/utils'

export interface MotionPageProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode
}

/**
 * Page-level motion wrapper - optimized for fast navigation
 * Uses minimal animation to avoid blocking navigation
 */
function MotionPage({ children, ...props }: MotionPageProps) {
  const reducedMotion = useMemo(() => prefersReducedMotion(), [])
  
  // Use instant transition for fast navigation - no delay
  const transition = useMemo(() => 
    reducedMotion ? { duration: 0 } : { duration: 0 },
    [reducedMotion]
  )

  return (
    <motion.div
      initial={reducedMotion ? {} : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={reducedMotion ? {} : { opacity: 0 }}
      transition={transition}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// Memoize to prevent unnecessary re-renders
export default memo(MotionPage)

