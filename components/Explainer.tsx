'use client'

import { useState, useRef, useEffect } from 'react'
import { HelpCircle, X } from 'lucide-react'

interface ExplainerProps {
  title: string
  what: string
  why: string
  how: string[]
  children: React.ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right'
  className?: string
}

export default function Explainer({
  title,
  what,
  why,
  how,
  children,
  position = 'top',
  className = '',
}: ExplainerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  const getPositionClasses = () => {
    switch (position) {
      case 'bottom':
        return 'top-full left-1/2 -translate-x-1/2 mt-2'
      case 'left':
        return 'right-full top-1/2 -translate-y-1/2 mr-2'
      case 'right':
        return 'left-full top-1/2 -translate-y-1/2 ml-2'
      default:
        return 'bottom-full left-1/2 -translate-x-1/2 mb-2'
    }
  }

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      <div
        className="relative inline-flex items-center group"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onTouchStart={(e) => {
          e.preventDefault()
          setIsOpen(!isOpen)
        }}
      >
        {children}
        <HelpCircle className="w-3 h-3 ml-1.5 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-help" />
      </div>

      {isOpen && (
        <div
          ref={tooltipRef}
          className={`absolute z-50 w-80 bg-dark-surface border border-dark-border rounded-lg shadow-xl p-4 ${getPositionClasses()}`}
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
          role="tooltip"
          aria-label={title}
        >
          <div className="flex items-start justify-between mb-3">
            <h4 className="text-sm font-semibold text-white">{title}</h4>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="Close tooltip"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <p className="text-gray-400 font-medium mb-1">What is this?</p>
              <p className="text-gray-300 leading-relaxed">{what}</p>
            </div>

            <div>
              <p className="text-gray-400 font-medium mb-1">Why it matters</p>
              <p className="text-gray-300 leading-relaxed">{why}</p>
            </div>

            <div>
              <p className="text-gray-400 font-medium mb-1">How to use it</p>
              <ul className="list-disc list-inside space-y-1 text-gray-300">
                {how.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Arrow pointer */}
          <div
            className={`absolute w-2 h-2 bg-dark-surface border-r border-b border-dark-border transform rotate-45 ${
              position === 'bottom'
                ? '-top-1 left-1/2 -translate-x-1/2'
                : position === 'left'
                ? '-right-1 top-1/2 -translate-y-1/2'
                : position === 'right'
                ? '-left-1 top-1/2 -translate-y-1/2'
                : '-bottom-1 left-1/2 -translate-x-1/2'
            }`}
          />
        </div>
      )}
    </div>
  )
}

