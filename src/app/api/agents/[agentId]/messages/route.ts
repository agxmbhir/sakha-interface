


import { NextRequest, NextResponse } from 'next/server'
import client from '@/config/letta-client'
import { MESSAGE_TYPE } from '@/types'
import { LettaMessageUnion } from '@letta-ai/letta-client/api/types'

export async function GET(
  req: NextRequest,
  context: { params: { agentId: string } }
) {
  const { agentId } = await context.params
  try {
    const messages = await client.agents.messages.list(agentId)

    const formattedMessages = messages
      .filter((msg: LettaMessageUnion) => {
        // Only keep user messages, assistant messages, and tool interactions
        return ['user_message', 'assistant_message', 'tool_call_message', 'tool_return_message'].includes(msg.messageType)
      })
      .map((msg: LettaMessageUnion) => {
        const baseId = msg.id || `msg-${msg.date}-${Math.random().toString(36).substr(2, 9)}`
        const timestamp = new Date(msg.date).getTime()

        switch (msg.messageType) {
          case 'tool_call_message':
          case 'tool_return_message':
            return {
              id: baseId,
              date: timestamp,
              message: 'toolCall' in msg ? JSON.stringify(msg.toolCall) : msg.toolReturn,
              messageType: MESSAGE_TYPE.TOOL_CALL_MESSAGE
            }
          default:
            return {
              id: baseId,
              date: timestamp,
              message: 'content' in msg ? msg.content : "",
              messageType: msg.messageType === 'user_message' ? MESSAGE_TYPE.USER_MESSAGE : MESSAGE_TYPE.ASSISTANT_MESSAGE
            }
        }
      })

    return NextResponse.json(formattedMessages)
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json({ error: 'Error fetching messages' }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ agentId: string }> }
) {
  const { agentId } = await context.params
  try {
    const { text } = await req.json()

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const response = await client.agents.messages.createStream(agentId, {
            messages: [{
              role: "user",
              content: [{
                type: "text",
                text
              }]
            }]
          })

          for await (const chunk of response) {
            // Only send assistant and user messages to the client
            if (chunk.messageType === 'assistant_message' || chunk.messageType === 'user_message') {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`))
            }
          }
        } catch (error) {
          console.error('Stream error:', error)
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'Failed to get response' })}\n\n`))
        }
        controller.close()
      }
    })

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    })
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json({ error: 'Error sending message' }, { status: 500 })
  }
}