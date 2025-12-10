import Link from 'next/link'

async function getConfig(moduleKey: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/admin/ai/monitoring/module-config/${moduleKey}`, {
    cache: 'no-store',
  })
  if (!res.ok) return null
  return res.json()
}

export default async function ModuleConfigPage({ params }: { params: { moduleKey: string } }) {
  const config = await getConfig(params.moduleKey)

  if (!config) {
    return (
      <div className="p-8 text-gray-300">
        <p>Module config not found.</p>
        <Link href="/ai-monitoring" className="text-primary underline">
          Back to AI Monitoring
        </Link>
      </div>
    )
  }

  return (
    <div className="p-8 bg-dark-bg min-h-screen space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Module Configuration</h1>
        <p className="text-sm text-gray-400">Module: {params.moduleKey}</p>
      </div>
      <div className="bg-dark-surface border border-dark-border rounded-lg p-6 space-y-4">
        <div className="text-sm text-gray-300">
          <p>Latency Threshold: {config.latencyThresholdMs}ms</p>
          <p>Drift Threshold: {config.driftThresholdPct}</p>
          <p>Fallbacks Enabled: {config.fallbacksEnabled ? 'Yes' : 'No'}</p>
        </div>
        <Link href="/ai-monitoring" className="text-primary underline text-sm">
          Back to AI Monitoring
        </Link>
      </div>
    </div>
  )
}

