import { LeadDetails, LeadSummary } from '@/lib/types/leads'

const LEADS: LeadDetails[] = [
  {
    id: 'LD-001',
    type: 'patient',
    origin: 'assessment',
    status: 'in_review',
    priority: 'high',
    createdAt: '2024-05-01T10:00:00Z',
    contact: {
      fullName: 'John Carter',
      email: 'john.carter@example.com',
      phone: '+1 (415) 555-1234',
    },
    serviceLine: 'TRT',
    region: 'TX',
    attribution: {
      channel: 'Meta',
      campaign: 'TRT Prospecting Q2',
      adGroup: 'Men 35-54',
      geo: 'Texas',
      sourceUrl: 'https://novalyte.ai/trt/landing',
    },
    assessment: {
      assessmentId: 'ASMT-889',
      status: 'in_progress',
      lastUpdated: '2024-05-08T14:20:00Z',
      primaryGoals: ['Increase energy', 'Improve sleep'],
      keyFlags: ['Low T symptoms', 'Sleep issues'],
    },
    aiInsight: {
      summary: 'Strong TRT fit. Mentions chronic fatigue and low energy. Interested in quick scheduling.',
      riskLevel: 'medium',
      qualificationScore: 86,
      recommendedNextStep: 'Route to TRT clinic in TX with capacity.',
    },
    activity: [
      {
        id: 'evt-1',
        timestamp: '2024-05-08T14:25:00Z',
        type: 'status_change',
        actor: 'System',
        label: 'Status changed from New → In Review',
      },
      {
        id: 'evt-2',
        timestamp: '2024-05-08T14:10:00Z',
        type: 'message',
        actor: 'Patient',
        label: 'Patient replied via chat',
        details: 'Asked about TRT pricing and timeline.',
      },
      {
        id: 'evt-3',
        timestamp: '2024-05-08T13:55:00Z',
        type: 'assessment_update',
        actor: 'System',
        label: 'Assessment started',
        details: 'Patient started TRT assessment.',
      },
    ],
    internalNotes: 'High intent; prefers evening calls. Mentioned shift work.',
  },
  {
    id: 'LD-002',
    type: 'mens_clinic',
    origin: 'contact_form',
    status: 'contacted',
    priority: 'medium',
    createdAt: '2024-04-28T09:30:00Z',
    contact: {
      fullName: 'North Austin Men’s Clinic',
      email: 'admin@namsclinic.com',
      phone: '+1 (737) 555-4421',
      clinicName: 'North Austin Men’s Clinic',
    },
    serviceLine: 'TRT',
    region: 'TX',
    attribution: {
      channel: 'Google',
      campaign: 'Clinic Partnerships',
      adGroup: 'Texas Clinics',
      geo: 'Austin, TX',
      sourceUrl: 'https://novalyte.ai/partners',
    },
    assessment: null,
    aiInsight: {
      summary: 'Clinic is exploring partnership; moderate fit pending capacity check.',
      riskLevel: 'low',
      qualificationScore: 65,
      recommendedNextStep: 'Schedule intro call and share integration checklist.',
    },
    activity: [
      {
        id: 'evt-4',
        timestamp: '2024-04-29T11:05:00Z',
        type: 'note',
        actor: 'Alex (BD)',
        label: 'Note added',
        details: 'Clinic wants to pilot in June; prefers bi-weekly reporting.',
      },
    ],
    internalNotes: 'Send partner deck + API docs.',
  },
  {
    id: 'LD-003',
    type: 'vendor',
    origin: 'marketplace',
    status: 'new',
    priority: 'low',
    createdAt: '2024-05-05T15:10:00Z',
    contact: {
      fullName: 'VitalSupp Labs',
      email: 'sales@vitalsupp.com',
      phone: '+1 (917) 555-7788',
      clinicName: 'VitalSupp Labs',
    },
    serviceLine: 'IV_THERAPY',
    region: 'CA',
    attribution: {
      channel: 'Manual',
      campaign: 'Inbound vendor',
      adGroup: '',
      geo: 'Los Angeles, CA',
      sourceUrl: '',
    },
    assessment: null,
    aiInsight: null,
    activity: [
      {
        id: 'evt-5',
        timestamp: '2024-05-05T15:20:00Z',
        type: 'status_change',
        actor: 'System',
        label: 'Status changed from New → New',
      },
    ],
    internalNotes: 'Low priority until marketplace category review.',
  },
]

export function listLeads(filters: {
  status?: string
  origin?: string
  priority?: string
  type?: string
  q?: string
  page?: number
  pageSize?: number
}): { items: LeadSummary[]; total: number; page: number; pageSize: number } {
  const page = filters.page ?? 1
  const pageSize = filters.pageSize ?? 50
  let results = [...LEADS]

  if (filters.status) results = results.filter((l) => l.status === filters.status)
  if (filters.origin) results = results.filter((l) => l.origin === filters.origin)
  if (filters.priority) results = results.filter((l) => l.priority === filters.priority)
  if (filters.type) results = results.filter((l) => l.type === filters.type)
  if (filters.q) {
    const term = filters.q.toLowerCase()
    results = results.filter(
      (l) =>
        l.id.toLowerCase().includes(term) ||
        l.contact.fullName?.toLowerCase().includes(term) ||
        l.contact.email?.toLowerCase().includes(term)
    )
  }

  const start = (page - 1) * pageSize
  const items = results.slice(start, start + pageSize).map((lead) => ({
    id: lead.id,
    type: lead.type,
    origin: lead.origin,
    status: lead.status,
    priority: lead.priority,
    createdAt: lead.createdAt,
  }))

  return { items, total: results.length, page, pageSize }
}

export function getLeadById(id: string): LeadDetails | null {
  return LEADS.find((l) => l.id === id) || null
}

