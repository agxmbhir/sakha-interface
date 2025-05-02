import { AppMessage } from '@/types'
import { useQuery } from '@tanstack/react-query'

export const getAgentMessagesQueryKey = (agentId: string) => [
  'agentMessages',
  agentId
]

export function useAgentMessages(agentId: string) {
  return useQuery<AppMessage[]>({
    queryKey: getAgentMessagesQueryKey(agentId),
    queryFn: async () => {
      const response = await fetch(`/api/agents/${agentId}/messages`)
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      const messages = await response.json()

      // Ensure each message has a unique ID
      return messages.map((msg: AppMessage) => ({
        ...msg,
        id: msg.id || `msg-${msg.date}-${Math.random().toString(36).substr(2, 9)}`
      }))
    },
    enabled: !!agentId,
    staleTime: 0 // Always fetch fresh data
  })
}