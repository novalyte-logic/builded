/**
 * Novalyte™ AI - Global Motion Configuration
 * 
 * Centralized motion tokens and easing curves for consistent,
 * premium animations across the God's Eye Admin dashboard.
 */

// Motion Duration Tokens - Optimized for fast navigation
export const motionDurations = {
  fast: 80, // 60-100ms for instant feel
  medium: 120, // 100-150ms for smooth but fast
  slow: 200, // 180-220ms max for entrances
} as const

// Easing Curves
export const motionEasing = {
  // Premium entrance: easeOutQuint
  entrance: [0.19, 1, 0.22, 1] as [number, number, number, number],
  // Hover/tap interactions: easeOut
  interaction: [0.0, 0, 0.2, 1] as [number, number, number, number],
  // Smooth exits
  exit: [0.4, 0, 1, 1] as [number, number, number, number],
  // Standard ease
  standard: [0.4, 0, 0.2, 1] as [number, number, number, number],
} as const

// Stagger Delays
export const motionStagger = {
  fast: 40,
  medium: 60,
  slow: 80,
} as const

// Common Animation Variants - Optimized for performance
export const motionVariants = {
  // Fade in from slight offset - minimal movement
  fadeInUp: {
    initial: { opacity: 0, y: 4 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0 },
  },
  // Fade in from left
  fadeInLeft: {
    initial: { opacity: 0, x: -12 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 12 },
  },
  // Fade in from right
  fadeInRight: {
    initial: { opacity: 0, x: 12 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -12 },
  },
  // Scale fade
  scaleFade: {
    initial: { opacity: 0, scale: 0.96 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.96 },
  },
  // Slide in from top
  slideInTop: {
    initial: { opacity: 0, y: -6 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -6 },
  },
} as const

// Page Transition Config - Fast navigation, minimal delay
export const pageTransition = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: {
    duration: motionDurations.fast / 1000, // 80ms - instant feel
    ease: motionEasing.interaction,
  },
} as const

// KPI Card Hover Config
export const kpiCardHover = {
  scale: 1.02,
  transition: {
    duration: motionDurations.medium / 1000,
    ease: motionEasing.interaction,
  },
} as const

// KPI Card Tap Config
export const kpiCardTap = {
  scale: 0.99,
  transition: {
    duration: motionDurations.fast / 1000,
    ease: motionEasing.interaction,
  },
} as const

// Chart Animation Config
export const chartAnimation = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  transition: {
    duration: motionDurations.medium / 1000,
    ease: motionEasing.entrance,
  },
} as const

// Tooltip Animation Config
export const tooltipAnimation = {
  initial: { opacity: 0, scale: 0.95, y: 4 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: 4 },
  transition: {
    duration: motionDurations.fast / 1000,
    ease: motionEasing.interaction,
  },
} as const

// Live Badge Pulse Config
export const liveBadgePulse = {
  animate: {
    boxShadow: [
      '0 0 0 0 rgba(34, 197, 94, 0.3)',
      '0 0 0 4px rgba(34, 197, 94, 0.3)',
      '0 0 0 0 rgba(34, 197, 94, 0.3)',
    ] as string[],
  },
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: 'easeInOut' as const,
  },
}

// Sidebar Nav Hover Config
export const navHover = {
  x: 4,
  transition: {
    duration: motionDurations.fast / 1000,
    ease: motionEasing.interaction,
  },
} as const

// Sidebar Nav Active Config
export const navActive = {
  scale: 1.05,
  transition: {
    duration: motionDurations.fast / 1000,
    ease: motionEasing.interaction,
  },
} as const

// Alert Slide In Config
export const alertSlideIn = {
  initial: { opacity: 0, y: -6 },
  animate: { opacity: 1, y: 0 },
  transition: {
    duration: motionDurations.medium / 1000,
    ease: motionEasing.entrance,
  },
} as const

// AI Insight Reveal Config
export const aiInsightReveal = {
  initial: { opacity: 0, y: 4 },
  animate: { opacity: 1, y: 0 },
  transition: {
    duration: motionDurations.fast / 1000,
    ease: motionEasing.interaction,
  },
} as const

// Reduced Motion Override
export const getReducedMotionConfig = () => {
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return {
      duration: 0,
      transition: { duration: 0 },
      animate: {},
      initial: {},
    }
  }
  return {}
}

