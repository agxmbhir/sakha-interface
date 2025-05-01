
import { ChatHeader } from '@/components/chat-header'

export default function ChatLayout({
    children
}: {
    children: React.ReactNode
}) {
    return (
        <div className='flex flex-col h-screen'>
            <div className='flex border-b border-border p-2.5 gap-3 w-full'>
                <ChatHeader />
            </div>
            {children}
        </div>
    )
}