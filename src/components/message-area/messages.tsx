import { useEffect, useMemo, useRef, useState } from 'react'
import { MessagePill } from '@/components/ui/message'
import { useAgentContext } from '../../app/agents/[agentId]/context/agent-context'
import { useAgentMessages } from '../hooks/use-agent-messages'
import { Ellipsis, LoaderCircle } from 'lucide-react'
import { MessagePopover } from './message-popover'
import { DEFAULT_BOT_MESSAGE, ERROR_CONNECTING } from '@/app/lib/labels'
import { useIsConnected } from '../hooks/use-is-connected'
import { useAgents } from '../hooks/use-agents'
import { UseSendMessageType } from '@/components/hooks/use-send-message'
import { MESSAGE_TYPE } from '@/types'
import { ReasoningMessageBlock } from '@/components/ui/reasoning-message'
import { extractMessageText } from '@/lib/utils'

interface MessagesProps {
  isSendingMessage: boolean
  sendMessage: (options: UseSendMessageType) => void
}

export const Messages = (props: MessagesProps) => {
  const { isSendingMessage, sendMessage } = props
  const { agentId } = useAgentContext()
  const { data: messages, isLoading } = useAgentMessages(agentId)
  const { data: agents } = useAgents()
  const containerRef = useRef<HTMLDivElement>(null)
  const isConnected = useIsConnected()

  // Add mounted state to prevent hydration mismatch
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const scrollToBottom = () => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }

  // Only run scroll effects after component is mounted
  useEffect(() => {
    if (mounted && messages && messages.length > 0) {
      scrollToBottom()
    }
  }, [messages?.length, mounted])

  useEffect(() => {
    if (mounted && isSendingMessage) {
      scrollToBottom()
    }
  }, [isSendingMessage, mounted])

  const showPopover = useMemo(() => {
    if (!messages) return false
    return messages.length === 3 && messages[0].message === DEFAULT_BOT_MESSAGE
  }, [messages])

  // Return a loading state during SSR and initial mount
  if (!mounted) {
    return (
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-3xl px-4 py-4">
            <div className="flex justify-center">
              <LoaderCircle className="animate-spin" size={32} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto scroll-smooth"
      >
        <div className="mx-auto w-full max-w-3xl px-4 py-4">
          {messages ? (
            showPopover ? (
              <MessagePopover sendMessage={sendMessage} key={messages[0].id} />
            ) : (
              <div className="flex flex-col gap-6">
                {messages.map((message) => {
                  if ([MESSAGE_TYPE.REASONING_MESSAGE, MESSAGE_TYPE.TOOL_CALL_MESSAGE].includes(message.messageType)) {
                    return (
                      <ReasoningMessageBlock
                        key={message.id}
                        message={extractMessageText(message.message)}
                        isEnabled={true}
                      />
                    )
                  } else {
                    return (
                      <MessagePill
                        key={message.id}
                        message={extractMessageText(message.message)}
                        sender={message.messageType}
                      />
                    )
                  }
                })}
                {isSendingMessage && (
                  <div className="flex justify-start">
                    <Ellipsis size={24} className="animate-pulse" />
                  </div>
                )}
              </div>
            )
          ) : (
            <div className="flex flex-col justify-center items-center h-full min-h-[200px]">
              {isLoading || (isConnected && agents && agents.length === 0) ? (
                <LoaderCircle className="animate-spin" size={32} />
              ) : (
                ERROR_CONNECTING
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}