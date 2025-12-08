'use client'

import { useState } from 'react'
import Link from 'next/link'
import AssessmentQueue from '@/components/AssessmentQueue'
import AssessmentDetail from '@/components/AssessmentDetail'
import StatusBadge from '@/components/StatusBadge'
import { FileText, Users, ArrowRight, TrendingUp } from 'lucide-react'

export default function AssessmentsPage() {
  const [selectedAssessment, setSelectedAssessment] = useState<any | null>(null)

  return (
    <div className="p-8 bg-dark-bg min-h-screen">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-white">Patient Assessments</h1>
            <p className="text-gray-400">Review and manage patient assessment queue</p>
          </div>
          <StatusBadge status="live" />
        </div>
      </div>

      {/* Cross-talk Banner */}
      {selectedAssessment && (
        <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-primary" />
              <p className="text-sm text-gray-300">
                View demand forecast for {selectedAssessment.path || 'this flow'}
              </p>
            </div>
            <Link
              href={`/admin/insights/demand?serviceLine=${encodeURIComponent(selectedAssessment.path || 'ALL')}`}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm"
            >
              View Demand Forecast
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Assessment Queue */}
        <div>
          <AssessmentQueue
            onSelectAssessment={(assessment) => setSelectedAssessment(assessment)}
            selectedAssessmentId={selectedAssessment?.id || null}
          />
        </div>

        {/* Right: Detail Panel */}
        <div>
          {selectedAssessment ? (
            <AssessmentDetail
              assessment={selectedAssessment}
              onClose={() => setSelectedAssessment(null)}
              onUpdateLead={() => {
                console.log('Update lead:', selectedAssessment.id)
              }}
            />
          ) : (
            <div className="bg-dark-surface border border-dark-border rounded-lg p-12 text-center">
              <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">Select an assessment to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
