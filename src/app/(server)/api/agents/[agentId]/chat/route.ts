// src/app/(server)/api/agents/[agentId]/chat/route.ts
import { NextRequest, NextResponse } from 'next/server'
import client from '@/config/letta-client'
import { streamText } from 'ai'
import { lettaCloud } from '@letta-ai/vercel-ai-sdk-provider'

export const maxDuration = 30

export async function POST(
    req: NextRequest,
    { params }: { params: { agentId: string } }
) {
    try {
        const { messages } = await req.json()

        const result = streamText({
            model: lettaCloud(params.agentId),
            messages,
        })

        return result.toDataStreamResponse()
    } catch (error) {
        console.error('Error in chat:', error)
        return NextResponse.json(
            { error: 'Failed to process chat message' },
            { status: 500 }
        )
    }
}