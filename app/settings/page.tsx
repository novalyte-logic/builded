'use client'

import { useState, useEffect } from 'react'
import {
  Users,
  Building2,
  Key,
  DollarSign,
  FileText,
  Mail,
  UserPlus,
  Eye,
  EyeOff,
  Copy,
  CheckCircle,
  ExternalLink,
  AlertTriangle,
} from 'lucide-react'
import StatusBadge from '@/components/StatusBadge'
import ConfirmationModal from '@/components/superadmin-settings/ConfirmationModal'
import IntegrationDetailPanel from '@/components/superadmin-settings/IntegrationDetailPanel'

type TabType = 'admins' | 'onboarding' | 'api' | 'billing' | 'legal'

interface AdminUser {
  id: string
  name: string
  email: string
  status: 'Active' | 'Suspended'
  lastLogin: Date | null
}

interface Integration {
  id: string
  name: string
  status: 'Connected' | 'Warning' | 'Disconnected'
  config: Record<string, any>
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('admins')
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [confirmAction, setConfirmAction] = useState<{
    type: string
    userId?: string
    title: string
    message: string
  } | null>(null)
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null)
  const [revealedKeys, setRevealedKeys] = useState<Set<string>>(new Set())
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  // Admin Users
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([
    {
      id: '1',
      name: 'Superadmin',
      email: 'superadmin@novalyte.io',
      status: 'Active',
      lastLogin: new Date(),
    },
    {
      id: '2',
      name: 'Operations Lead',
      email: 'ops@novalyte.io',
      status: 'Active',
      lastLogin: new Date(Date.now() - 2 * 3600000),
    },
    {
      id: '3',
      name: 'Technical Admin',
      email: 'tech@novalyte.io',
      status: 'Suspended',
      lastLogin: new Date(Date.now() - 30 * 24 * 3600000),
    },
  ])

  // Integrations
  const [integrations] = useState<Integration[]>([
    {
      id: 'bigquery',
      name: 'BigQuery',
      status: 'Connected',
      config: {
        projectId: 'novalyte-analytics-project',
        datasetId: 'novalyte_core',
        region: 'us-west1',
        serviceAccountKey: '***masked***',
      },
    },
    {
      id: 'vertex',
      name: 'Vertex AI / Gemini',
      status: 'Connected',
      config: {
        projectId: 'novalyte-ai-project',
        model: 'gemini-pro',
        region: 'us-central1',
        apiKey: '***masked***',
      },
    },
    {
      id: 'stripe',
      name: 'Stripe',
      status: 'Connected',
      config: {
        publishableKey: 'pk_live_***masked***',
        secretKey: 'sk_live_***masked***',
        webhookSecret: 'whsec_***masked***',
      },
    },
    {
      id: 'drchrono',
      name: 'DrChrono EMR',
      status: 'Warning',
      config: {
        clientId: '***masked***',
        clientSecret: '***masked***',
        lastSync: '2024-01-15T10:30:00Z',
      },
    },
    {
      id: 'athena',
      name: 'Athenahealth EMR',
      status: 'Disconnected',
      config: {
        apiKey: 'Not configured',
        endpoint: 'https://api.athenahealth.com',
      },
    },
  ])

  // Onboarding Settings
  const [onboardingSettings, setOnboardingSettings] = useState({
    clinic: {
      minARR: 50000,
      minProviders: 2,
      autoApprove: false,
      requireManualReview: true,
    },
    vendor: {
      requireDocuments: true,
      requireCOA: true,
      requireLicenses: true,
      requireManualVetting: true,
    },
  })

  const handleSuspendUser = (userId: string, name: string) => {
    const user = adminUsers.find((u) => u.id === userId)
    setConfirmAction({
      type: 'suspend',
      userId,
      title: 'Suspend Admin User',
      message: `Are you sure you want to suspend ${name}? They will lose access to the admin dashboard.`,
    })
    setShowConfirmModal(true)
  }

  const handleReactivateUser = (userId: string, name: string) => {
    setConfirmAction({
      type: 'reactivate',
      userId,
      title: 'Reactivate Admin User',
      message: `Are you sure you want to reactivate ${name}? They will regain access to the admin dashboard.`,
    })
    setShowConfirmModal(true)
  }

  const handleConfirmAction = () => {
    if (!confirmAction) return

    if (confirmAction.type === 'suspend' && confirmAction.userId) {
      setAdminUsers((prev) =>
        prev.map((u) =>
          u.id === confirmAction.userId ? { ...u, status: 'Suspended' as const } : u
        )
      )
    } else if (confirmAction.type === 'reactivate' && confirmAction.userId) {
      setAdminUsers((prev) =>
        prev.map((u) =>
          u.id === confirmAction.userId ? { ...u, status: 'Active' as const } : u
        )
      )
    }

    setShowConfirmModal(false)
    setConfirmAction(null)
  }

  const handleInviteAdmin = async () => {
    if (!inviteEmail || !inviteEmail.includes('@')) {
      alert('Please enter a valid email address')
      return
    }

    // TODO: Implement API call to invite admin
    console.log('Invite admin:', inviteEmail)

    // Mock: Add to list
    setAdminUsers((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        name: inviteEmail.split('@')[0],
        email: inviteEmail,
        status: 'Active' as const,
        lastLogin: null,
      },
    ])

    setShowInviteModal(false)
    setInviteEmail('')
  }

  const toggleKeyVisibility = (keyId: string) => {
    setRevealedKeys((prev) => {
      const next = new Set(prev)
      if (next.has(keyId)) {
        next.delete(keyId)
      } else {
        next.add(keyId)
      }
      return next
    })
  }

  const copyToClipboard = async (text: string, keyId: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedKey(keyId)
      setTimeout(() => setCopiedKey(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const tabs: Array<{ id: TabType; label: string; icon: any }> = [
    { id: 'admins', label: 'Admin Users', icon: Users },
    { id: 'onboarding', label: 'Clinic & Vendor Onboarding', icon: Building2 },
    { id: 'api', label: 'API & Integrations', icon: Key },
    { id: 'billing', label: 'Billing & Plans', icon: DollarSign },
    { id: 'legal', label: 'Legal / Policies', icon: FileText },
  ]

  return (
    <div className="p-8 bg-dark-bg min-h-screen">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Superadmin Settings — Root Configuration
            </h1>
            <p className="text-gray-400 mt-1">
              Root control room. Configure admin users, API keys, billing, and system metadata.
            </p>
          </div>
          <StatusBadge status="live" />
        </div>
      </div>

      {/* Main Card with Tabs */}
      <div className="bg-dark-surface border border-dark-border rounded-lg">
        {/* Tab Navigation */}
        <div className="border-b border-dark-border">
          <div className="flex space-x-1 p-4">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary/20 text-primary border border-primary/30'
                      : 'text-gray-400 hover:text-white hover:bg-dark-hover'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* TAB 1: Admin Users */}
          {activeTab === 'admins' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Admin Users</h2>
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm"
                >
                  <UserPlus className="w-4 h-4" />
                  Invite New Admin
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-dark-accent border-b border-dark-border">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Last Login
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-border">
                    {adminUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-dark-hover transition-colors">
                        <td className="px-4 py-3 text-sm text-white">{user.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-300">{user.email}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full border ${
                              user.status === 'Active'
                                ? 'bg-status-live/20 text-status-live border-status-live/30'
                                : 'bg-red-500/20 text-red-400 border-red-500/30'
                            }`}
                          >
                            {user.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-400">
                          {user.lastLogin
                            ? user.lastLogin.toLocaleString()
                            : 'Never'}
                        </td>
                        <td className="px-4 py-3 text-right text-sm">
                          {user.status === 'Active' ? (
                            <button
                              onClick={() => handleSuspendUser(user.id, user.name)}
                              className="text-red-400 hover:text-red-300 transition-colors"
                            >
                              Suspend
                            </button>
                          ) : (
                            <button
                              onClick={() => handleReactivateUser(user.id, user.name)}
                              className="text-status-live hover:text-status-live-light transition-colors"
                            >
                              Reactivate
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: Clinic & Vendor Onboarding */}
          {activeTab === 'onboarding' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-white mb-4">
                Clinic & Vendor Onboarding Settings
              </h2>

              {/* Clinic Onboarding */}
              <div className="bg-dark-accent border border-dark-border rounded-lg p-6">
                <h3 className="text-sm font-semibold text-white mb-4">Clinic Onboarding</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-400 mb-2">
                        Minimum ARR ($)
                      </label>
                      <input
                        type="number"
                        value={onboardingSettings.clinic.minARR}
                        onChange={(e) =>
                          setOnboardingSettings({
                            ...onboardingSettings,
                            clinic: {
                              ...onboardingSettings.clinic,
                              minARR: parseInt(e.target.value) || 0,
                            },
                          })
                        }
                        className="w-full bg-dark-surface border border-dark-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-2">
                        Minimum Providers
                      </label>
                      <input
                        type="number"
                        value={onboardingSettings.clinic.minProviders}
                        onChange={(e) =>
                          setOnboardingSettings({
                            ...onboardingSettings,
                            clinic: {
                              ...onboardingSettings.clinic,
                              minProviders: parseInt(e.target.value) || 0,
                            },
                          })
                        }
                        className="w-full bg-dark-surface border border-dark-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">Auto-approve clinics meeting thresholds</p>
                      <p className="text-xs text-gray-400">Automatically approve clinics that meet all criteria</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={onboardingSettings.clinic.autoApprove}
                        onChange={(e) =>
                          setOnboardingSettings({
                            ...onboardingSettings,
                            clinic: {
                              ...onboardingSettings.clinic,
                              autoApprove: e.target.checked,
                            },
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-dark-surface peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">Require manual review</p>
                      <p className="text-xs text-gray-400">All clinics require superadmin review before approval</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={onboardingSettings.clinic.requireManualReview}
                        onChange={(e) =>
                          setOnboardingSettings({
                            ...onboardingSettings,
                            clinic: {
                              ...onboardingSettings.clinic,
                              requireManualReview: e.target.checked,
                            },
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-dark-surface peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Vendor Onboarding */}
              <div className="bg-dark-accent border border-dark-border rounded-lg p-6">
                <h3 className="text-sm font-semibold text-white mb-4">Vendor Onboarding</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">Require documents (COA, licenses)</p>
                      <p className="text-xs text-gray-400">Vendors must upload required documentation</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={onboardingSettings.vendor.requireDocuments}
                        onChange={(e) =>
                          setOnboardingSettings({
                            ...onboardingSettings,
                            vendor: {
                              ...onboardingSettings.vendor,
                              requireDocuments: e.target.checked,
                            },
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-dark-surface peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">Require COA (Certificate of Analysis)</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={onboardingSettings.vendor.requireCOA}
                        onChange={(e) =>
                          setOnboardingSettings({
                            ...onboardingSettings,
                            vendor: {
                              ...onboardingSettings.vendor,
                              requireCOA: e.target.checked,
                            },
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-dark-surface peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">Require licenses</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={onboardingSettings.vendor.requireLicenses}
                        onChange={(e) =>
                          setOnboardingSettings({
                            ...onboardingSettings,
                            vendor: {
                              ...onboardingSettings.vendor,
                              requireLicenses: e.target.checked,
                            },
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-dark-surface peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">Require manual vetting</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={onboardingSettings.vendor.requireManualVetting}
                        onChange={(e) =>
                          setOnboardingSettings({
                            ...onboardingSettings,
                            vendor: {
                              ...onboardingSettings.vendor,
                              requireManualVetting: e.target.checked,
                            },
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-dark-surface peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: API & Integrations */}
          {activeTab === 'api' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-white mb-4">API & Integrations</h2>

              {/* Internal API Keys */}
              <div className="bg-dark-accent border border-dark-border rounded-lg p-6 mb-6">
                <h3 className="text-sm font-semibold text-white mb-4">Internal API Keys</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-dark-surface border border-dark-border rounded-lg">
                    <div className="flex-1">
                      <p className="text-xs text-gray-400 mb-1">Admin API Key</p>
                      <code className="text-sm text-gray-300 font-mono">
                        {revealedKeys.has('admin-key')
                          ? 'ak_live_1234567890abcdef1234567890abcdef'
                          : 'ak_live_••••••••••••••••••••••••••••••••'}
                      </code>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleKeyVisibility('admin-key')}
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        {revealedKeys.has('admin-key') ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => copyToClipboard('ak_live_1234567890abcdef1234567890abcdef', 'admin-key')}
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        {copiedKey === 'admin-key' ? (
                          <CheckCircle className="w-4 h-4 text-status-live" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                      <button className="text-gray-400 hover:text-white transition-colors text-xs">
                        Rotate
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Integrations */}
              <div className="space-y-3">
                {integrations.map((integration) => {
                  const getStatusColor = (status: string) => {
                    switch (status) {
                      case 'Connected':
                        return 'bg-status-live/20 text-status-live border-status-live/30'
                      case 'Warning':
                        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                      case 'Disconnected':
                        return 'bg-red-500/20 text-red-400 border-red-500/30'
                      default:
                        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                    }
                  }

                  return (
                    <div
                      key={integration.id}
                      className="flex items-center justify-between p-4 bg-dark-accent border border-dark-border rounded-lg hover:border-primary/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(
                            integration.status
                          )}`}
                        >
                          {integration.status}
                        </span>
                        <div>
                          <h3 className="text-sm font-semibold text-white">{integration.name}</h3>
                          <p className="text-xs text-gray-400">
                            {integration.status === 'Connected'
                              ? 'Configuration valid'
                              : integration.status === 'Warning'
                              ? 'Connection issues detected'
                              : 'Not configured'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedIntegration(integration)}
                        className="px-4 py-2 bg-dark-surface border border-dark-border rounded-lg text-gray-300 hover:text-white hover:bg-dark-hover transition-colors text-sm"
                      >
                        View Integration Details
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* TAB 4: Billing & Plans */}
          {activeTab === 'billing' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-white mb-4">Billing & Plans</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-dark-accent border border-dark-border rounded-lg p-4">
                  <p className="text-xs text-gray-400 mb-1">Active Paying Clinics</p>
                  <p className="text-2xl font-bold text-white">47</p>
                </div>
                <div className="bg-dark-accent border border-dark-border rounded-lg p-4">
                  <p className="text-xs text-gray-400 mb-1">Trials</p>
                  <p className="text-2xl font-bold text-white">12</p>
                </div>
                <div className="bg-dark-accent border border-dark-border rounded-lg p-4">
                  <p className="text-xs text-gray-400 mb-1">Monthly Recurring Revenue</p>
                  <p className="text-2xl font-bold text-white">$124,700</p>
                </div>
              </div>

              <div className="bg-dark-accent border border-dark-border rounded-lg p-6">
                <h3 className="text-sm font-semibold text-white mb-4">Current Pricing Tiers</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-dark-surface border border-dark-border rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-white">Starter</p>
                      <p className="text-xs text-gray-400">$299/month</p>
                    </div>
                    <span className="text-xs text-gray-400">12 clinics</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-dark-surface border border-dark-border rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-white">Professional</p>
                      <p className="text-xs text-gray-400">$799/month</p>
                    </div>
                    <span className="text-xs text-gray-400">28 clinics</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-dark-surface border border-dark-border rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-white">Enterprise</p>
                      <p className="text-xs text-gray-400">Custom pricing</p>
                    </div>
                    <span className="text-xs text-gray-400">7 clinics</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-dark-accent border border-dark-border rounded-lg text-gray-300 hover:text-white hover:bg-dark-hover transition-colors text-sm">
                  <FileText className="w-4 h-4" />
                  Export Billing Summary
                </button>
                <button
                  onClick={() => window.open('https://dashboard.stripe.com', '_blank')}
                  className="flex items-center gap-2 px-4 py-2 bg-dark-accent border border-dark-border rounded-lg text-gray-300 hover:text-white hover:bg-dark-hover transition-colors text-sm"
                >
                  <ExternalLink className="w-4 h-4" />
                  View in Stripe
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: Legal / Policies */}
          {activeTab === 'legal' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-white mb-4">Legal / Policies References</h2>

              <div className="space-y-3">
                {[
                  {
                    title: 'Privacy Policy',
                    url: 'https://novalyte.io/privacy',
                    description: 'How we collect, use, and protect user data',
                  },
                  {
                    title: 'Terms of Service',
                    url: 'https://novalyte.io/terms',
                    description: 'User agreement and platform terms',
                  },
                  {
                    title: 'Security Overview',
                    url: 'https://novalyte.io/security',
                    description: 'Security practices and compliance information',
                  },
                ].map((policy, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 bg-dark-accent border border-dark-border rounded-lg"
                  >
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-white mb-1">{policy.title}</h3>
                      <p className="text-xs text-gray-400">{policy.description}</p>
                      <code className="text-xs text-gray-500 font-mono mt-1 block">
                        {policy.url}
                      </code>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyToClipboard(policy.url, `policy-${idx}`)}
                        className="flex items-center gap-1 px-3 py-2 bg-dark-surface border border-dark-border rounded-lg text-gray-300 hover:text-white hover:bg-dark-hover transition-colors text-sm"
                      >
                        {copiedKey === `policy-${idx}` ? (
                          <>
                            <CheckCircle className="w-4 h-4 text-status-live" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            Copy URL
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => window.open(policy.url, '_blank')}
                        className="flex items-center gap-1 px-3 py-2 bg-dark-surface border border-dark-border rounded-lg text-gray-300 hover:text-white hover:bg-dark-hover transition-colors text-sm"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Open Public Page
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Invite Admin Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-dark-surface border border-dark-border rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">Invite New Admin</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Email Address</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full bg-dark-accent border border-dark-border rounded-lg px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                />
              </div>
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => {
                    setShowInviteModal(false)
                    setInviteEmail('')
                  }}
                  className="px-4 py-2 bg-dark-accent border border-dark-border rounded-lg text-gray-300 hover:text-white hover:bg-dark-hover transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleInviteAdmin}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm"
                >
                  Send Invite
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && confirmAction && (
        <ConfirmationModal
          isOpen={showConfirmModal}
          onClose={() => {
            setShowConfirmModal(false)
            setConfirmAction(null)
          }}
          onConfirm={handleConfirmAction}
          title={confirmAction.title}
          message={confirmAction.message}
          variant={confirmAction.type === 'suspend' ? 'danger' : 'default'}
          confirmText={confirmAction.type === 'suspend' ? 'Suspend User' : 'Reactivate User'}
        />
      )}

      {/* Integration Detail Panel */}
      {selectedIntegration && (
        <IntegrationDetailPanel
          integration={selectedIntegration}
          onClose={() => setSelectedIntegration(null)}
        />
      )}
    </div>
  )
}
