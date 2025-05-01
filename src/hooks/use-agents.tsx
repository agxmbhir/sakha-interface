// src/hooks/use-agents.ts
'use client'

import { useEffect, useState } from 'react'
import { Agent } from '@/types'

export function useAgents() {
    const [agents, setAgents] = useState<Agent[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchAgents() {
            try {
                const response = await fetch('/api/agents')
                if (!response.ok) throw new Error('Failed to fetch agents')
                const data = await response.json()
                setAgents(data)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch agents')
            } finally {
                setLoading(false)
            }
        }

        fetchAgents()
    }, [])

    return { agents, loading, error }
}