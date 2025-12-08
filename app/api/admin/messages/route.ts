/**
 * Admin Messages API Route
 * 
 * GET /api/admin/messages - List message threads with filters
 * POST /api/admin/messages - Create new thread (sync from frontend)
 */

import { NextRequest, NextResponse } from 'next/server'

// Mock data store (replace with actual DB/ORM in production)
const threads: any[] = []
const messages: any[] = []

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const channel = searchParams.get('channel')
    const status = searchParams.get('status')
    const participantType = searchParams.get('participant_type')
    const search = searchParams.get('search')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    let filteredThreads = [...threads]

    // Apply filters
    if (channel) {
      filteredThreads = filteredThreads.filter((t) => t.channel === channel)
    }

    if (status) {
      filteredThreads = filteredThreads.filter((t) => t.status === status)
    }

    if (participantType) {
      filteredThreads = filteredThreads.filter((t) => t.participant_type === participantType)
    }

    if (startDate && endDate) {
      filteredThreads = filteredThreads.filter((t) => {
        const createdAt = new Date(t.created_at)
        return createdAt >= new Date(startDate) && createdAt <= new Date(endDate)
      })
    }

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase()
      filteredThreads = filteredThreads.filter((t) => {
        // Search in subject, tags, and last message body if available
        const lastMessage = messages.find((m: any) => m.thread_id === t.id)
        return (
          t.subject.toLowerCase().includes(searchLower) ||
          t.metadata?.lead_name?.toLowerCase().includes(searchLower) ||
          (Array.isArray(t.tags) && t.tags.some((tag: string) => tag.toLowerCase().includes(searchLower))) ||
          (lastMessage && lastMessage.body.toLowerCase().includes(searchLower))
        )
      })
    }

    // Normalize channel names (support both old and new)
    const channelMap: Record<string, string> = {
      'contact_form': 'contact',
      'clinic_partnership': 'mens_clinic_partnership',
    }
    if (channel && channelMap[channel]) {
      // Also include legacy channel names in filter
      filteredThreads = filteredThreads.filter((t) => 
        t.channel === channel || t.channel === channelMap[channel]
      )
    }

    // Get latest message for each thread
    const threadsWithMessages = filteredThreads.map((thread) => {
      const threadMessages = messages.filter((m) => m.thread_id === thread.id)
      const latestMessage = threadMessages.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0]

      return {
        ...thread,
        last_message: latestMessage || null,
        message_count: threadMessages.length,
      }
    })

    // Sort by last_activity_at desc (most recent first)
    threadsWithMessages.sort((a, b) => {
      return new Date(b.last_activity_at).getTime() - new Date(a.last_activity_at).getTime()
    })

    return NextResponse.json({
      threads: threadsWithMessages,
      total: threadsWithMessages.length,
    })
  } catch (error: any) {
    console.error('Messages API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/messages - Create new thread/message (sync from frontend)
 * 
 * Called when:
 * - Contact form submitted
 * - Patient help message sent
 * - Clinic/Vendor application submitted
 * - AI chat message persisted
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.subject || !body.channel || !body.message_body) {
      return NextResponse.json(
        { error: 'Missing required fields: subject, channel, message_body' },
        { status: 400 }
      )
    }

    const threadId = body.thread_id || crypto.randomUUID()

    // Create or update thread
    const existingThread = threads.find((t) => t.id === threadId)

    const thread = existingThread || {
      id: threadId,
      related_lead_id: body.related_lead_id || null,
      subject: body.subject,
      channel: body.channel,
      created_at: new Date().toISOString(),
      last_activity_at: new Date().toISOString(),
      participant_type: body.participant_type || 'unknown',
      status: 'open' as const,
      tags: body.tags || [],
      metadata: body.metadata || {},
    }

    if (!existingThread) {
      threads.push(thread)
    } else {
      // Update existing thread
      thread.last_activity_at = new Date().toISOString()
      if (body.status) thread.status = body.status
      if (body.tags) thread.tags = [...new Set([...thread.tags, ...body.tags])]
    }

    // Create message
    const message = {
      id: crypto.randomUUID(),
      thread_id: threadId,
      created_at: new Date().toISOString(),
      sender_type: body.sender_type || 'user',
      sender_display: body.sender_display || null,
      body: body.message_body,
      metadata: body.message_metadata || {},
    }

    messages.push(message)

    // Update thread last_activity
    thread.last_activity_at = new Date().toISOString()

    // Optionally create/link LeadRecord
    if (body.create_lead && !thread.related_lead_id) {
      // TODO: Create LeadRecord based on channel and metadata
      // await createLeadFromMessage(thread, message)
    }

    return NextResponse.json({ thread, message }, { status: 201 })
  } catch (error: any) {
    console.error('Create message error:', error)
    return NextResponse.json(
      { error: 'Failed to create message', details: error.message },
      { status: 500 }
    )
  }
}

