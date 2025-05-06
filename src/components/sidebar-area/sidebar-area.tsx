import { useAgentContext } from '@/app/agents/[agentId]/context/agent-context'
import { useDeleteAgent } from '@/components/hooks/use-agent-state'
import { USE_AGENTS_KEY, useAgents } from '@/components/hooks/use-agents'
import { useCreateAgent } from '@/components/hooks/use-create-agent'
import { useGetRuntimeInfo } from '@/components/hooks/use-get-runtime-info'
import { useIsConnected } from '@/components/hooks/use-is-connected'
import { AppSidebar } from '@/components/sidebar-area/app-sidebar'
import {
  AgentDialog,
  DialogType,
  useDialogDetails
} from '@/components/ui/agent-dialog'
import { Button } from '@/components/ui/button'
import { Sidebar } from '@/components/ui/sidebar'
import { StatusCircle } from '@/components/ui/status-circle'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { AgentState } from '@letta-ai/letta-client/api'
import { useQueryClient } from '@tanstack/react-query'
import { LoaderCircle, PlusIcon } from 'lucide-react'
import { useEffect, useMemo } from 'react'
import { SkeletonLoadBlock } from '../ui/skeleton-load-block'
import DeleteAgentConfirmation from './delete-agent-confirmation'
import EditAgentForm from './edit-agent-form'

interface SidebarAreaProps {
  canCreate: boolean
}
export function SidebarArea({ canCreate }: SidebarAreaProps) {
  const queryClient = useQueryClient()
  const { agentId, setAgentId } = useAgentContext()
  const { mutate: createAgent, isPending: isCreatingAgent } = useCreateAgent()
  const { data: runtimeInfo, isLoading: isRuntimeInfoLoading } =
    useGetRuntimeInfo()

  const { data, isLoading: isAgentsLoading } = useAgents()
  const isConnected = useIsConnected()
  const { mutate: deleteAgent } = useDeleteAgent()

  const { dialogType, closeAgentDialog } = useDialogDetails()

  const scrollSidebarToTop = () => {
    const divToScroll = document.getElementById('agents-list')
    if (divToScroll) {
      divToScroll.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const scrollSidebarToCurrentAgent = () => {
    document.getElementById(agentId)?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleCreateAgent = () => {
    if (isCreatingAgent) return
    createAgent(undefined, {
      onSuccess: (data) => {
        queryClient.setQueriesData(
          { queryKey: USE_AGENTS_KEY },
          (oldData: AgentState[]) => {
            return [data, ...oldData]
          }
        )
        setAgentId(data.id)
        scrollSidebarToTop()
      }
    })
  }

  const handleDelete = () => {
    deleteAgent(agentId, {
      onSuccess: () => {
        queryClient.setQueriesData(
          { queryKey: USE_AGENTS_KEY },
          (oldData: AgentState[]) => {
            const updatedData = [
              ...oldData.filter((agent) => agent.id !== agentId)
            ]
            if (updatedData.length > 0) {
              setAgentId(updatedData[0].id)
              scrollSidebarToTop()
            }
            return updatedData
          }
        )
        closeAgentDialog()
      }
    })
  }

  useEffect(() => {
    if (!isAgentsLoading && !data?.length && canCreate) {
      handleCreateAgent()
    }
  }, [data, isAgentsLoading, canCreate])

  const hostname = useMemo(() => {
    if (runtimeInfo?.LETTA_SERVER_URL) {
      const lettaServerHostname = new URL(runtimeInfo.LETTA_SERVER_URL).hostname
      'REMOTE SERVER'
    }

    return null
  }, [runtimeInfo])

  const isLoading = isRuntimeInfoLoading || isAgentsLoading

  return (
    <Sidebar className='mt-1'>
      <div className='flex flex-row items-center justify-between'>
        <div className='text-xs font-bold relative flex w-full min-w-0 cursor-default p-2.5 pl-4'>
          <Tooltip open={!hostname ? false : undefined}>
            <TooltipTrigger className='w-full'>
              <div
                className='flex items-center w-full'
                onClick={() => {
                  scrollSidebarToCurrentAgent()
                }}
              >
                <StatusCircle isConnected={isConnected} isLoading={isLoading} />
                {isLoading ? (
                  <SkeletonLoadBlock className='w-full h-[1.43em]' />
                ) : (
                  isConnected ? <span>Connected</span> : <span>Disconnected</span>
                )}

              </div>
            </TooltipTrigger>
          </Tooltip>
        </div>
      </div>

      {data && data.length > 0 && <AppSidebar agents={data} />}

    </Sidebar>
  )
}
