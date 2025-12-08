'use client'

import { useState, useEffect } from 'react'
import { Save, AlertTriangle } from 'lucide-react'
import StatusBadge from '@/components/StatusBadge'
import FeatureToggle from '@/components/control-panel/FeatureToggle'
import NumericSetting from '@/components/control-panel/NumericSetting'
import Toast from '@/components/control-panel/Toast'

interface ControlPanelSettings {
  platform: {
    marketplaceCategoriesEnabled: boolean
    patientAITriageEnabled: boolean
    maintenanceMode: {
      patientApp: boolean
      marketplace: boolean
      clinicsDirectory: boolean
    }
  }
  revenue: {
    minPreQualificationIncome: number
    minReadinessScore: number
    deadLeadDays: number
    noShowThresholdPercent: number
  }
  notifications: {
    criticalErrors: boolean
    majorRevenueChanges: boolean
    weeklySummary: boolean
    alertEmails: string
  }
}

interface AuditInfo {
  by: string
  at: Date
}

export default function ControlPanelPage() {
  const [settings, setSettings] = useState<ControlPanelSettings>({
    platform: {
      marketplaceCategoriesEnabled: true,
      patientAITriageEnabled: true,
      maintenanceMode: {
        patientApp: false,
        marketplace: false,
        clinicsDirectory: false,
      },
    },
    revenue: {
      minPreQualificationIncome: 50000,
      minReadinessScore: 60,
      deadLeadDays: 30,
      noShowThresholdPercent: 20,
    },
    notifications: {
      criticalErrors: true,
      majorRevenueChanges: true,
      weeklySummary: true,
      alertEmails: 'superadmin@novalyte.io',
    },
  })

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [lastAudit, setLastAudit] = useState<Record<string, AuditInfo>>({})

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/admin/control-panel/settings')
      // const data = await response.json()
      // setSettings(data.settings)
      // setLastAudit(data.auditInfo)
    } catch (error) {
      console.error('Error fetching settings:', error)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/admin/control-panel/settings', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(settings),
      // })
      // const data = await response.json()

      // Mock save
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update audit info
      const newAudit: AuditInfo = {
        by: 'superadmin@novalyte.io',
        at: new Date(),
      }
      Object.keys(settings).forEach((key) => {
        setLastAudit((prev) => ({ ...prev, [key]: newAudit }))
      })

      setHasUnsavedChanges(false)
      setShowToast(true)
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Failed to save settings. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const updateSetting = (path: string[], value: any) => {
    setSettings((prev) => {
      const newSettings = { ...prev }
      let current: any = newSettings

      for (let i = 0; i < path.length - 1; i++) {
        current[path[i]] = { ...current[path[i]] }
        current = current[path[i]]
      }

      current[path[path.length - 1]] = value

      setHasUnsavedChanges(true)
      return newSettings
    })
  }

  return (
    <div className="p-8 bg-dark-bg min-h-screen">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Control Panel — Global System Levers
            </h1>
            <p className="text-gray-400 mt-1">
              Physical dashboard of knobs for Novalyte. Change how the machine behaves without touching code.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status="live" />
            {hasUnsavedChanges && (
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            )}
          </div>
        </div>

        {hasUnsavedChanges && (
          <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-400">You have unsaved changes</p>
              <p className="text-xs text-gray-400 mt-1">
                Click &quot;Save Changes&quot; to apply your modifications.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Card Grid Layout */}
      <div className="space-y-6">
        {/* GROUP 1: Platform Behavior */}
        <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Platform Behavior</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FeatureToggle
              id="marketplace-categories"
              label="Enable New Marketplace Categories"
              description="Allow creation and display of new product categories in the marketplace."
              enabled={settings.platform.marketplaceCategoriesEnabled}
              onChange={(enabled) =>
                updateSetting(['platform', 'marketplaceCategoriesEnabled'], enabled)
              }
              tooltip={{
                title: 'Marketplace Categories',
                what: 'Controls whether new product categories can be created and displayed in the marketplace.',
                why: 'Disabling prevents new categories from appearing. Useful for controlling marketplace expansion.',
                how: [
                  'When enabled: New categories can be created by admins',
                  'When disabled: Only existing categories are visible',
                  'Changes apply immediately to marketplace UI',
                ],
              }}
              lastChanged={lastAudit['marketplace-categories']}
            />

            <FeatureToggle
              id="patient-ai-triage"
              label="Enable Patient AI Triage Engine"
              description="Use AI-powered triage to route patients to appropriate clinics and protocols."
              enabled={settings.platform.patientAITriageEnabled}
              onChange={(enabled) =>
                updateSetting(['platform', 'patientAITriageEnabled'], enabled)
              }
              tooltip={{
                title: 'Patient AI Triage Engine',
                what: 'AI system that analyzes patient assessments and routes them to the best-matched clinics and treatment protocols.',
                why: 'Disabling will use simple rule-based routing instead. Useful for debugging or emergency fallback.',
                how: [
                  'When enabled: AI analyzes patient data and makes routing decisions',
                  'When disabled: Simple rule-based routing is used',
                  'Impact: May affect match quality and patient satisfaction',
                ],
              }}
              lastChanged={lastAudit['patient-ai-triage']}
            />

            <FeatureToggle
              id="maintenance-patient-app"
              label="Maintenance Mode: Patient App"
              description="Put the patient-facing app into maintenance mode (shows maintenance message)."
              enabled={settings.platform.maintenanceMode.patientApp}
              onChange={(enabled) =>
                updateSetting(['platform', 'maintenanceMode', 'patientApp'], enabled)
              }
              tooltip={{
                title: 'Patient App Maintenance Mode',
                what: 'Places the patient-facing application into maintenance mode, showing a maintenance message to all users.',
                why: 'Use during deployments, database migrations, or critical updates to prevent user disruption.',
                how: [
                  'When enabled: All users see maintenance message',
                  'When disabled: Normal operation resumes',
                  'Use sparingly - impacts user experience',
                ],
              }}
              lastChanged={lastAudit['maintenance-patient-app']}
            />

            <FeatureToggle
              id="maintenance-marketplace"
              label="Maintenance Mode: Marketplace"
              description="Put the marketplace into maintenance mode (disables product browsing and purchases)."
              enabled={settings.platform.maintenanceMode.marketplace}
              onChange={(enabled) =>
                updateSetting(['platform', 'maintenanceMode', 'marketplace'], enabled)
              }
              tooltip={{
                title: 'Marketplace Maintenance Mode',
                what: 'Disables the marketplace for all users, preventing product browsing and purchases.',
                why: 'Use when updating product catalog, payment systems, or vendor integrations.',
                how: [
                  'When enabled: Marketplace is inaccessible',
                  'When disabled: Normal marketplace operation',
                  'Affects revenue - use during low-traffic periods',
                ],
              }}
              lastChanged={lastAudit['maintenance-marketplace']}
            />

            <FeatureToggle
              id="maintenance-clinics"
              label="Maintenance Mode: Clinics Directory"
              description="Put the clinics directory into maintenance mode (hides clinic listings)."
              enabled={settings.platform.maintenanceMode.clinicsDirectory}
              onChange={(enabled) =>
                updateSetting(['platform', 'maintenanceMode', 'clinicsDirectory'], enabled)
              }
              tooltip={{
                title: 'Clinics Directory Maintenance Mode',
                what: 'Hides the clinics directory, preventing patients from browsing or searching for clinics.',
                why: 'Use when updating clinic data, verification status, or directory features.',
                how: [
                  'When enabled: Clinic directory is hidden',
                  'When disabled: Normal directory operation',
                  'May impact new patient bookings',
                ],
              }}
              lastChanged={lastAudit['maintenance-clinics']}
            />
          </div>
        </div>

        {/* GROUP 2: Revenue & Qualification Settings */}
        <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            Revenue & Qualification Settings
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <NumericSetting
              id="min-income"
              label="Minimum Pre-Qualification Income"
              description="Minimum annual income required for patient pre-qualification ($)."
              value={settings.revenue.minPreQualificationIncome}
              onChange={(value) =>
                updateSetting(['revenue', 'minPreQualificationIncome'], value)
              }
              type="slider"
              min={20000}
              max={200000}
              step={5000}
              unit="$"
              tooltip={{
                title: 'Minimum Income Threshold',
                what: 'The minimum annual income a patient must have to pass pre-qualification checks.',
                why: 'Ensures patients can afford treatment. Lower threshold = more qualified leads, higher threshold = higher-value patients.',
                how: [
                  'Used during patient assessment pre-qualification',
                  'Affects lead volume and quality',
                  'Higher values may reduce total leads but improve conversion',
                ],
              }}
              lastChanged={lastAudit['min-income']}
            />

            <NumericSetting
              id="min-readiness"
              label="Minimum Readiness Score"
              description="Minimum readiness score (0-100) required for patient pre-qualification."
              value={settings.revenue.minReadinessScore}
              onChange={(value) =>
                updateSetting(['revenue', 'minReadinessScore'], value)
              }
              type="slider"
              min={0}
              max={100}
              step={5}
              tooltip={{
                title: 'Minimum Readiness Score',
                what: 'The minimum readiness score (based on assessment responses) required for pre-qualification.',
                why: 'Filters for patients most likely to follow through with treatment. Higher scores = better conversion rates.',
                how: [
                  'Calculated from patient assessment responses',
                  'Lower scores = more leads, potentially lower quality',
                  'Higher scores = fewer but higher-quality leads',
                ],
              }}
              lastChanged={lastAudit['min-readiness']}
            />

            <NumericSetting
              id="dead-lead-days"
              label="Dead Lead Days"
              description="Number of days of inactivity before Reactivation Engine triggers (days)."
              value={settings.revenue.deadLeadDays}
              onChange={(value) => updateSetting(['revenue', 'deadLeadDays'], value)}
              type="input"
              min={1}
              max={365}
              step={1}
              unit="days"
              tooltip={{
                title: 'Dead Lead Days',
                what: 'The number of days a lead must be inactive before the Reactivation Engine automatically triggers outreach.',
                why: 'Balances between giving leads time to respond and ensuring timely re-engagement. Lower days = more aggressive reactivation.',
                how: [
                  'Counts from last patient interaction',
                  'Triggers automated reactivation campaigns',
                  'Lower values = more frequent reactivation attempts',
                ],
              }}
              lastChanged={lastAudit['dead-lead-days']}
            />

            <NumericSetting
              id="no-show-threshold"
              label="No-Show % Threshold"
              description="Clinic no-show rate percentage that triggers review flag (%)."
              value={settings.revenue.noShowThresholdPercent}
              onChange={(value) =>
                updateSetting(['revenue', 'noShowThresholdPercent'], value)
              }
              type="slider"
              min={0}
              max={50}
              step={1}
              unit="%"
              tooltip={{
                title: 'No-Show Threshold',
                what: 'The clinic no-show rate percentage that automatically flags a clinic for review and potential intervention.',
                why: 'Identifies clinics with booking/communication issues. Lower threshold = stricter monitoring, higher threshold = fewer flags.',
                how: [
                  'Calculated: No-shows / Total Bookings',
                  'Clinics above threshold appear in review queue',
                  'Helps identify operational issues early',
                ],
              }}
              lastChanged={lastAudit['no-show-threshold']}
            />
          </div>
        </div>

        {/* GROUP 3: Notifications & Alerts */}
        <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Notifications & Alerts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FeatureToggle
              id="critical-errors"
              label="Email Alerts: Critical System Errors"
              description="Receive email notifications when critical system errors occur."
              enabled={settings.notifications.criticalErrors}
              onChange={(enabled) =>
                updateSetting(['notifications', 'criticalErrors'], enabled)
              }
              tooltip={{
                title: 'Critical Error Alerts',
                what: 'Email notifications sent immediately when critical system errors are detected.',
                why: 'Ensures rapid response to system failures. Disable if you prefer checking logs manually.',
                how: [
                  'Triggers on: System crashes, database failures, payment errors',
                  'Sent immediately to alert email addresses',
                  'Includes error details and stack traces',
                ],
              }}
              lastChanged={lastAudit['critical-errors']}
            />

            <FeatureToggle
              id="revenue-changes"
              label="Email Alerts: Major Revenue Changes"
              description="Receive email notifications when revenue changes exceed 20% threshold."
              enabled={settings.notifications.majorRevenueChanges}
              onChange={(enabled) =>
                updateSetting(['notifications', 'majorRevenueChanges'], enabled)
              }
              tooltip={{
                title: 'Major Revenue Change Alerts',
                what: 'Email notifications when daily/weekly revenue changes exceed ±20% threshold.',
                why: 'Early warning system for revenue issues or opportunities. Helps catch problems before they compound.',
                how: [
                  'Compares current period to previous period',
                  'Threshold: ±20% change triggers alert',
                  'Includes breakdown by revenue source',
                ],
              }}
              lastChanged={lastAudit['revenue-changes']}
            />

            <FeatureToggle
              id="weekly-summary"
              label="Weekly Summary Reports"
              description="Receive weekly summary report emails with key metrics and insights."
              enabled={settings.notifications.weeklySummary}
              onChange={(enabled) =>
                updateSetting(['notifications', 'weeklySummary'], enabled)
              }
              tooltip={{
                title: 'Weekly Summary Reports',
                what: 'Automated weekly email report containing key metrics, trends, and AI-generated insights.',
                why: 'Provides high-level overview without needing to check dashboard daily. Useful for stakeholders.',
                how: [
                  'Sent every Monday at 9 AM',
                  'Includes: Revenue, patients, clinics, marketplace performance',
                  'Contains AI-generated insights and recommendations',
                ],
              }}
              lastChanged={lastAudit['weekly-summary']}
            />

            <div className="p-4 bg-dark-accent border border-dark-border rounded-lg">
              <h3 className="text-sm font-semibold text-white mb-1">Alert Email Addresses</h3>
              <p className="text-xs text-gray-400 mb-3">
                Comma-separated list of email addresses to receive alerts
              </p>
              <input
                type="text"
                value={settings.notifications.alertEmails}
                onChange={(e) =>
                  updateSetting(['notifications', 'alertEmails'], e.target.value)
                }
                placeholder="email1@example.com, email2@example.com"
                className="w-full bg-dark-surface border border-dark-border rounded px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary"
              />
              {lastAudit['alert-emails'] && (
                <p className="text-xs text-gray-500 mt-2">
                  Last changed by {lastAudit['alert-emails'].by} at{' '}
                  {lastAudit['alert-emails'].at.toLocaleString()}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <Toast
          message="Settings saved successfully"
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  )
}

