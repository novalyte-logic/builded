'use client'

import { useEffect, useState } from 'react'
import { X, CheckCircle2, AlertCircle } from 'lucide-react'

export interface ToastProps {
  message: string
  type?: 'success' | 'error'
  duration?: number
  onClose?: () => void
}

export default function Toast({
  message,
  type = 'success',
  duration = 3000,
  onClose,
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => onClose?.(), 300) // Wait for fade out
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  if (!isVisible) return null

  const Icon = type === 'success' ? CheckCircle2 : AlertCircle
  const bgColor = type === 'success' ? 'bg-status-live/20 border-status-live/50' : 'bg-status-offline/20 border-status-offline/50'
  const iconColor = type === 'success' ? 'text-status-live' : 'text-status-offline'

  return (
    <div
      className={`fixed top-4 right-4 z-50 ${bgColor} border rounded-lg p-4 shadow-lg min-w-[300px] max-w-md transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
      }`}
    >
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 ${iconColor} flex-shrink-0 mt-0.5`} />
        <div className="flex-1">
          <p className="text-sm text-white font-medium">{message}</p>
        </div>
        <button
          onClick={() => {
            setIsVisible(false)
            setTimeout(() => onClose?.(), 300)
          }}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

