'use client'

import { ReactNode } from 'react'
import clsx from 'clsx'

export interface ChartContainerProps {
  children: ReactNode
  title?: string
  className?: string
  minHeight?: number
}

export default function ChartContainer({
  children,
  title,
  className,
  minHeight = 320,
}: ChartContainerProps) {
  return (
    <div
      className={clsx(
        'bg-dark-surface/80 border border-white/5 rounded-xl p-6 backdrop-blur-sm',
        'shadow-[0px_1px_3px_rgba(0,0,0,0.3),0px_0px_0px_1px_rgba(255,255,255,0.02)]',
        className
      )}
    >
      {title && (
        <h3 className="text-base font-semibold text-white mb-5 tracking-tight">{title}</h3>
      )}
      <div
        className="w-full"
        style={{
          minHeight: `${minHeight}px`,
          padding: '12px',
        }}
      >
        <div
          className="w-full h-full"
          style={{
            width: '100%',
            height: 'auto',
            minHeight: '280px',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}

