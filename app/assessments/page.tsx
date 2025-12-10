'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import AssessmentQueue from '@/components/AssessmentQueue'
import AssessmentDetail from '@/components/AssessmentDetail'
import StatusBadge from '@/components/StatusBadge'
import { FileText, Users, ArrowRight, TrendingUp } from 'lucide-react'
import { AssessmentListResponse } from '@/app/api/assessments/list/route'
import { AssessmentDetail as ApiAssessmentDetail } from '@/lib/assessments/mockData'

type AssessmentStatus =
  | 'in_progress'
  | 'completed'
  | 'qualified'
  | 'unqualified'
  | 'needs_review'

type FlowType = 'TRT' | 'GLP1' | 'PEPTIDES' | 'RECOVERY' | 'LONGEVITY' | 'GENERAL'
type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH'
type LtvBand = 'LOW' | 'MEDIUM' | 'HIGH'

type UseAssessmentsArgs = {
  status?: string
  flowType?: string
  riskLevel?: string
  ltvBand?: string
  startDate?: string
  endDate?: string
}

function useAssessments(args: UseAssessmentsArgs) {
  const [state, setState] = useState<{
    data?: AssessmentListResponse
    error?: Error
    loading: boolean
  }>({ loading: true })

  useEffect(() => {
    let cancelled = false
    async function load() {
      setState((prev) => ({ ...prev, loading: true }))
      try {
        const params = new URLSearchParams()
        if (args.status) params.set('status', args.status)
        if (args.flowType) params.set('flowType', args.flowType)
        if (args.riskLevel) params.set('riskLevel', args.riskLevel)
        if (args.ltvBand) params.set('ltvBand', args.ltvBand)
        if (args.startDate) params.set('startDate', args.startDate)
        if (args.endDate) params.set('endDate', args.endDate)

        const res = await fetch(`/api/assessments/list?${params.toString()}`)
        const json = (await res.json()) as AssessmentListResponse
        if (!cancelled) {
          setState({ data: json, error: undefined, loading: false })
        }
      } catch (err) {
        if (!cancelled) {
          setState({ data: undefined, error: err as Error, loading: false })
        }
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [args.status, args.flowType, args.riskLevel, args.ltvBand, args.startDate, args.endDate])

  const refetch = async () => {
    try {
      const params = new URLSearchParams()
      if (args.status) params.set('status', args.status)
      if (args.flowType) params.set('flowType', args.flowType)
      if (args.riskLevel) params.set('riskLevel', args.riskLevel)
      if (args.ltvBand) params.set('ltvBand', args.ltvBand)
      if (args.startDate) params.set('startDate', args.startDate)
      if (args.endDate) params.set('endDate', args.endDate)

      const res = await fetch(`/api/assessments/list?${params.toString()}`)
      const json = (await res.json()) as AssessmentListResponse
      setState({ data: json, error: undefined, loading: false })
    } catch (err) {
      setState((prev) => ({ data: prev.data, error: err as Error, loading: false }))
    }
  }

  return {
    data: state.data,
    error: state.error,
    isLoading: state.loading,
    refetch,
  }
}

type QueueAssessment = {
  id: string
  created_at: string
  flow_type: string
  path: string
  status: string
  risk_level: 'low' | 'moderate' | 'high' | null
  predicted_ltv_band: 'low' | 'medium' | 'high' | null
  acquisition_channel: string | null
}

export default function AssessmentsPage() {
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [flowTypeFilter, setFlowTypeFilter] = useState<string>('')
  const [riskLevelFilter, setRiskLevelFilter] = useState<string>('')
  const [ltvBandFilter, setLtvBandFilter] = useState<string>('')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string | null>(null)
  const [selectedAssessmentDetail, setSelectedAssessmentDetail] = useState<ApiAssessmentDetail | undefined>()
  const [loadingDetail, setLoadingDetail] = useState(false)

  const { data, error, isLoading, refetch } = useAssessments({
    status: statusFilter,
    flowType: flowTypeFilter,
    riskLevel: riskLevelFilter,
    ltvBand: ltvBandFilter,
    startDate,
    endDate,
  })

  const queueData: QueueAssessment[] = useMemo(() => {
    if (!data?.items) return []
    return data.items.map((item) => ({
      id: item.id,
      created_at: item.createdAt,
      flow_type: item.flowType,
      path: item.flowType,
      status: item.status,
      risk_level: item.riskLevel.toLowerCase() as 'low' | 'moderate' | 'high',
      predicted_ltv_band: item.ltvBand.toLowerCase() as 'low' | 'medium' | 'high',
      acquisition_channel: item.channel,
    }))
  }, [data?.items])

  useEffect(() => {
    if (!selectedAssessmentId) {
      setSelectedAssessmentDetail(undefined)
      return
    }

    let cancelled = false
    async function loadDetail() {
      setLoadingDetail(true)
      try {
        const res = await fetch(`/api/assessments/${selectedAssessmentId}`)
        const json = (await res.json()) as { assessment?: ApiAssessmentDetail }
        if (!cancelled) {
          setSelectedAssessmentDetail(json.assessment)
        }
      } catch (err) {
        if (!cancelled) {
          setSelectedAssessmentDetail(undefined)
        }
      } finally {
        if (!cancelled) setLoadingDetail(false)
      }
    }
    loadDetail()
    return () => {
      cancelled = true
    }
  }, [selectedAssessmentId])

  const handleStatusUpdate = async (status: AssessmentStatus) => {
    if (!selectedAssessmentDetail) return
    await fetch(`/api/assessments/${selectedAssessmentDetail.id}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setSelectedAssessmentDetail({ ...selectedAssessmentDetail, status })
    refetch()
  }

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
      {selectedAssessmentDetail && (
        <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-primary" />
              <p className="text-sm text-gray-300">
                View demand forecast for {selectedAssessmentDetail.flowType || 'this flow'}
              </p>
            </div>
            <Link
              href={`/admin/insights/demand?serviceLine=${encodeURIComponent(selectedAssessmentDetail.flowType || 'ALL')}`}
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
            onSelectAssessment={(assessment) => setSelectedAssessmentId(assessment.id)}
            selectedAssessmentId={selectedAssessmentId}
            filters={{
              status: statusFilter,
              flow_type: flowTypeFilter,
              risk_level: riskLevelFilter,
              predicted_ltv_band: ltvBandFilter,
              startDate,
              endDate,
            }}
            onFiltersChange={(next) => {
              setStatusFilter(next.status)
              setFlowTypeFilter(next.flow_type)
              setRiskLevelFilter(next.risk_level)
              setLtvBandFilter(next.predicted_ltv_band)
              setStartDate(next.startDate)
              setEndDate(next.endDate)
            }}
            data={queueData}
            isLoading={isLoading}
            error={error ? error.message : data?.error}
          />
        </div>

        {/* Right: Detail Panel */}
        <div>
          {selectedAssessmentDetail ? (
            <AssessmentDetail
              assessment={
                selectedAssessmentDetail && {
                  id: selectedAssessmentDetail.id,
                  created_at: selectedAssessmentDetail.createdAt,
                  updated_at: selectedAssessmentDetail.updatedAt,
                  flow_type: selectedAssessmentDetail.flowType,
                  path: selectedAssessmentDetail.flowType,
                  status: selectedAssessmentDetail.status,
                  risk_level: selectedAssessmentDetail.riskLevel.toLowerCase() as 'low' | 'moderate' | 'high',
                  predicted_ltv_band: selectedAssessmentDetail.ltvBand.toLowerCase() as 'low' | 'medium' | 'high',
                  city: selectedAssessmentDetail.patientProfile.location,
                  country: null,
                  acquisition_channel: selectedAssessmentDetail.channel,
                  ai_summary_json: {
                    summary: selectedAssessmentDetail.aiSummary,
                    keySymptoms: selectedAssessmentDetail.primaryConcerns,
                    riskFactors: [],
                    redFlags: [],
                    recommendedPath: selectedAssessmentDetail.recommendedNextStep,
                    urgency: 'medium',
                    highlights: selectedAssessmentDetail.goals,
                  },
                  lead: { id: 'N/A', status: selectedAssessmentDetail.status, priority: 'medium', notes: null },
                  patient: {
                    age: selectedAssessmentDetail.patientProfile.age,
                    gender: selectedAssessmentDetail.patientProfile.gender,
                    state: selectedAssessmentDetail.patientProfile.location,
                    serviceInterest: selectedAssessmentDetail.flowType,
                  },
                  symptoms: selectedAssessmentDetail.primaryConcerns,
                  goals: selectedAssessmentDetail.goals,
                  lifestyle: [],
                  redFlags: [],
                  triageSummary: {
                    clinicalRisk: selectedAssessmentDetail.riskLevel.toLowerCase() as 'low' | 'moderate' | 'high',
                    conversionPotential: selectedAssessmentDetail.ltvBand === 'HIGH' ? 'high' : 'moderate',
                    keySignals: selectedAssessmentDetail.goals.slice(0, 3),
                    riskFactors: [],
                    recommendedAction: selectedAssessmentDetail.recommendedNextStep,
                  },
                }
              }
              onClose={() => setSelectedAssessmentId(null)}
              onUpdateLead={() => {
                if (selectedAssessmentDetail) {
                  handleStatusUpdate('qualified')
                }
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
