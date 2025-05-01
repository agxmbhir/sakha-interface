import { NextRequest, NextResponse } from 'next/server'
import client from '@/config/letta-client'

export async function GET(req: NextRequest) {
  try {
    // Fetch all deployed agents from the Letta server
    const agents = await client.agents.list()

    // Sort by name or another relevant field for better organization
    const sortedAgents = agents.sort((a, b) => {
      return (a.name || '').localeCompare(b.name || '')
    })

    return NextResponse.json(sortedAgents)
  } catch (error) {
    console.error('Error fetching agents:', error)
    return NextResponse.json(
      { error: 'Failed to fetch agents from Letta server' },
      { status: 500 }
    )
  }
}