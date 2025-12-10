import { ReasoningChain } from '@/lib/types/ai-core'
import Link from 'next/link'

async function getChain(id: string): Promise<ReasoningChain | null> {
  const base = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const url = new URL(`/api/admin/ai/reasoning-chains/${id}`, base)
  const res = await fetch(url.toString(), { cache: 'no-store' })
  if (!res.ok) return null
  try {
    return await res.json()
  } catch {
    return null
  }
}

function JsonBlock({ title, data }: { title: string; data: Record<string, unknown> }) {
  return (
    <div className="bg-dark-accent border border-dark-border rounded-lg p-4">
      <h3 className="text-sm font-semibold text-white mb-2">{title}</h3>
      <pre className="text-xs text-gray-300 whitespace-pre-wrap overflow-x-auto">{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}

export default async function ReasoningChainPage({ params }: { params: { id: string } }) {
  const chain = await getChain(params.id)
  if (!chain) {
    return (
      <div className="p-8 text-gray-300">
        <p>Reasoning chain not found.</p>
        <Link href="/ai-core" className="text-primary underline">
          Back to AI Core
        </Link>
      </div>
    )
  }

  return (
    <div className="p-8 bg-dark-bg min-h-screen space-y-6">
      <div className="text-xs text-gray-500">
        Intelligence & Growth / AI Core / Reasoning Chains / {chain.id}
      </div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Reasoning Chain</h1>
          <p className="text-sm text-gray-400">{new Date(chain.createdAt).toLocaleString()}</p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              chain.status === 'passed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
            }`}
          >
            {chain.status}
          </span>
          <span className="text-xs text-gray-400">Confidence: {chain.confidence}%</span>
          <span className="text-xs text-gray-400">Model: {chain.modelName}</span>
          <span className="text-xs text-gray-400">Latency: {chain.latencyMs}ms</span>
        </div>
      </div>

      <div className="bg-dark-surface border border-dark-border rounded-lg p-4 space-y-3">
        <h2 className="text-lg font-semibold text-white">Query</h2>
        <p className="text-sm text-gray-200">{chain.query}</p>
      </div>

      <div className="bg-dark-surface border border-dark-border rounded-lg p-4 space-y-3">
        <h2 className="text-lg font-semibold text-white">Reasoning Chain</h2>
        <pre className="text-sm text-gray-200 whitespace-pre-wrap leading-relaxed">{chain.fullReasoning}</pre>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <JsonBlock title="Model Inputs" data={chain.inputs} />
        <JsonBlock title="Model Outputs" data={chain.outputs} />
      </div>

      {chain.safetyFlags.hasSafetyFlag && (
        <div className="bg-dark-surface border border-status-degraded/30 rounded-lg p-4 space-y-2">
          <h3 className="text-sm font-semibold text-status-degraded">Safety & Overrides</h3>
          <p className="text-sm text-gray-300">Categories: {chain.safetyFlags.categories.join(', ')}</p>
          {chain.safetyFlags.notes && <p className="text-sm text-gray-400">{chain.safetyFlags.notes}</p>}
          <Link
            href={`/ai-core/safety-flags?chainId=${chain.id}`}
            className="text-xs text-status-degraded underline underline-offset-2"
          >
            Review in Safety Console
          </Link>
        </div>
      )}

      <Link href="/ai-core" className="text-primary underline text-sm">
        Back to AI Core
      </Link>
    </div>
  )
}

