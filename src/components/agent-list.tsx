// src/components/agent-list.tsx
'use client'

import { useAgents } from '@/hooks/use-agents'
import Link from 'next/link'
import { Card } from '@/components/ui/card'

export function AgentList() {
    const { agents, loading, error } = useAgents()

    if (loading) {
        return <div className="flex items-center justify-center p-8">Loading agents...</div>
    }

    if (error) {
        return <div className="p-4 text-red-500">Error: {error}</div>
    }

    if (agents.length === 0) {
        return <div className="p-4 text-gray-500">No agents available</div>
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {agents.map((agent) => (
                <Card
                    key={agent.id}
                    className="p-6 hover:shadow-lg transition-shadow"
                >
                    <Link
                        href={`/${encodeURIComponent(agent.id)}`}
                        className="block"
                    >
                        <h2 className="text-xl font-semibold mb-2">{agent.name || 'Unnamed Agent'}</h2>
                        {agent.description && (
                            <p className="text-sm text-gray-600">{agent.description}</p>
                        )}
                    </Link>
                </Card>
            ))}
        </div>
    )
}