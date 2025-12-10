import { NextRequest, NextResponse } from 'next/server'
import { LeadRecord, LeadStatus, LeadType, LeadPriority, LeadOrigin } from '@/lib/types/leads'

const MOCK_LEADS: LeadRecord[] = [
  {
    id: 'LD-001',
    type: 'patient',
    origin: 'assessment',
    status: 'new',
    priority: 'high',
    createdAt: '2024-05-15T10:10:00Z',
    name: 'Ethan Parker',
    email: 'ethan.parker@example.com',
    phone: '+1 (512) 555-0101',
    serviceLine: 'TRT',
    region: 'TX',
    channel: 'Meta',
    campaign: 'TRT_Q2_TX',
    adGroup: 'TRT_30-45_male',
    geo: 'Austin, TX',
    sourceUrl: 'https://novalyte.ai/assessment/trt',
    assessmentId: 'ASMT-889',
    assessmentStatus: 'in_progress',
    assessmentUpdatedAt: '2024-05-15T10:05:00Z',
    primaryGoals: ['Energy', 'Libido'],
    keyFlags: ['Asked about pricing', 'High intent'],
    aiRiskLevel: 'medium',
    aiInsightSummary: 'TRT indicators with high intent. Move to consult within 24h.',
    aiQualificationScore: 82,
    activity: [
      { id: 'act-1', timestamp: '2024-05-15T10:08:00Z', kind: 'message', summary: 'Patient asked about TRT pricing', actor: 'Patient' },
      { id: 'act-2', timestamp: '2024-05-15T10:06:00Z', kind: 'status_change', summary: 'Status changed New → In Review', actor: 'System' },
    ],
    internalNotes: 'High fit for TRT. Route to Austin TRT clinic.',
  },
  {
    id: 'LD-002',
    type: 'patient',
    origin: 'assessment',
    status: 'in_review',
    priority: 'medium',
    createdAt: '2024-05-14T14:20:00Z',
    name: 'Jamal Nguyen',
    email: 'jamal.nguyen@example.com',
    phone: '+1 (305) 555-0111',
    serviceLine: 'GLP1',
    region: 'FL',
    channel: 'Google',
    campaign: 'GLP1_FL_Search',
    adGroup: 'GLP1_weight_loss',
    geo: 'Miami, FL',
    sourceUrl: 'https://novalyte.ai/assessment/glp1',
    assessmentId: 'ASMT-102',
    assessmentStatus: 'completed',
    assessmentUpdatedAt: '2024-05-14T14:18:00Z',
    primaryGoals: ['Weight loss'],
    keyFlags: ['Family history diabetes'],
    aiRiskLevel: 'low',
    aiInsightSummary: 'Good GLP-1 candidate. Schedule consult this week.',
    aiQualificationScore: 78,
    activity: [
      { id: 'act-3', timestamp: '2024-05-14T14:21:00Z', kind: 'status_change', summary: 'Status changed New → In Review', actor: 'System' },
      { id: 'act-4', timestamp: '2024-05-14T14:19:00Z', kind: 'assessment_update', summary: 'Assessment completed', actor: 'System' },
    ],
    internalNotes: 'Prefers evenings. Miami GLP-1 capacity available.',
  },
  {
    id: 'LD-003',
    type: 'mens_clinic',
    origin: 'marketplace',
    status: 'contacted',
    priority: 'high',
    createdAt: '2024-05-13T09:45:00Z',
    clinicOrVendorName: 'Dallas Vitality Clinic',
    region: 'TX',
    channel: 'Referral',
    campaign: 'Partner_Network',
    geo: 'Dallas, TX',
    aiRiskLevel: 'medium',
    aiInsightSummary: 'Clinic wants more TRT leads; capacity 77/100.',
    aiQualificationScore: 70,
    activity: [
      { id: 'act-5', timestamp: '2024-05-13T10:00:00Z', kind: 'message', summary: 'Clinic asked about lead volumes for June', actor: 'Clinic' },
      { id: 'act-6', timestamp: '2024-05-13T09:50:00Z', kind: 'status_change', summary: 'Status changed New → Contacted', actor: 'Agent' },
    ],
    internalNotes: 'Align with Texas routing plan.',
  },
  {
    id: 'LD-004',
    type: 'vendor',
    origin: 'contact_form',
    status: 'new',
    priority: 'low',
    createdAt: '2024-05-12T12:00:00Z',
    clinicOrVendorName: 'Precision Labs',
    region: 'CA',
    channel: 'Direct',
    campaign: 'Website',
    aiRiskLevel: 'low',
    aiInsightSummary: 'Vendor offering lab services. Evaluate pricing.',
    aiQualificationScore: 40,
    activity: [
      { id: 'act-7', timestamp: '2024-05-12T12:05:00Z', kind: 'status_change', summary: 'Status changed New → In Review', actor: 'System' },
    ],
    internalNotes: 'Forward to ops for review.',
  },
  {
    id: 'LD-005',
    type: 'patient',
    origin: 'chat',
    status: 'contacted',
    priority: 'medium',
    createdAt: '2024-05-11T18:30:00Z',
    name: 'Carlos Rivera',
    email: 'carlos.rivera@example.com',
    phone: '+1 (917) 555-0145',
    serviceLine: 'RECOVERY',
    region: 'NY',
    channel: 'Chat',
    geo: 'New York, NY',
    assessmentId: 'ASMT-305',
    assessmentStatus: 'needs_review',
    assessmentUpdatedAt: '2024-05-11T18:20:00Z',
    primaryGoals: ['Recovery'],
    keyFlags: ['Chest discomfort'],
    aiRiskLevel: 'high',
    aiInsightSummary: 'Red flag: chest discomfort. Escalate to clinician.',
    aiQualificationScore: 30,
    activity: [
      { id: 'act-8', timestamp: '2024-05-11T18:32:00Z', kind: 'message', summary: 'Mentioned chest discomfort on exertion', actor: 'Patient' },
      { id: 'act-9', timestamp: '2024-05-11T18:31:00Z', kind: 'status_change', summary: 'Status changed New → Contacted', actor: 'Agent' },
    ],
    internalNotes: 'Route to clinician; hold marketing follow-ups.',
  },
  {
    id: 'LD-006',
    type: 'patient',
    origin: 'manual',
    status: 'converted',
    priority: 'high',
    createdAt: '2024-05-10T08:10:00Z',
    name: 'Leo Chen',
    email: 'leo.chen@example.com',
    phone: '+1 (415) 555-0188',
    serviceLine: 'PEPTIDES',
    region: 'CA',
    channel: 'Direct',
    geo: 'San Francisco, CA',
    assessmentId: 'ASMT-221',
    assessmentStatus: 'qualified',
    assessmentUpdatedAt: '2024-05-10T08:05:00Z',
    primaryGoals: ['Recovery', 'Performance'],
    aiRiskLevel: 'low',
    aiInsightSummary: 'High-LTV peptide candidate; already converted.',
    aiQualificationScore: 88,
    activity: [
      { id: 'act-10', timestamp: '2024-05-10T08:12:00Z', kind: 'status_change', summary: 'Status changed Contacted → Converted', actor: 'Agent' },
    ],
    internalNotes: 'Keep engaged for upsell.',
  },
  {
    id: 'LD-007',
    type: 'patient',
    origin: 'marketplace',
    status: 'closed',
    priority: 'low',
    createdAt: '2024-05-09T13:00:00Z',
    name: 'Max Thompson',
    email: 'max.thompson@example.com',
    phone: '+1 (206) 555-0199',
    serviceLine: 'LONGEVITY',
    region: 'WA',
    channel: 'Marketplace',
    geo: 'Seattle, WA',
    aiRiskLevel: 'medium',
    aiInsightSummary: 'Interest cooled; revisit later.',
    aiQualificationScore: 45,
    activity: [
      { id: 'act-11', timestamp: '2024-05-09T13:20:00Z', kind: 'status_change', summary: 'Status changed Contacted → Closed', actor: 'Agent' },
    ],
    internalNotes: 'Closed after no response.',
  },
  {
    id: 'LD-008',
    type: 'mens_clinic',
    origin: 'manual',
    status: 'in_review',
    priority: 'medium',
    createdAt: '2024-05-08T10:30:00Z',
    clinicOrVendorName: 'Seattle Longevity Clinic',
    region: 'WA',
    channel: 'Referral',
    aiRiskLevel: 'low',
    aiInsightSummary: 'Clinic wants longevity leads; capacity moderate.',
    aiQualificationScore: 65,
    activity: [
      { id: 'act-12', timestamp: '2024-05-08T10:35:00Z', kind: 'status_change', summary: 'Status changed New → In Review', actor: 'Agent' },
    ],
    internalNotes: 'Discuss slot availability before routing.',
  },
  {
    id: 'LD-009',
    type: 'vendor',
    origin: 'marketplace',
    status: 'contacted',
    priority: 'medium',
    createdAt: '2024-05-07T16:00:00Z',
    clinicOrVendorName: 'Nutrient IV Co.',
    region: 'CA',
    channel: 'Marketplace',
    aiRiskLevel: 'medium',
    aiInsightSummary: 'IV vendor; evaluate compliance before onboarding.',
    aiQualificationScore: 50,
    activity: [
      { id: 'act-13', timestamp: '2024-05-07T16:05:00Z', kind: 'status_change', summary: 'Status changed New → Contacted', actor: 'System' },
    ],
    internalNotes: 'Send vendor checklist.',
  },
  {
    id: 'LD-010',
    type: 'patient',
    origin: 'assessment',
    status: 'in_review',
    priority: 'high',
    createdAt: '2024-05-06T07:40:00Z',
    name: 'Omar Johnson',
    email: 'omar.johnson@example.com',
    phone: '+1 (713) 555-0177',
    serviceLine: 'IV_THERAPY',
    region: 'TX',
    channel: 'Meta',
    geo: 'Houston, TX',
    assessmentId: 'ASMT-610',
    assessmentStatus: 'completed',
    assessmentUpdatedAt: '2024-05-06T07:35:00Z',
    primaryGoals: ['Energy'],
    keyFlags: ['Asked about IV pricing'],
    aiRiskLevel: 'medium',
    aiInsightSummary: 'IV therapy interest; follow up quickly.',
    aiQualificationScore: 68,
    activity: [
      { id: 'act-14', timestamp: '2024-05-06T07:45:00Z', kind: 'message', summary: 'Asked about IV therapy pricing', actor: 'Patient' },
    ],
    internalNotes: 'Route to Houston IV clinic.',
  },
]

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const q = (url.searchParams.get('q') || '').toLowerCase()
    const status = (url.searchParams.get('status') || '').toLowerCase() as LeadStatus | 'all' | ''
    const type = (url.searchParams.get('type') || '').toLowerCase() as LeadType | 'all' | ''
    const priority = (url.searchParams.get('priority') || '').toLowerCase() as LeadPriority | 'all' | ''
    const origin = (url.searchParams.get('origin') || '').toLowerCase() as LeadOrigin | 'all' | ''
    const clinicId = url.searchParams.get('clinicId') || ''

    let leads = [...MOCK_LEADS]

    if (q) {
      leads = leads.filter((lead) => {
        return (
          lead.id.toLowerCase().includes(q) ||
          (lead.name && lead.name.toLowerCase().includes(q)) ||
          (lead.email && lead.email.toLowerCase().includes(q)) ||
          (lead.phone && lead.phone.toLowerCase().includes(q))
        )
      })
    }
    if (status && status !== 'all') {
      leads = leads.filter((lead) => lead.status === status)
    }
    if (type && type !== 'all') {
      leads = leads.filter((lead) => lead.type === type)
    }
    if (priority && priority !== 'all') {
      leads = leads.filter((lead) => lead.priority === priority)
    }
    if (origin && origin !== 'all') {
      leads = leads.filter((lead) => lead.origin === origin)
    }
    if (clinicId) {
      // Placeholder: when leads are linked to clinics by id, filter here. For now, keep all.
    }

    return NextResponse.json({ leads })
  } catch (error: any) {
    console.error('[LEADS][LIST] error', error)
    return NextResponse.json({ leads: [], error: 'Unable to load leads right now.' }, { status: 500 })
  }
}

