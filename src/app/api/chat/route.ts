// src/app/api/chat/route.ts
import { streamText } from 'ai'
import { lettaCloud } from '@letta-ai/vercel-ai-sdk-provider'

export const maxDuration = 30

export async function POST(req: Request) {
    const { messages, agentId } = await req.json()

    if (!agentId) {
        throw new Error('Missing agentId')
    }

    // Configure with token instead of apiKey
    const result = streamText({
        model: lettaCloud(agentId),
        messages,
    })

    return result.toDataStreamResponse()
}