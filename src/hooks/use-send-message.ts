// src/hooks/use-send-message.ts
import { useState } from 'react'
import { useParams } from 'next/navigation'
import { LettaMessage } from '@/types'

export function useSendMessage() {
    const [isPending, setIsPending] = useState(false)
    const params = useParams()
    const agentId = params.agentId as string

    const sendMessage = async (content: string) => {
        setIsPending(true)
        try {
            const response = await fetch(`/api/agents/${agentId}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: [
                        {
                            role: 'user',
                            content: content,
                        },
                    ],
                }),
            })

            if (!response.ok) {
                throw new Error('Failed to send message')
            }

            const data = await response.json()
            return data.messages as LettaMessage[]
        } catch (error) {
            console.error('Error sending message:', error)
            throw error
        } finally {
            setIsPending(false)
        }
    }

    return { isPending, mutate: sendMessage }
}