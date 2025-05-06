// src/app/(server)/api/agents/route.ts
import { NextRequest, NextResponse } from 'next/server'
import client from '@/config/letta-client'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import { AgentState } from '@letta-ai/letta-client/serialization'

const AGENT_TEMPLATES = ["panda:latest"]
const LETTA_PROJECT_ID = process.env.LETTA_DEFAULT_PROJECT_ID

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    // Check if the user already has an identity in the server. 
    const existingIdentities = await client.identities.list({
      identifierKey: session.user.uuid
    })
    console.log(session.user.uuid)
    let userIdentity = existingIdentities[0]
    let userAgents = []

    if (!userIdentity) {
      console.log("user doesn't have an identity, creating one")
      userIdentity = await client.identities.create({
        identifierKey: session.user.uuid,
        name: session.user.uuid,
        identityType: 'user',
        projectId: LETTA_PROJECT_ID
      })

      const agent = await client.agents.create({
        fromTemplate: AGENT_TEMPLATES[0],
        identityIds: [userIdentity.id || ""],
        name: "Finance Agent"
      })
      userAgents.push(agent)
    } else {
      let agents = await client.agents.list({
        identityId: userIdentity.id
      })
      userAgents.push(...agents)
    }


    return NextResponse.json(userAgents)
  } catch (error) {
    console.error('Error fetching agents:', error)
    return NextResponse.json(
      { error: 'Failed to fetch agents from Letta server' },
      { status: 500 }
    )
  }
}


