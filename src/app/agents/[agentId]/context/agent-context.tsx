'use client'
import { useAgentIdParam } from '@/components/hooks/use-agentId-param'
import { useRouter } from 'next/navigation'

export const useAgentContext = () => {
  const router = useRouter()
  const setAgentId = (id: string) => {
    router.push(`/agents/${id}`)
  }

  const agentId = useAgentIdParam() as string

  return { agentId, setAgentId }
}