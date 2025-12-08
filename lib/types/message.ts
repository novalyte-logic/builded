/**
 * Communication Hub Data Models
 * 
 * Unified message and thread tracking for all communication channels
 */

export type MessageChannel =
  | 'contact' // Contact form submissions
  | 'patient_help' // Patient help center messages
  | 'mens_clinic_partnership' // Men's clinic partnership applications
  | 'vendor_network' // Vendor network applications
  | 'tech_support' // Technical support requests
  | 'ai_chat' // AI chat conversations (when persisted)

// Legacy alias for backwards compatibility
export type MessageChannelLegacy =
  | 'contact_form'
  | 'patient_help'
  | 'clinic_partnership'
  | 'vendor_network'
  | 'tech_support'
  | 'ai_chat'

export type ParticipantType = 'patient' | 'mens_clinic' | 'vendor' | 'unknown'

export type ThreadStatus = 'open' | 'pending' | 'closed'

export type SenderType = 'user' | 'admin' | 'ai'

/**
 * MessageThread Model
 * 
 * Represents a conversation thread that can contain multiple messages.
 * Unifies all communication channels (contact forms, help chats, partnerships, etc.)
 * 
 * Relationship to LeadRecord:
 * - Can be linked to a LeadRecord via related_lead_id
 * - Multiple threads can link to the same lead
 * - Thread helps track conversation history separate from lead workflow
 */
export interface MessageThread {
  id: string // UUID
  related_lead_id: string | null // Links to LeadRecord if applicable
  subject: string
  channel: MessageChannel
  created_at: Date
  last_activity_at: Date
  participant_type: ParticipantType
  status: ThreadStatus
  tags: string[] // e.g., ["TRT", "Billing", "GLP1"]
  metadata?: Record<string, any> // Flexible data (clinic info, vendor details, etc.)
}

/**
 * Message Model
 * 
 * Individual message within a thread.
 * Can be from user, admin, or AI system.
 */
export interface Message {
  id: string // UUID
  thread_id: string // Links to MessageThread
  created_at: Date
  sender_type: SenderType
  sender_display: string | null // Human-readable sender name
  body: string // Message content
  metadata?: Record<string, any> // e.g., page path, AI model info, context
}

/**
 * Thread with Messages
 * 
 * Combined view for UI display
 */
export interface ThreadWithMessages extends MessageThread {
  messages: Message[]
  message_count: number
  unread_count: number
}

/**
 * How different channels create threads:
 * 
 * 1. Contact Form:
 *    - Creates MessageThread (channel: "contact_form")
 *    - Creates first Message (sender_type: "user")
 *    - Optionally creates/links LeadRecord
 * 
 * 2. Clinic Partnership:
 *    - Creates LeadRecord (lead_type: "mens_clinic")
 *    - Creates MessageThread (channel: "clinic_partnership")
 *    - Creates first Message with application summary
 * 
 * 3. Vendor Network:
 *    - Creates LeadRecord (lead_type: "vendor")
 *    - Creates MessageThread (channel: "vendor_network")
 *    - Creates first Message with application summary
 * 
 * 4. AI Chat:
 *    - Upserts MessageThread (channel: "ai_chat") for user/lead
 *    - Appends Messages for each turn (sender_type: "user" | "ai")
 * 
 * 5. Patient Help:
 *    - Creates/upserts MessageThread (channel: "patient_help")
 *    - Creates Message (sender_type: "user")
 */

