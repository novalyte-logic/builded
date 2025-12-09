'use client'

import clsx from 'clsx'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import StatusBadge from '@/components/StatusBadge'
import { Users, Search, ArrowRight, Target } from 'lucide-react'
import Explainer from '@/components/Explainer'
import LeadDetailPanel from '@/components/leads/LeadDetailPanel'
import { LeadDetails, LeadSummary } from '@/app/api/admin/leads/data'

export default function LeadsPage() {
  const [leads, setLeads] = useState<LeadSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    status: '',
    origin: '',
    priority: '',
    lead_type: '',
    search: '',
  })
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null)
  const [selectedLead, setSelectedLead] = useState<LeadDetails | null>(null)
  const [loadingLeadDetails, setLoadingLeadDetails] = useState(false)
  const [leadError, setLeadError] = useState<string | null>(null)

  useEffect(() => {
    fetchLeads()
  }, [filters])

  const fetchLeads = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filters.status) params.set('status', filters.status)
      if (filters.origin) params.set('origin', filters.origin)
      if (filters.priority) params.set('priority', filters.priority)
      if (filters.lead_type) params.set('type', filters.lead_type)
      if (filters.search) params.set('q', filters.search)

      const response = await fetch(`/api/admin/leads?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to fetch leads')

      const data = await response.json()
      const items: LeadSummary[] = data.items || []
      setLeads(items)
      if (!selectedLeadId && items.length > 0) {
        selectLead(items[0].id)
      }
    } catch (error) {
      console.error('Error fetching leads:', error)
    } finally {
      setLoading(false)
    }
  }

  const selectLead = (leadId: string) => {
    setSelectedLeadId(leadId)
    fetchLeadDetails(leadId)
  }

  const fetchLeadDetails = async (id: string) => {
    try {
      setLoadingLeadDetails(true)
      setLeadError(null)
      const res = await fetch(`/api/admin/leads/${id}`)
      if (!res.ok) throw new Error('Failed to fetch lead details')
      const data = await res.json()
      setSelectedLead(data.lead as LeadDetails)
    } catch (err) {
      setLeadError((err as Error).message || 'Failed to load lead')
      setSelectedLead(null)
    } finally {
      setLoadingLeadDetails(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-status-live/20 text-status-live border-status-live/30'
      case 'contacted':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'converted':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'closed':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const layoutClass = useMemo(
    () => 'grid grid-cols-1 xl:grid-cols-[60%_40%] gap-6',
    []
  )

  return (
    <div className="p-8 bg-dark-bg min-h-screen">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-white">Leads</h1>
            <p className="text-gray-400">All leads with full context (assessments, messages, AI insights)</p>
          </div>
          <StatusBadge status="live" />
        </div>
      </div>

      {/* Cross-talk Banner */}
      <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Target className="w-5 h-5 text-primary" />
            <p className="text-sm text-gray-300">
              View related clinic opportunity in Dealflow Console
            </p>
          </div>
          <Link
            href="/admin/dealflow"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm"
          >
            Go to Dealflow Console
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-dark-surface border border-dark-border rounded-lg p-4 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Explainer
            title="Search Leads"
            what="Search leads by ID or tags to quickly find specific leads."
            why="Efficiently locate leads when managing many records."
            how={['Type lead ID or tag name', 'Search filters results instantly', 'Combine with other filters']}
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full bg-dark-accent border border-dark-border rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary"
              />
            </div>
          </Explainer>

          <Explainer
            title="Status Filter"
            what="Filter leads by workflow status (new, contacted, converted, closed)."
            why="Focus on leads at specific stages of the sales funnel."
            how={['Select status to filter results', 'Use "new" to see fresh leads', 'Use "converted" to track success']}
          >
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="bg-dark-accent border border-dark-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
            >
              <option value="">All Status</option>
              <option value="new">New</option>
              <option value="in_review">In Review</option>
              <option value="contacted">Contacted</option>
              <option value="converted">Converted</option>
              <option value="closed">Closed</option>
            </select>
          </Explainer>

          <Explainer
            title="Lead Type Filter"
            what="Filter by lead type (patient, mens_clinic, vendor)."
            why="Separate customer leads from partnership opportunities."
            how={['Select lead type to narrow results', 'Useful for different workflows', 'Combine with other filters']}
          >
            <select
              value={filters.lead_type}
              onChange={(e) => setFilters({ ...filters, lead_type: e.target.value })}
              className="bg-dark-accent border border-dark-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
            >
              <option value="">All Types</option>
              <option value="patient">Patient</option>
              <option value="mens_clinic">Men's Clinic</option>
              <option value="vendor">Vendor</option>
            </select>
          </Explainer>

          <Explainer
            title="Priority Filter"
            what="Filter by lead priority (high, medium, low)."
            why="Focus on high-value leads that need immediate attention."
            how={['Select priority to see matching leads', 'High priority typically means high LTV', 'Prioritize follow-up actions']}
          >
            <select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              className="bg-dark-accent border border-dark-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
            >
              <option value="">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </Explainer>

          <Explainer
            title="Origin Filter"
            what="Filter by lead origin (assessment, contact_form, marketplace, etc.)."
            why="Understand which channels generate the most leads."
            how={['Select origin to filter results', 'Track source effectiveness', 'Compare channel quality']}
          >
            <select
              value={filters.origin}
              onChange={(e) => setFilters({ ...filters, origin: e.target.value })}
              className="bg-dark-accent border border-dark-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
            >
              <option value="">All Origins</option>
              <option value="assessment">Assessment</option>
              <option value="contact_form">Contact Form</option>
              <option value="marketplace">Marketplace</option>
              <option value="chat">Chat</option>
              <option value="manual">Manual</option>
            </select>
          </Explainer>
        </div>
      </div>

      <div className={layoutClass}>
        <div className="bg-dark-surface border border-dark-border rounded-lg">
          <div className="p-6 border-b border-dark-border">
            <h2 className="text-lg font-semibold text-white">All Leads</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-accent border-b border-dark-border">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Lead ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Origin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                      Loading leads...
                    </td>
                  </tr>
                ) : leads.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                      No leads found
                    </td>
                  </tr>
                ) : (
                  leads.map((lead) => {
                    const isActive = selectedLeadId === lead.id
                    return (
                      <tr
                        key={lead.id}
                        className={clsx(
                          'hover:bg-dark-hover transition-colors cursor-pointer',
                          isActive && 'bg-primary/10 border-l-2 border-primary'
                        )}
                        onClick={() => selectLead(lead.id)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-mono text-gray-300">{lead.id}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-white capitalize">{lead.type}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-300 capitalize">{lead.origin.replace('_', ' ')}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(lead.status)}`}>
                            {lead.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(lead.priority)}`}>
                            {lead.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {new Date(lead.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              selectLead(lead.id)
                            }}
                            className="text-primary hover:text-primary-light transition-colors text-sm"
                          >
                            View Context
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <LeadDetailPanel lead={selectedLead} loading={loadingLeadDetails} error={leadError} />
      </div>
    </div>
  )
}

