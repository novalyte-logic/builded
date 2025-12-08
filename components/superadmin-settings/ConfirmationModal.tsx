'use client'

import { AlertTriangle, X } from 'lucide-react'

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'default'
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
}: ConfirmationModalProps) {
  if (!isOpen) return null

  const variantStyles = {
    danger: 'bg-red-500/20 border-red-500/30 text-red-400',
    warning: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400',
    default: 'bg-primary/20 border-primary/30 text-primary',
  }

  const buttonStyles = {
    danger: 'bg-red-500 hover:bg-red-600',
    warning: 'bg-yellow-500 hover:bg-yellow-600',
    default: 'bg-primary hover:bg-primary-dark',
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-dark-surface border border-dark-border rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-start gap-4 mb-4">
          {variant !== 'default' && (
            <AlertTriangle className={`w-6 h-6 ${variant === 'danger' ? 'text-red-400' : 'text-yellow-400'} flex-shrink-0 mt-0.5`} />
          )}
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
            <p className="text-sm text-gray-300">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-dark-accent border border-dark-border rounded-lg text-gray-300 hover:text-white hover:bg-dark-hover transition-colors text-sm"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className={`px-4 py-2 ${buttonStyles[variant]} text-white rounded-lg transition-colors text-sm`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

