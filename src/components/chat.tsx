'use client'

import { useChat } from 'ai/react'
import { useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { MessagePill } from '@/components/ui/message'

interface ChatProps {
    agentId: string
}

export function Chat({ agentId }: ChatProps) {
    const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
        api: '/api/runtime',
        body: { agentId },
        initialMessages: []
    })

    return (
        <div className="flex flex-col h-screen">
            <header className="flex items-center p-4 border-b">
                <Link href="/" className="flex items-center text-sm font-medium">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Agents
                </Link>
            </header>

            <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-4">
                    {messages.map((message) => (
                        <MessagePill
                            key={message.id}
                            message={message.content}
                            //@ts-ignore
                            sender={message.role === 'user' ? 'user_message' : 'assistant'}
                        />
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="animate-pulse">...</div>
                        </div>
                    )}
                </div>
            </div>

            <form onSubmit={handleSubmit} className="p-4 border-t">
                <div className="flex gap-2">
                    <input
                        value={input}
                        onChange={handleInputChange}
                        placeholder="Type a message..."
                        className="flex-1 p-2 border rounded"
                        disabled={isLoading}
                    />
                    <Button type="submit" disabled={isLoading}>
                        Send
                    </Button>
                </div>
            </form>
        </div>
    )
}