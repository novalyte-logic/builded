import { NextRequest, NextResponse } from 'next/server'
import { runVertexChatConversation, type VertexConsoleMessage, type VertexConsoleMode } from '@/lib/vertex-ai/service'

export async function POST(req: NextRequest) {
  try {
    const { mode, messages } = (await req.json()) as {
      mode?: VertexConsoleMode
      messages?: VertexConsoleMessage[]
    }

    if (!mode) {
      return NextResponse.json({ error: 'mode is required' }, { status: 400 })
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'messages array is required' }, { status: 400 })
    }

    const result = await runVertexChatConversation({
      mode,
      messages,
    })

    return NextResponse.json({ reply: result.reply })
  } catch (error: any) {
    console.error('Vertex AI console error:', error)
    return NextResponse.json(
      { error: 'Vertex AI error', details: error.message },
      { status: 500 }
    )
  }
}

