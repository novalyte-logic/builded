import clsx from 'clsx'

type Status = 'live' | 'degraded' | 'offline'

interface StatusBadgeProps {
  status: Status
  label?: string
}

export default function StatusBadge({ status, label }: StatusBadgeProps) {
  const statusConfig = {
    live: {
      bg: 'bg-status-live/20',
      border: 'border-status-live',
      text: 'text-status-live',
      dot: 'bg-status-live',
    },
    degraded: {
      bg: 'bg-status-degraded/20',
      border: 'border-status-degraded',
      text: 'text-status-degraded',
      dot: 'bg-status-degraded',
    },
    offline: {
      bg: 'bg-status-offline/20',
      border: 'border-status-offline',
      text: 'text-status-offline',
      dot: 'bg-status-offline',
    },
  }

  const config = statusConfig[status]

  return (
    <div
      className={clsx(
        'inline-flex items-center gap-2 px-3 py-1 rounded-full border',
        config.bg,
        config.border,
        config.text,
        'text-xs font-medium'
      )}
    >
      <span className={clsx('w-2 h-2 rounded-full', config.dot, 'glow-pulse')} />
      <span>{label || status.toUpperCase()}</span>
    </div>
  )
}

