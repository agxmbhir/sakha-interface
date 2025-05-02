import { streamText } from 'ai'
import { lettaCloud } from '@letta-ai/vercel-ai-sdk-provider'

export const maxDuration = 30

export async function POST(req: Request) {
    const { messages, agentId } = await req.json()

    if (!agentId) {
        return new Response('Missing agentId', { status: 400 })
    }

    const result = streamText({
        model: lettaCloud(agentId),
        messages,
    })

    return result.toDataStreamResponse()

}