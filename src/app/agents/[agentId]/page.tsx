'use client'

import { Messages } from '@/components/message-area/messages'
import { MessageComposer } from '@/components/message-area/message-composer'
import { useAgentDetails } from '@/components/ui/agent-details'
import { useIsMobile } from '@/components/hooks/use-mobile'
import { useSendMessage } from '@/components/hooks/use-send-message'

export default function Home() {
    const { isOpen } = useAgentDetails()
    const isMobile = useIsMobile()
    const { isPending, mutate: sendMessage } = useSendMessage()

    return (
        <div className='flex h-[calc(100vh-4rem)] overflow-hidden'>
            {!isMobile || (isMobile && !isOpen) ? (
                <div className='flex flex-col w-full h-full'>
                    <div className='flex-1 overflow-hidden relative'>
                        <Messages
                            sendMessage={sendMessage}
                            isSendingMessage={isPending}
                        />
                    </div>
                    <div className='flex-shrink-0'>
                        <MessageComposer
                            sendMessage={sendMessage}
                            isSendingMessage={isPending}
                        />
                    </div>
                </div>
            ) : null}
        </div>
    )
}