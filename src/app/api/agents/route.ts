import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import client from '@/config/letta-client'
import { AgentState } from '@letta-ai/letta-client/serialization'

// This is your template agent ID
const AGENT_TEMPLATES = ["panda:latest"]
const LETTA_PROJECT_ID = process.env.LETTA_DEFAULT_PROJECT_ID

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has an identity

    const existingIdentities = await client.identities.list({
      identifierKey: session.user.uuid
    })
    console.log(session.user.uuid)
    let userIdentity = existingIdentities[0]
    console.log("User identity", userIdentity);
    if (!userIdentity) {
      // Create identity for new user/
      console.log("User had no identity, creating identity with ", session.user.uuid, " ", LETTA_PROJECT_ID)
      userIdentity = await client.identities.create({
        identifierKey: session.user.uuid,
        name: session.user.uuid,
        identityType: 'user',
        projectId: LETTA_PROJECT_ID
      })
    }
    // const agent = await client.agents.create({
    //   fromTemplate: AGENT_TEMPLATES[0],
    //   tags: [session.user.uuid],
    // })
    const agent = []

    // console.log(`Agent created: ${agent.id}`)
    // const userAgents = await Promise.all(
    //   AGENT_TEMPLATES.map(async (templateName: string) => {
    //   })
    // )

    return NextResponse.json([])
  } catch (error: any) {
    console.error('Letta API Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}