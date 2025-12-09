/**
 * Motion Utilities
 * 
 * Helper functions for motion animations
 */

import { motionDurations, motionEasing } from './config'

// Memoize reduced motion check for performance
let cachedReducedMotion: boolean | null = null
let mediaQuery: MediaQueryList | null = null
let listenerInitialized = false

/**
 * Check if user prefers reduced motion - memoized for performance
 * 
 * Note: This function is safe to call during render, but the event listener
 * is only set up once to avoid side effects.
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  
  // Cache the result
  if (cachedReducedMotion !== null) return cachedReducedMotion
  
  // Create media query listener if not exists (only once)
  if (!mediaQuery) {
    mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  }
  
  // Initialize listener only once to avoid side effects during render
  if (!listenerInitialized && mediaQuery) {
    listenerInitialized = true
    // Use setTimeout to defer listener setup outside of render
    setTimeout(() => {
      if (mediaQuery) {
        mediaQuery.addEventListener('change', (e) => {
          cachedReducedMotion = e.matches
        })
      }
    }, 0)
  }
  
  cachedReducedMotion = mediaQuery.matches
  return cachedReducedMotion
}

/**
 * Get animation config respecting reduced motion preference
 */
export function getAnimationConfig<T extends Record<string, any>>(config: T): T {
  if (prefersReducedMotion()) {
    // Return minimal animation config
    return {
      ...config,
      duration: 0,
      transition: { duration: 0 },
      animate: config.initial || {},
      initial: config.initial || {},
    } as T
  }
  return config
}

/**
 * Get transition config with duration and easing
 */
export function getTransition(
  duration: 'fast' | 'medium' | 'slow' = 'medium',
  easing: 'entrance' | 'interaction' | 'exit' | 'standard' = 'interaction'
) {
  if (prefersReducedMotion()) {
    return { duration: 0 }
  }
  
  return {
    duration: motionDurations[duration] / 1000,
    ease: motionEasing[easing],
  }
}

/**
 * Stagger children animation
 */
export function getStaggerConfig(
  delay: 'fast' | 'medium' | 'slow' = 'medium'
) {
  if (prefersReducedMotion()) {
    return { delayChildren: 0, staggerChildren: 0 }
  }
  
  const staggerDelays = {
    fast: 0.04,
    medium: 0.06,
    slow: 0.08,
  }
  
  return {
    delayChildren: 0,
    staggerChildren: staggerDelays[delay],
  }
}

