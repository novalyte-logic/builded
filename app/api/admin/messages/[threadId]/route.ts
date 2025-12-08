/**
 * Admin Message Thread Detail API Route
 * 
 * GET /api/admin/messages/:threadId - Get thread with all messages
 * PATCH /api/admin/messages/:threadId - Update thread (status, tags)
 * POST /api/admin/messages/:threadId - Add admin reply message
 */

import { NextRequest, NextResponse } from 'next/server'

// Mock data (replace with DB)
const threads: any[] = []
const messages: any[] = []

export async function GET(
  request: NextRequest,
  { params }: { params: { threadId: string } }
) {
  try {
    const threadId = params.threadId

    const thread = threads.find((t) => t.id === threadId)
    if (!thread) {
      return NextResponse.json({ error: 'Thread not found' }, { status: 404 })
    }

    const threadMessages = messages
      .filter((m) => m.thread_id === threadId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

    return NextResponse.json({
      thread: {
        ...thread,
        messages: threadMessages,
        message_count: threadMessages.length,
      },
    })
  } catch (error: any) {
    console.error('Thread detail API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch thread', details: error.message },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { threadId: string } }
) {
  try {
    const threadId = params.threadId
    const body = await request.json()

    const threadIndex = threads.findIndex((t) => t.id === threadId)
    if (threadIndex === -1) {
      return NextResponse.json({ error: 'Thread not found' }, { status: 404 })
    }

    const updatedThread = {
      ...threads[threadIndex],
      ...body,
      last_activity_at: new Date().toISOString(),
    }

    threads[threadIndex] = updatedThread

    return NextResponse.json({ thread: updatedThread })
  } catch (error: any) {
    console.error('Update thread error:', error)
    return NextResponse.json(
      { error: 'Failed to update thread', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/messages/:threadId - Send admin reply
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { threadId: string } }
) {
  try {
    const threadId = params.threadId
    const body = await request.json()

    if (!body.message_body) {
      return NextResponse.json({ error: 'Missing message_body' }, { status: 400 })
    }

    const thread = threads.find((t) => t.id === threadId)
    if (!thread) {
      return NextResponse.json({ error: 'Thread not found' }, { status: 404 })
    }

    // Create admin message
    const message = {
      id: crypto.randomUUID(),
      thread_id: threadId,
      created_at: new Date().toISOString(),
      sender_type: 'admin',
      sender_display: body.sender_display || 'Superadmin',
      body: body.message_body,
      metadata: body.metadata || {},
    }

    messages.push(message)

    // Update thread
    thread.last_activity_at = new Date().toISOString()
    if (body.status) {
      thread.status = body.status
    }

    // TODO: Trigger email/in-app delivery to user
    // await sendMessageToUser(thread, message)

    return NextResponse.json({ message, thread }, { status: 201 })
  } catch (error: any) {
    console.error('Send reply error:', error)
    return NextResponse.json(
      { error: 'Failed to send reply', details: error.message },
      { status: 500 }
    )
  }
}

