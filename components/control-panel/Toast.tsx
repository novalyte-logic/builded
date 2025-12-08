'use client'

import { useEffect } from 'react'
import { CheckCircle, X } from 'lucide-react'

interface ToastProps {
  message: string
  onClose: () => void
  duration?: number
}

export default function Toast({ message, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  return (
    <div className="fixed bottom-4 right-4 bg-dark-surface border border-dark-border rounded-lg shadow-xl p-4 flex items-center gap-3 z-50 animate-in slide-in-from-bottom-2">
      <CheckCircle className="w-5 h-5 text-status-live flex-shrink-0" />
      <p className="text-sm text-white">{message}</p>
      <button
        onClick={onClose}
        className="text-gray-400 hover:text-white transition-colors ml-2"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

