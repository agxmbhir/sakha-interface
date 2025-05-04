'use client'

import { AgentList } from '@/components/agent-list'

export default function AgentsPage() {
    return (
        <div className="container mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold mb-8">Available Agents</h1>
            <AgentList />
        </div>
    )
}