import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AppMessage, MESSAGE_TYPE } from '../../types'
import { getAgentMessagesQueryKey } from './use-agent-messages'
import lettaClient from '@/config/letta-client'
import { getMessageId } from '@/lib/utils'
import * as Letta from '@letta-ai/letta-client/api'

export interface UseSendMessageType {
  agentId: string
  text: string
}

export function useSendMessage() {
  const queryClient = useQueryClient()

  async function sendMessage(options: UseSendMessageType) {
    const { agentId, text } = options
    try {
      // Add user message to UI immediately
      const userMessageId = `user-${Date.now()}`
      queryClient.setQueriesData<AppMessage[]>(
        { queryKey: getAgentMessagesQueryKey(agentId) },
        (data) => {
          if (!data) return data
          return [
            ...data,
            {
              id: userMessageId,
              date: Date.now(),
              message: text,
              messageType: 'user_message'
            }
          ]
        }
      )

      // Create streaming response
      const response = await lettaClient.agents.messages.createStream(agentId, {
        messages: [{
          role: "user",
          content: [{ type: "text", text }]
        }]
      })

      // Handle streaming response
      for await (const chunk of response) {
        if (!chunk) continue
        //@ts-ignore
        const messageId = chunk.id || `msg-${Date.now()}`

        queryClient.setQueriesData<AppMessage[]>(
          { queryKey: getAgentMessagesQueryKey(agentId) },
          //@ts-ignore
          (data) => {
            if (!data) return data

            const existingMessage = data.find(msg => msg.id === messageId)

            switch (chunk.messageType) {
              case 'assistant_message': {
                const content = chunk.content
                if (existingMessage) {
                  return data.map(msg => msg.id === messageId ? {
                    ...msg,
                    message: content
                  } : msg)
                }
                return [...data, {
                  id: messageId,
                  date: new Date(chunk.date).getTime(),
                  message: content,
                  messageType: 'assistant'
                }]
              }

              case 'tool_call_message': {
                return [...data, {
                  id: `tool-${messageId}`,
                  date: new Date(chunk.date).getTime(),
                  message: JSON.stringify(chunk.toolCall, null, 2),
                  messageType: MESSAGE_TYPE.TOOL_CALL
                }]
              }

              case 'tool_return_message': {
                return [...data, {
                  id: `tool-return-${messageId}`,
                  date: new Date(chunk.date).getTime(),
                  message: chunk.toolReturn,
                  messageType: MESSAGE_TYPE.TOOL_RETURN
                }]
              }

              default:
                return data
            }
          }
        )
      }
    } catch (error) {
      console.error('Error sending message:', error)
      throw error
    } finally {
      queryClient.invalidateQueries({
        queryKey: getAgentMessagesQueryKey(agentId)
      })
    }
  }

  return useMutation<void, undefined, UseSendMessageType>({
    mutationFn: (options) => sendMessage(options)
  })
}