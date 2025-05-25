import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { MessagePill } from '@/components/ui/message'
import { useAgentContext } from '../../app/agents/[agentId]/context/agent-context'
import { useAgentMessages } from '../hooks/use-agent-messages'
import { Ellipsis, LoaderCircle } from 'lucide-react'
import { MessagePopover } from './message-popover'
import { DEFAULT_BOT_MESSAGE, ERROR_CONNECTING } from '@/app/lib/labels'
import { useIsConnected } from '../hooks/use-is-connected'
import { useAgents } from '../hooks/use-agents'
import { UseSendMessageType } from '@/components/hooks/use-send-message'
import { MESSAGE_TYPE, AppMessage } from '@/types'
import { ReasoningMessageBlock } from '@/components/ui/reasoning-message'
import { AssistantMessageContent } from '@letta-ai/letta-client/api/types'
import { extractMessageText } from '@/lib/utils'
import InfiniteScroll from 'react-infinite-scroll-component';

const INITIAL_MESSAGE_COUNT = 20;
const MESSAGE_LOAD_BATCH_SIZE = 10;
const SCROLLABLE_CONTAINER_ID = 'scrollableChatArea';

interface MessagesProps {
  isSendingMessage: boolean
  sendMessage: (options: UseSendMessageType) => void
}

export const Messages = (props: MessagesProps) => {
  const { isSendingMessage, sendMessage } = props
  const { agentId } = useAgentContext()
  const {
    data: allMessagesData,
    isLoading,
    isError,
  } = useAgentMessages(agentId)
  const { data: agents } = useAgents()

  const allMessagesChronological: AppMessage[] = useMemo(() => allMessagesData || [], [allMessagesData]);
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const isConnected = useIsConnected()
  const mounted = useRef(false)
  const [displayedMessages, setDisplayedMessages] = useState<AppMessage[]>([])
  const [hasMoreOlder, setHasMoreOlder] = useState(true);



  useEffect(() => {
    const initialMsgCount = Math.min(allMessagesChronological.length, INITIAL_MESSAGE_COUNT);
    setDisplayedMessages(allMessagesChronological.slice(allMessagesChronological.length - initialMsgCount));
    setHasMoreOlder(allMessagesChronological.length > initialMsgCount);
  }, [allMessagesChronological]);

  const loadOlderMessages = useCallback(() => {
    const currentOldestMessageInDisplayId = displayedMessages.length > 0 ? displayedMessages[0]?.id : null;

    let indexOfOldestDisplayedInFullList = -1;
    if (currentOldestMessageInDisplayId) {
      indexOfOldestDisplayedInFullList = allMessagesChronological.findIndex(msg => msg.id === currentOldestMessageInDisplayId);
    } else {
      indexOfOldestDisplayedInFullList = allMessagesChronological.length;
    }

    if (indexOfOldestDisplayedInFullList === -1 && currentOldestMessageInDisplayId) {
      setHasMoreOlder(false);
      return;
    }

    const numberToLoad = MESSAGE_LOAD_BATCH_SIZE;
    const startIndexForOlderBatch = Math.max(0, indexOfOldestDisplayedInFullList - numberToLoad);
    const olderMessagesToPrepend = allMessagesChronological.slice(startIndexForOlderBatch, indexOfOldestDisplayedInFullList);

    if (olderMessagesToPrepend.length === 0) {
      setHasMoreOlder(false);
      return;
    }

    setDisplayedMessages(prevDisplayed => [...olderMessagesToPrepend, ...prevDisplayed]);
    setHasMoreOlder(startIndexForOlderBatch > 0);

  }, [allMessagesChronological, displayedMessages]);

  useEffect(() => {
    if (messagesEndRef.current) {
      if (isSendingMessage || (!mounted.current && displayedMessages.length > 0)) {
        messagesEndRef.current.scrollIntoView({ behavior: "auto" });
      }
    }
    if (displayedMessages.length > 0 && !mounted.current) {
      mounted.current = true;
    }
  }, [displayedMessages, isSendingMessage]);

  const showPopover = useMemo(() => {
    return allMessagesChronological.length === 3 && allMessagesChronological[0]?.message === DEFAULT_BOT_MESSAGE
  }, [allMessagesChronological]);

  if (isLoading && !allMessagesData) {
    return (
      <div className='flex flex-1 justify-center items-center h-full'>
        <LoaderCircle className='animate-spin' size={32} />
      </div>
    )
  }

  if (isError && !allMessagesData) {
    return (
      <div className='flex flex-1 justify-center items-center h-full text-red-500'>
        Error loading messages.
      </div>
    )
  }

  const displayDefaultOrError = !isLoading && !allMessagesData && allMessagesChronological.length === 0;

  return (
    <div id={SCROLLABLE_CONTAINER_ID} className='flex-1 overflow-y-auto flex flex-col'>
      <div className='group/message mx-auto w-full max-w-3xl px-4 flex-1 flex flex-col justify-end'>
        {displayedMessages.length > 0 ? (
          showPopover ? (
            <MessagePopover sendMessage={sendMessage} key={allMessagesChronological[0]?.id || 'popover-initial'} />
          ) : (
            <InfiniteScroll
              dataLength={displayedMessages.length}
              next={loadOlderMessages}
              style={{ display: 'flex', flexDirection: 'column-reverse' }}
              inverse={true}
              hasMore={hasMoreOlder}
              loader={<div className='flex justify-center py-2'><LoaderCircle className='animate-spin' size={20} /></div>}
              scrollableTarget={SCROLLABLE_CONTAINER_ID}
              endMessage={
                <p style={{ textAlign: 'center', padding: '10px' }}>
                  <b>Yay! You have seen it all</b>
                </p>
              }
            >
              <div className='flex min-w-0 flex-1 flex-col gap-6 pt-4 pb-4 scrollable-div'>
                {displayedMessages.map((message: AppMessage) => {
                  if (!message || !message.id) return null
                  if ([MESSAGE_TYPE.TOOL_CALL, MESSAGE_TYPE.TOOL_RETURN].includes(message.messageType as MESSAGE_TYPE)) {
                    return (
                      <ReasoningMessageBlock
                        key={message.id}
                        message={extractMessageText(message.message as AssistantMessageContent)}
                        isEnabled={true}
                      />
                    )
                  } else {
                    return (
                      <MessagePill
                        key={message.id}
                        message={extractMessageText(message.message as AssistantMessageContent)}
                        sender={message.messageType as any}
                      />
                    )
                  }
                })}
                {isSendingMessage && (
                  <div className='flex items-center justify-start pl-2 text-sm text-muted-foreground mt-4'>
                    <Ellipsis size={20} className='animate-pulse mr-2' /> thinking...
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </InfiniteScroll>
          )
        ) : displayDefaultOrError ? (
          <div className='flex min-w-0 flex-1 flex-col justify-center items-center h-full'>
            {isConnected && agents && agents.length === 0 ? ERROR_CONNECTING : (isError ? 'Failed to load messages.' : 'No messages yet.')}
          </div>
        ) : null}
      </div>
    </div>
  )
}