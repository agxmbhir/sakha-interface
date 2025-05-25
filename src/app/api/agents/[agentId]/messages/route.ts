import { NextRequest, NextResponse } from 'next/server'
import client from '@/config/letta-client'
import { MESSAGE_TYPE, AppMessage } from '@/types'
import { LettaMessageUnion } from '@letta-ai/letta-client/api/types'
import { v4 as uuidv4 } from 'uuid'

export async function GET(
  req: NextRequest,
  context: { params: { agentId: string } }
) {
  const { agentId } = await context.params
  try {
    // client.agents.messages.reset(agentId)
    const messages = await client.agents.messages.list(agentId, {
      limit: 1000
    })
    const formattedMessages = messages
      .filter((msg: LettaMessageUnion | any): msg is LettaMessageUnion => {
        return ['user_message', 'assistant_message', 'tool_call_message', 'tool_return_message'].includes(msg.messageType);
      })
      .map((msg: LettaMessageUnion): AppMessage | null => {
        const randomPart = uuidv4().substr(0, 9);
        const timestamp = new Date(msg.date).getTime();
        const baseId = msg.id || `msg-${timestamp}-${randomPart}`;

        switch (msg.messageType) {
          case 'tool_call_message':
            if (!('toolCall' in msg) || !msg.toolCall) {
              console.warn('Skipping tool_call_message without toolCall data:', msg);
              return null;
            }
            return {
              id: baseId,
              date: timestamp,
              message: JSON.stringify(msg.toolCall),
              messageType: MESSAGE_TYPE.TOOL_CALL
            };
          case 'tool_return_message':
            if (!('toolReturn' in msg)) {
              console.warn('Skipping tool_return_message without toolReturn data field:', msg);
              return null;
            }
            return {
              id: baseId,
              date: timestamp,
              message: JSON.stringify(msg.toolReturn),
              messageType: MESSAGE_TYPE.TOOL_RETURN
            };
          default:
            if (!('content' in msg)) {
              console.warn(`Skipping ${msg.messageType} without content data:`, msg);
              return null;
            }
            return {
              id: baseId,
              date: timestamp,
              message: msg.content,
              messageType: msg.messageType === 'user_message' ? MESSAGE_TYPE.USER_MESSAGE : MESSAGE_TYPE.ASSISTANT_MESSAGE
            };
        }
      })
      .filter(Boolean) as AppMessage[];

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