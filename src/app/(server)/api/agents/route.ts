// src/app/(server)/api/agents/route.ts
import { NextRequest, NextResponse } from 'next/server'
import client from '@/config/letta-client'

export async function GET(req: NextRequest) {
  try {
    const agents = await client.agents.list()
    return NextResponse.json(agents)
  } catch (error) {
    console.error('Error fetching agents:', error)
    return NextResponse.json(
      { error: 'Failed to fetch agents from Letta server' },
      { status: 500 }
    )
  }
}