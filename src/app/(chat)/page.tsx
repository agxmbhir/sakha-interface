// src/app/[agentId]/page.tsx
import { Chat } from '@/components/chat'
import { cookies } from 'next/headers'
import { lettaCloud } from '@letta-ai/vercel-ai-sdk-provider'
import { convertToAiSdkMessage } from '@letta-ai/vercel-ai-sdk-provider'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Message } from 'ai'

// Type for the page params
type PageProps = {
  params: {
    agentId: string
  }
}

async function getExistingMessages(agentId: string) {
  try {
    const messages = await lettaCloud.client.agents.messages.list(agentId)
    return convertToAiSdkMessage(messages)
  } catch (error) {
    console.error('Error fetching messages:', error)
    return []
  }
}

async function saveAgentIdCookie(agentId: string) {
  'use server'
  const cookie = await cookies()
  await cookie.set('active-agent', agentId, { path: '/' })
}

export default async function ChatPage({ params }: PageProps) {
  // Validate agentId exists
  if (!params?.agentId) {
    notFound()
  }

  let existingMessages: Message[] = []
  try {
    // Use get() instead of retrieve() and don't await params.agentId
    const agent = await lettaCloud.client.agents.retrieve(params.agentId)
    if (!agent) {
      notFound()
    }

    existingMessages = await getExistingMessages(params.agentId)
  } catch (error) {
    console.error('Error:', error)
    // If agent not found, redirect to 404
    if ((error as any)?.statusCode === 404) {
      notFound()
    }
    // For other errors, we'll still render the page but with empty messages
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="p-4 border-b">
        <Link href="/" className="text-blue-500 hover:underline">
          ← Back to Agents
        </Link>
      </header>

      <main className="flex-1 p-4">
        <Chat
          agentId={params.agentId}
          existingMessages={existingMessages}
          saveAgentIdCookie={saveAgentIdCookie}
        />
      </main>
    </div>
  )
}