/**
 * Message Sync Service
 * 
 * Handles synchronization of messages and threads from app.novalyte.io
 * Creates threads, messages, and links to LeadRecords appropriately
 */

import { MessageThread, Message, MessageChannel, ParticipantType } from '@/lib/types/message'
import { LeadRecord, LeadType, LeadOrigin } from '@/lib/types/assessment'

/**
 * Sync Contact Form Submission
 * 
 * Called when a contact form is submitted on app.novalyte.io
 */
export async function syncContactFormSubmission(data: {
  name: string
  email: string
  phone?: string
  subject: string
  message: string
  topic?: string // e.g., "TRT", "GLP-1", "Partnership", etc.
  page_path?: string
}): Promise<{ thread: MessageThread; message: Message; lead?: LeadRecord }> {
  // Infer participant type from topic
  let participantType: ParticipantType = 'unknown'
  if (data.topic?.toLowerCase().includes('clinic') || data.topic?.toLowerCase().includes('partnership')) {
    participantType = 'mens_clinic'
  } else if (data.topic?.toLowerCase().includes('vendor')) {
    participantType = 'vendor'
  } else {
    participantType = 'patient'
  }

  // Determine if we should create a lead (high intent)
  const highIntentTopics = ['TRT', 'GLP-1', 'peptides', 'treatment', 'consultation']
  const shouldCreateLead = highIntentTopics.some(topic => 
    data.message.toLowerCase().includes(topic.toLowerCase()) || 
    data.subject.toLowerCase().includes(topic.toLowerCase())
  )

  const threadId = crypto.randomUUID()
  
  const thread: MessageThread = {
    id: threadId,
    related_lead_id: null,
    subject: data.subject,
    channel: 'contact',
    created_at: new Date(),
    last_activity_at: new Date(),
    participant_type: participantType,
    status: 'open',
    tags: data.topic ? [data.topic] : [],
    metadata: {
      email: data.email,
      phone: data.phone,
      page_path: data.page_path,
    },
  }

  const message: Message = {
    id: crypto.randomUUID(),
    thread_id: threadId,
    created_at: new Date(),
    sender_type: 'user',
    sender_display: data.name,
    body: data.message,
    metadata: {
      email: data.email,
      phone: data.phone,
      page_path: data.page_path,
    },
  }

  let lead: LeadRecord | undefined

  if (shouldCreateLead) {
    lead = {
      id: crypto.randomUUID(),
      assessment_id: null,
      user_id: null,
      created_at: new Date(),
      updated_at: new Date(),
      lead_type: participantType === 'mens_clinic' ? 'mens_clinic' : participantType === 'vendor' ? 'vendor' : 'patient',
      origin: 'contact_form',
      status: 'new',
      priority: 'medium',
      tags: data.topic ? [data.topic] : [],
      notes: `Contact form submission: ${data.subject}`,
      assigned_to: null,
      converted_at: null,
    }

    thread.related_lead_id = lead.id
  }

  // TODO: Save to database
  // await db.threads.create(thread)
  // await db.messages.create(message)
  // if (lead) await db.leads.create(lead)

  return { thread, message, lead }
}

/**
 * Sync Men's Clinic Partnership Application
 * 
 * Called when a clinic applies for partnership on app.novalyte.io
 */
export async function syncClinicPartnershipApplication(data: {
  clinic_name: string
  contact_name: string
  email: string
  phone?: string
  city: string
  state?: string
  specialties?: string[] // e.g., ["TRT", "GLP-1"]
  annual_revenue?: number
  patient_volume?: number
  website?: string
  additional_info?: string
}): Promise<{ thread: MessageThread; message: Message; lead: LeadRecord }> {
  const threadId = crypto.randomUUID()
  const leadId = crypto.randomUUID()

  const lead: LeadRecord = {
    id: leadId,
    assessment_id: null,
    user_id: null,
    created_at: new Date(),
    updated_at: new Date(),
    lead_type: 'mens_clinic',
    origin: 'contact_form',
    status: 'new',
    priority: 'high',
    tags: data.specialties || [],
    notes: `Clinic partnership application: ${data.clinic_name} in ${data.city}`,
    assigned_to: null,
    converted_at: null,
  }

  const applicationSummary = `Clinic Partnership Application:

Clinic: ${data.clinic_name}
Contact: ${data.contact_name} (${data.email}${data.phone ? `, ${data.phone}` : ''})
Location: ${data.city}${data.state ? `, ${data.state}` : ''}
Specialties: ${data.specialties?.join(', ') || 'Not specified'}
${data.annual_revenue ? `Annual Revenue: $${data.annual_revenue.toLocaleString()}` : ''}
${data.patient_volume ? `Patient Volume: ${data.patient_volume.toLocaleString()}` : ''}
${data.website ? `Website: ${data.website}` : ''}
${data.additional_info ? `\nAdditional Info:\n${data.additional_info}` : ''}`

  const thread: MessageThread = {
    id: threadId,
    related_lead_id: leadId,
    subject: `Men's Clinic Partnership Application – ${data.clinic_name}`,
    channel: 'mens_clinic_partnership',
    created_at: new Date(),
    last_activity_at: new Date(),
    participant_type: 'mens_clinic',
    status: 'open',
    tags: ['partnership', ...(data.specialties || [])],
    metadata: {
      clinic_name: data.clinic_name,
      email: data.email,
      phone: data.phone,
      city: data.city,
      state: data.state,
      specialties: data.specialties,
      annual_revenue: data.annual_revenue,
      patient_volume: data.patient_volume,
      website: data.website,
    },
  }

  const message: Message = {
    id: crypto.randomUUID(),
    thread_id: threadId,
    created_at: new Date(),
    sender_type: 'user',
    sender_display: data.contact_name,
    body: applicationSummary,
    metadata: {
      email: data.email,
      phone: data.phone,
      application_type: 'clinic_partnership',
    },
  }

  // TODO: Save to database
  // await db.leads.create(lead)
  // await db.threads.create(thread)
  // await db.messages.create(message)

  return { thread, message, lead }
}

/**
 * Sync Vendor Network Application
 * 
 * Called when a vendor applies to join the network on app.novalyte.io
 */
export async function syncVendorNetworkApplication(data: {
  vendor_name: string
  contact_name: string
  email: string
  phone?: string
  product_categories?: string[] // e.g., ["supplements", "equipment"]
  website?: string
  description?: string
  additional_info?: string
}): Promise<{ thread: MessageThread; message: Message; lead: LeadRecord }> {
  const threadId = crypto.randomUUID()
  const leadId = crypto.randomUUID()

  const lead: LeadRecord = {
    id: leadId,
    assessment_id: null,
    user_id: null,
    created_at: new Date(),
    updated_at: new Date(),
    lead_type: 'vendor',
    origin: 'contact_form',
    status: 'new',
    priority: 'medium',
    tags: data.product_categories || [],
    notes: `Vendor network application: ${data.vendor_name}`,
    assigned_to: null,
    converted_at: null,
  }

  const applicationSummary = `Vendor Network Application:

Vendor: ${data.vendor_name}
Contact: ${data.contact_name} (${data.email}${data.phone ? `, ${data.phone}` : ''})
Product Categories: ${data.product_categories?.join(', ') || 'Not specified'}
${data.website ? `Website: ${data.website}` : ''}
${data.description ? `\nDescription:\n${data.description}` : ''}
${data.additional_info ? `\nAdditional Info:\n${data.additional_info}` : ''}`

  const thread: MessageThread = {
    id: threadId,
    related_lead_id: leadId,
    subject: `Vendor Network Application – ${data.vendor_name}`,
    channel: 'vendor_network',
    created_at: new Date(),
    last_activity_at: new Date(),
    participant_type: 'vendor',
    status: 'open',
    tags: ['vendor', 'partnership', ...(data.product_categories || [])],
    metadata: {
      vendor_name: data.vendor_name,
      email: data.email,
      phone: data.phone,
      product_categories: data.product_categories,
      website: data.website,
    },
  }

  const message: Message = {
    id: crypto.randomUUID(),
    thread_id: threadId,
    created_at: new Date(),
    sender_type: 'user',
    sender_display: data.contact_name,
    body: applicationSummary,
    metadata: {
      email: data.email,
      phone: data.phone,
      application_type: 'vendor_network',
    },
  }

  // TODO: Save to database
  // await db.leads.create(lead)
  // await db.threads.create(thread)
  // await db.messages.create(message)

  return { thread, message, lead }
}

/**
 * Sync AI Chat Message
 * 
 * Called when an AI chat message is persisted (user or AI turn)
 */
export async function syncAIChatMessage(data: {
  thread_id?: string // Existing thread or create new
  user_id?: string
  related_lead_id?: string | null
  sender_type: 'user' | 'ai'
  message_body: string
  sender_display?: string
  metadata?: Record<string, any> // AI model info, session context, etc.
  tags?: string[]
}): Promise<{ thread: MessageThread; message: Message }> {
  const threadId = data.thread_id || crypto.randomUUID()

  // Check if thread exists (in real implementation, query database)
  // const existingThread = await db.threads.findById(threadId)

  const thread: MessageThread = {
    id: threadId,
    related_lead_id: data.related_lead_id || null,
    subject: data.thread_id ? 'AI Chat Conversation' : `AI Chat – ${new Date().toLocaleDateString()}`,
    channel: 'ai_chat',
    created_at: new Date(),
    last_activity_at: new Date(),
    participant_type: 'patient', // Default, can be updated
    status: 'open',
    tags: data.tags || [],
    metadata: {
      user_id: data.user_id,
      session_id: data.metadata?.session_id,
    },
  }

  const message: Message = {
    id: crypto.randomUUID(),
    thread_id: threadId,
    created_at: new Date(),
    sender_type: data.sender_type,
    sender_display: data.sender_display || (data.sender_type === 'ai' ? 'Novalyte AI' : 'User'),
    body: data.message_body,
    metadata: {
      ...data.metadata,
      ai_model: data.metadata?.ai_model,
    },
  }

  // TODO: Upsert thread and save message
  // await db.threads.upsert(thread)
  // await db.messages.create(message)

  return { thread, message }
}

/**
 * Sync Patient Help Message
 * 
 * Called when a patient sends a help/support message
 */
export async function syncPatientHelpMessage(data: {
  thread_id?: string
  user_id?: string
  related_lead_id?: string | null
  name?: string
  email?: string
  subject: string
  message: string
  category?: string // e.g., "billing", "appointment", "technical"
  tags?: string[]
}): Promise<{ thread: MessageThread; message: Message }> {
  const threadId = data.thread_id || crypto.randomUUID()

  const thread: MessageThread = {
    id: threadId,
    related_lead_id: data.related_lead_id || null,
    subject: data.subject,
    channel: 'patient_help',
    created_at: new Date(),
    last_activity_at: new Date(),
    participant_type: 'patient',
    status: 'open',
    tags: data.tags || (data.category ? [data.category] : []),
    metadata: {
      user_id: data.user_id,
      email: data.email,
      category: data.category,
    },
  }

  const message: Message = {
    id: crypto.randomUUID(),
    thread_id: threadId,
    created_at: new Date(),
    sender_type: 'user',
    sender_display: data.name || 'Patient',
    body: data.message,
    metadata: {
      email: data.email,
      category: data.category,
    },
  }

  // TODO: Upsert thread and save message
  // await db.threads.upsert(thread)
  // await db.messages.create(message)

  return { thread, message }
}

/**
 * Helper: Get mock threads (for API routes)
 */
export function getMockMessageThreads(): MessageThread[] {
  // This would come from database in production
  return []
}

