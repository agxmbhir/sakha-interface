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

      return messages.map((msg: AppMessage) => {
        const messageContentForId = (typeof msg.message === 'string' && msg.message) ? msg.message.slice(0, 10) : 'nodata';
        return {
          ...msg,
          id: msg.id || `msg-${msg.date}-${msg.messageType}-${messageContentForId}`
        };
      })
    },
    enabled: !!agentId,
    staleTime: 0
  })
}