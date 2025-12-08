'use client'

import { useEffect, useState } from 'react'
import { X, RotateCcw, Calendar, Tag } from 'lucide-react'
import { VersionHistory, EntityType } from '@/lib/types/audit'

interface VersionHistoryModalProps {
  entityType: EntityType
  entityId: string
  isOpen: boolean
  onClose: () => void
  onRevert: (version: VersionHistory) => void
}

export default function VersionHistoryModal({
  entityType,
  entityId,
  isOpen,
  onClose,
  onRevert,
}: VersionHistoryModalProps) {
  const [versions, setVersions] = useState<VersionHistory[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && entityId) {
      fetchVersions()
    }
  }, [isOpen, entityId])

  const fetchVersions = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/version-history?entity_type=${entityType}&entity_id=${entityId}`)
      if (!response.ok) throw new Error('Failed to fetch version history')

      const data = await response.json()
      setVersions(data.versions || [])
    } catch (error) {
      console.error('Error fetching version history:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-dark-surface border border-dark-border rounded-lg w-full max-w-3xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-dark-border flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Version History</h2>
            <p className="text-sm text-gray-400 mt-1">
              {entityType} • {entityId}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center text-gray-400">Loading versions...</div>
          ) : versions.length === 0 ? (
            <div className="text-center text-gray-400">No version history available</div>
          ) : (
            <div className="space-y-4">
              {versions.map((version) => (
                <div
                  key={version.id}
                  className="bg-dark-accent border border-dark-border rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-white">
                          Version {version.version_number}
                        </span>
                        {version.label && (
                          <span className="text-xs px-2 py-0.5 bg-primary/20 text-primary rounded-full flex items-center gap-1">
                            <Tag className="w-3 h-3" />
                            {version.label}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Calendar className="w-3 h-3" />
                        {new Date(version.created_at).toLocaleString()}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (confirm(`Revert to version ${version.version_number}? This will overwrite current data.`)) {
                          onRevert(version)
                          onClose()
                        }
                      }}
                      className="flex items-center gap-2 px-3 py-1.5 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors text-sm"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Revert
                    </button>
                  </div>
                  <div className="text-xs text-gray-400">
                    <p className="mb-1">Snapshot preview:</p>
                    <pre className="bg-dark-surface border border-dark-border rounded p-2 text-xs overflow-x-auto max-h-32">
                      {JSON.stringify(version.snapshot_json, null, 2)}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

