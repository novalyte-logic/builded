'use client'

import { useState } from 'react'
import AssessmentQueue from '@/components/AssessmentQueue'
import AssessmentDetail from '@/components/AssessmentDetail'
import StatusBadge from '@/components/StatusBadge'
import { FileText, Users } from 'lucide-react'

export default function AssessmentsPage() {
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string | null>(null)

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Assessment Queue */}
        <div>
          <AssessmentQueue
            onSelectAssessment={(assessment) => setSelectedAssessmentId(assessment.id)}
            selectedAssessmentId={selectedAssessmentId}
          />
        </div>

        {/* Right: Detail Panel */}
        <div>
          {selectedAssessmentId ? (
            <AssessmentDetail
              assessmentId={selectedAssessmentId}
              onClose={() => setSelectedAssessmentId(null)}
              onUpdateLead={() => {
                // TODO: Open lead update modal
                console.log('Update lead:', selectedAssessmentId)
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

