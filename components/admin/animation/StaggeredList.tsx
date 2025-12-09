'use client'

import { motion } from 'framer-motion'
import { useMemo } from 'react'
import { prefersReducedMotion } from '@/lib/motion/utils'
import { motionDurations, motionEasing } from '@/lib/motion/config'
import clsx from 'clsx'

export interface StaggeredListProps {
  items: React.ReactNode[]
  delayStep?: number // Delay between each item (default 0.05-0.1s)
  className?: string
  itemClassName?: string
  direction?: 'vertical' | 'horizontal'
}

/**
 * StaggeredList - Reveals items in sequence with subtle animation
 * 
 * Features:
 * - Sequential fade-in + slight motion
 * - Configurable delay step
 * - Respects prefers-reduced-motion
 * - Use for tables, grids, card lists
 */
export default function StaggeredList({
  items,
  delayStep = 0.06, // 60ms default
  className,
  itemClassName,
  direction = 'vertical',
}: StaggeredListProps) {
  const reducedMotion = useMemo(() => prefersReducedMotion(), [])

  // Animation config for each item
  const itemVariants = useMemo(() => {
    if (reducedMotion) {
      return {
        initial: {},
        animate: {},
        exit: {},
      }
    }

    const offset = direction === 'vertical' ? { y: 6 } : { x: 6 }

    return {
      initial: {
        opacity: 0,
        ...offset,
      },
      animate: {
        opacity: 1,
        y: 0,
        x: 0,
      },
      exit: {
        opacity: 0,
      },
    }
  }, [reducedMotion, direction])

  // Container config with stagger
  const containerVariants = useMemo(() => {
    if (reducedMotion) {
      return {
        initial: {},
        animate: {},
      }
    }

    return {
      initial: {},
      animate: {
        transition: {
          staggerChildren: delayStep,
          delayChildren: 0,
        },
      },
    }
  }, [reducedMotion, delayStep])

  const itemTransition = useMemo(() => {
    if (reducedMotion) {
      return { duration: 0 }
    }

    return {
      duration: motionDurations.medium / 1000, // ~200ms
      ease: motionEasing.entrance,
    }
  }, [reducedMotion])

  if (items.length === 0) {
    return null
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className={clsx(
        direction === 'vertical' ? 'space-y-2' : 'flex gap-2',
        className
      )}
    >
      {items.map((item, index) => (
        <motion.div
          key={index}
          variants={itemVariants}
          transition={itemTransition}
          className={itemClassName}
        >
          {item}
        </motion.div>
      ))}
    </motion.div>
  )
}

