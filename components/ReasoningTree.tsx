'use client'

import { ChevronRight, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'

interface ReasoningNode {
  id: string
  label: string
  value: number
  confidence: number
  children?: ReasoningNode[]
  status: 'passed' | 'failed' | 'warning'
}

interface ReasoningTreeProps {
  data: ReasoningNode
}

export default function ReasoningTree({ data }: ReasoningTreeProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle2 className="w-4 h-4 text-status-live" />
      case 'failed':
        return <XCircle className="w-4 h-4 text-status-offline" />
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-status-degraded" />
      default:
        return null
    }
  }

  const renderNode = (node: ReasoningNode, level: number = 0) => {
    return (
      <div key={node.id} className="ml-4">
        <div className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-dark-hover transition-colors">
          {node.children && node.children.length > 0 && (
            <ChevronRight className="w-3 h-3 text-gray-500" />
          )}
          {getStatusIcon(node.status)}
          <span className="text-sm text-white flex-1">{node.label}</span>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400">
              {(node.confidence * 100).toFixed(0)}%
            </span>
            <div className="w-20 bg-dark-accent rounded-full h-1.5">
              <div
                className="bg-primary h-1.5 rounded-full"
                style={{ width: `${node.confidence * 100}%` }}
              />
            </div>
          </div>
        </div>
        {node.children && (
          <div className="ml-4 border-l border-dark-border pl-2">
            {node.children.map((child) => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="bg-dark-surface border border-dark-border rounded-lg p-4">
      <div className="text-sm font-medium text-white mb-4">Reasoning Tree</div>
      {renderNode(data)}
    </div>
  )
}

