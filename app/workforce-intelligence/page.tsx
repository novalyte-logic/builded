'use client'

import { useState, useEffect } from 'react'
import { Brain, MapPin, TrendingUp, Zap, DollarSign } from 'lucide-react'
import StatusBadge from '@/components/StatusBadge'
import WeeklySummary from '@/components/workforce-intelligence/WeeklySummary'
import WorkforceHeatmap from '@/components/workforce-intelligence/WorkforceHeatmap'
import RoleDemandIndex from '@/components/workforce-intelligence/RoleDemandIndex'
import SupplyAvailabilityIndex from '@/components/workforce-intelligence/SupplyAvailabilityIndex'
import AIOpportunityScanner from '@/components/workforce-intelligence/AIOpportunityScanner'
import AIDeploymentRecommendations from '@/components/workforce-intelligence/AIDeploymentRecommendations'
import RevenueMetrics from '@/components/workforce-intelligence/RevenueMetrics'
import AlertsPanel from '@/components/workforce-intelligence/AlertsPanel'

export default function WorkforceIntelligencePage() {
  const [loading, setLoading] = useState(true)
  const [heatmapData, setHeatmapData] = useState<any>(null)
  const [demandIndex, setDemandIndex] = useState<any>(null)
  const [supplyIndex, setSupplyIndex] = useState<any>(null)
  const [opportunities, setOpportunities] = useState<any[]>([])
  const [deploymentRecs, setDeploymentRecs] = useState<any[]>([])
  const [weeklySummary, setWeeklySummary] = useState<any>(null)
  const [revenueMetrics, setRevenueMetrics] = useState<any>(null)
  const [alerts, setAlerts] = useState<any[]>([])

  useEffect(() => {
    fetchIntelligenceData()
    const interval = setInterval(fetchIntelligenceData, 300000) // Refresh every 5 minutes
    return () => clearInterval(interval)
  }, [])

  const fetchIntelligenceData = async () => {
    setLoading(true)
    try {
      const [overviewRes, opportunitiesRes, deploymentRes, summaryRes, metricsRes, alertsRes] = await Promise.all([
        fetch('/api/workforce/intelligence/overview'),
        fetch('/api/workforce/intelligence/opportunities'),
        fetch('/api/workforce/intelligence/deployment'),
        fetch('/api/workforce/intelligence/weekly-summary'),
        fetch('/api/workforce/intelligence/metrics'),
        fetch('/api/workforce/intelligence/alerts'),
      ])

      const overview = await overviewRes.json()
      const opps = await opportunitiesRes.json()
      const deployment = await deploymentRes.json()
      const summary = await summaryRes.json()
      const metrics = await metricsRes.json()
      const alertsData = await alertsRes.json()

      setHeatmapData(overview.heatmap)
      setDemandIndex(overview.demandIndex)
      setSupplyIndex(overview.supplyIndex)
      setOpportunities(opps.opportunities || [])
      setDeploymentRecs(deployment.recommendations || [])
      setWeeklySummary(summary.summary || null)
      setRevenueMetrics(metrics.metrics || null)
      setAlerts(alertsData.alerts || [])
    } catch (error) {
      console.error('Error fetching intelligence data:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 bg-dark-bg min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Brain className="w-8 h-8 text-primary" />
              Workforce Intelligence Engine
            </h1>
            <p className="text-gray-400 mt-2">
              Real-time control tower for clinical staffing supply & demand. AI-powered insights for optimal deployment.
            </p>
          </div>
          <StatusBadge status="live" label="REAL-TIME" />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-gray-400">Loading intelligence data...</div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* WEEKLY SUMMARY */}
          <WeeklySummary summary={weeklySummary} loading={loading} />

          {/* SECTION 1: Workforce Heatmap (Demand vs Supply) */}
          <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold text-white">Workforce Heatmap</h2>
            </div>
            <WorkforceHeatmap data={heatmapData} />
          </div>

          {/* Demand & Supply Indexes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold text-white">Role Demand Index</h2>
              </div>
              <RoleDemandIndex data={demandIndex} />
            </div>

            <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold text-white">Supply Availability Index</h2>
              </div>
              <SupplyAvailabilityIndex data={supplyIndex} />
            </div>
          </div>

          {/* SECTION 2: AI Opportunity Scanner */}
          <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold text-white">AI City/Region Scanner</h2>
              <span className="text-xs text-gray-400 ml-2">Auto Opportunity Finder</span>
            </div>
            <AIOpportunityScanner opportunities={opportunities} />
          </div>

          {/* SECTION 3: AI Deployment Recommendations */}
          <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold text-white">Where Should We Deploy Next?</h2>
              <span className="text-xs text-gray-400 ml-2">AI-Powered Recommendations</span>
            </div>
            <AIDeploymentRecommendations recommendations={deploymentRecs} />
          </div>

          {/* SECTION 4: Revenue & Performance Metrics */}
          <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold text-white">Revenue & Performance Metrics</h2>
            </div>
            <RevenueMetrics data={revenueMetrics} />
          </div>

          {/* SECTION 5: Alerts & Notifications */}
          <AlertsPanel alerts={alerts} loading={loading} />
        </div>
      )}
    </div>
  )
}

