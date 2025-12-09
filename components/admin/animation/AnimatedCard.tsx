'use client'

import { motion, HTMLMotionProps } from 'framer-motion'
import { useMemo } from 'react'
import { prefersReducedMotion } from '@/lib/motion/utils'
import { motionDurations, motionEasing } from '@/lib/motion/config'
import clsx from 'clsx'

export interface AnimatedCardProps extends Omit<HTMLMotionProps<'div'>, 'initial' | 'animate' | 'whileHover'> {
  children: React.ReactNode
  delay?: number
  className?: string
}

/**
 * AnimatedCard - Premium micro-interactions for cards
 * 
 * Features:
 * - Fade-in + upward motion on mount
 * - Subtle scale + shadow on hover
 * - Respects prefers-reduced-motion
 * - Short durations (150-250ms)
 */
export default function AnimatedCard({
  children,
  delay = 0,
  className,
  ...props
}: AnimatedCardProps) {
  const reducedMotion = useMemo(() => prefersReducedMotion(), [])

  // Mount animation: fade-in + slight upward motion
  const initial = reducedMotion
    ? {}
    : {
        opacity: 0,
        y: 8,
      }

  const animate = reducedMotion
    ? {}
    : {
        opacity: 1,
        y: 0,
      }

  // Hover animation: very subtle scale + shadow intensification
  const whileHover = reducedMotion
    ? {}
    : {
        scale: 1.01,
        transition: {
          duration: motionDurations.medium / 1000,
          ease: motionEasing.interaction,
        },
      }

  const transition = reducedMotion
    ? { duration: 0 }
    : {
        duration: motionDurations.medium / 1000, // ~200ms
        delay,
        ease: motionEasing.entrance,
      }

  return (
    <motion.div
      initial={initial}
      animate={animate}
      whileHover={whileHover}
      transition={transition}
      className={clsx(
        'relative',
        // Shadow intensification on hover via CSS (more performant)
        'transition-shadow duration-200',
        'hover:shadow-lg hover:shadow-black/20',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  )
}

