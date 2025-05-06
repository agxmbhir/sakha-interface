'use client'

import { useAgentContext } from '@/app/agents/[agentId]/context/agent-context'
import { useAgents } from './hooks/use-agents'
import { SkeletonLoadBlock } from './ui/skeleton-load-block'
import { SidebarTrigger } from './ui/sidebar'
import { Button } from './ui/button'
import { useRouter } from 'next/navigation'

import { LoaderCircle, LayoutDashboard, List } from 'lucide-react'
import { useMemo } from 'react'

export const ChatHeader: React.FC = () => {
  const router = useRouter()
  const { agentId } = useAgentContext()
  const { data: agentData, isLoading } = useAgents()
  const selectedAgent = useMemo(() => {
    if (!agentData) return null
    if (agentData.length === 0) return null
    return agentData.find((a) => a.id === agentId)
  }, [agentData, agentId])

  return (
    <>
      <div className='flex-1 overflow-hidden'>
        <div className='flex items-center justify-between w-full'>
          <div className='flex items-center gap-2 w-1/2 overflow-hidden'>
            <SidebarTrigger />
            <div className='w-full overflow-hidden hidden sm:block'>
              {isLoading ? (
                <SkeletonLoadBlock className='w-[10em] h-[1em]' />
              ) : (
                <div className='text-l font-bold truncate'>
                  {selectedAgent?.name}
                </div>
              )}
            </div>
          </div>

          <div className='flex items-center'>
            {isLoading ? (
              <LoaderCircle
                className='w-max h-full px-2 animate-spin'
                size={17}
              />
            ) : (
              <div className='flex items-center gap-2'>
                {/* Desktop Navigation */}
                <Button
                  variant="ghost"
                  size="sm"
                  className='hidden sm:flex items-center gap-2 text-xs font-bold'
                  onClick={() => router.push('/dashboard')}
                >
                  <span>DASHBOARD</span>
                  <LayoutDashboard size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className='hidden sm:flex items-center gap-2 text-xs font-bold'
                  onClick={() => router.push('/agents')}
                >
                  <span>AGENTS</span>
                  <List size={16} />
                </Button>

                {/* Mobile Navigation */}
                <Button
                  variant="ghost"
                  size="icon"
                  className='sm:hidden'
                  onClick={() => router.push('/dashboard')}
                >
                  <LayoutDashboard size={20} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className='sm:hidden'
                  onClick={() => router.push('/agents')}
                >
                  <List size={20} />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}