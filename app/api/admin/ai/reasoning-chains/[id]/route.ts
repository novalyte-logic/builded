import { NextResponse } from 'next/server'
import { chains } from '../../metrics/route'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const chain = chains.find((c) => c.id === params.id)
  if (!chain) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(chain)
}

