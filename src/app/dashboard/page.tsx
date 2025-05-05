// src/app/dashboard/composio/page.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react' // Make sure to install lucide-react if not already installed

type App = {
    id?: string
    appId?: string
    name?: string
    description?: string
    [key: string]: any
}

export default function ComposioDashboard() {
    const [isMounted, setIsMounted] = useState(false)
    const [apiKey, setApiKey] = useState<string>('')
    const [inputKey, setInputKey] = useState<string>('')
    const [availableApps, setAvailableApps] = useState<App[]>([])
    const [integratedApps, setIntegratedApps] = useState<App[]>([])
    const [loading, setLoading] = useState({ available: false, integrated: false })
    const [error, setError] = useState<string | null>(null)
    const [isClient, setIsClient] = useState(false)
    const [integratingId, setIntegratingId] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState('')


    useEffect(() => {
        setIsClient(true)
        const storedKey = localStorage.getItem('composioApiKey')
        if (storedKey) {
            setApiKey(storedKey)
            setInputKey(storedKey)
        }
    }, [])

    const fetchApps = async (type: 'available' | 'integrated') => {
        if (!apiKey) return

        setLoading(prev => ({ ...prev, [type]: true }))
        setError(null)

        try {
            const response = await fetch('/api/composio', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-composio-key': apiKey
                },
                body: JSON.stringify({
                    action: type === 'available' ? 'listAvailableApps' : 'listIntegratedApps'
                })
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.message || `Failed to fetch ${type} apps`)
            }

            const result = await response.json()
            const items = result.items || result || []
            console.log(items[0])
            if (type === 'available') {
                setAvailableApps(items)
            } else {
                setIntegratedApps(items)
            }
        } catch (err: any) {
            console.error(`Error fetching ${type} apps:`, err)
            setError(err.message || `Failed to fetch ${type} apps`)
        } finally {
            setLoading(prev => ({ ...prev, [type]: false }))
        }
    }

    useEffect(() => {
        if (!apiKey || !isMounted) return
        fetchApps('available')
        fetchApps('integrated')
    }, [apiKey, isMounted])

    const handleSaveKey = () => {
        setApiKey(inputKey)
        localStorage.setItem('composioApiKey', inputKey)
    }

    const handleIntegrate = async (appId: string) => {
        setIntegratingId(appId)
        try {
            const response = await fetch('/api/composio', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-composio-key': apiKey
                },
                body: JSON.stringify({
                    action: 'initiateIntegration',
                    params: {
                        integrationId: appId,
                        entityId: 'default'
                    }
                })
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.message || 'Failed to initiate integration')
            }

            const result = await response.json()
            if (result.redirectUrl) {
                window.open(result.redirectUrl, '_blank')
                fetchApps('integrated')
            } else {
                throw new Error('No redirect URL returned')
            }
        } catch (err: any) {
            console.error('Integration error:', err)
            alert('Failed to initiate integration: ' + (err.message || err))
        } finally {
            setIntegratingId(null)
        }
    }

    useEffect(() => {
        setIsMounted(true)
        const storedKey = localStorage.getItem('composioApiKey')
        if (storedKey) {
            setApiKey(storedKey)
            setInputKey(storedKey)
        }
    }, [])


    const filteredApps = searchTerm.length >= 2
        ? availableApps.filter(app =>
            app.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.description?.toLowerCase().includes(searchTerm.toLowerCase())
        ).slice(0, 5)
        : []


    if (!isClient) return null
    // Return null on server and during initial client render
    if (!isMounted) {
        return null // or return a loading skeleton
    }

    return (
        <div className="flex h-full gap-8 p-8"> {/* Increased outer padding and gap */}
            {/* Main Content - Available Apps */}
            <div className="flex-1">
                <Card className="h-full">
                    <CardHeader className="pb-8"> {/* Increased bottom padding */}
                        <CardTitle className="text-2xl mb-2">Integrations</CardTitle> {/* Larger title, more space */}
                        <CardDescription className="text-base"> {/* Larger description */}
                            Connect your Lettabot agents to Composio apps
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8"> {/* Increased spacing between sections */}
                        {/* API Key Section */}
                        <div className="space-y-4"> {/* Consistent vertical spacing */}
                            <label className="block mb-2 font-medium text-base">Composio API Key</label>
                            <div className="flex gap-3"> {/* Slightly larger gap */}
                                <Input
                                    type="password"
                                    value={inputKey}
                                    onChange={e => setInputKey(e.target.value)}
                                    placeholder="Enter your Composio API key"
                                    className="h-10"
                                />
                                <Button
                                    onClick={handleSaveKey}
                                    disabled={!inputKey}
                                    className="px-6"
                                >
                                    Save
                                </Button>
                            </div>
                            {apiKey && (
                                <div className="mt-3 text-sm text-muted-foreground"> {/* Slightly larger text */}
                                    Current key: <span className="font-mono">••••••••••••••••••••••••</span>
                                </div>
                            )}
                        </div>

                        {/* Search Section */}
                        <div className="space-y-6">
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search available apps (type at least 2 characters)..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 h-10"
                                />
                            </div>
                        </div>

                        {/* Available Apps List */}
                        <div className="space-y-4"> {/* Consistent spacing */}
                            {loading.available && (
                                <div className="text-center py-4">Loading available apps...</div>
                            )}
                            {error && (
                                <div className="text-red-500 text-center py-4">{error}</div>
                            )}
                            {!loading.available && !error && (
                                <>
                                    {searchTerm.length < 2 ? (
                                        <div className="text-center py-8 text-muted-foreground">
                                            Start typing to search for apps
                                        </div>
                                    ) : (
                                        <ul className="space-y-3"> {/* Slightly more space between items */}
                                            {filteredApps.length === 0 ? (
                                                <div className="text-center py-8 text-muted-foreground">
                                                    No apps found matching your search
                                                </div>
                                            ) : (
                                                filteredApps.map((app, index) => {
                                                    const appKey = app.id || app.appId || `available-${index}`
                                                    return (
                                                        <li
                                                            key={appKey}
                                                            className="border rounded-lg p-4 flex justify-between items-center bg-card hover:bg-accent/50 transition-colors"
                                                        >
                                                            <div className="space-y-1">
                                                                <div className="font-medium">{app.name || 'Unnamed App'}</div>
                                                                <div className="text-sm text-muted-foreground">
                                                                    {app.description || 'No description available'}
                                                                </div>
                                                            </div>
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleIntegrate(app.name || "")}
                                                                disabled={integratingId === (app.id || app.appId)}
                                                                className="ml-4 px-6"
                                                            >
                                                                {integratingId === (app.id || app.appId) ? 'Integrating...' : 'Integrate'}
                                                            </Button>
                                                        </li>
                                                    )
                                                })
                                            )}
                                        </ul>
                                    )}
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>


            {/* Side Panel - Integrated Apps */}
            <div className="w-96"> {/* Slightly wider */}
                <Card className="h-full">
                    <CardHeader className="pb-6">
                        <CardTitle className="text-xl mb-2">Integrated Apps</CardTitle>
                        <CardDescription>
                            Your currently integrated Composio apps
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading.integrated && (
                            <div className="text-center py-4">Loading integrated apps...</div>
                        )}
                        {!loading.integrated && (
                            <ul className="space-y-3"> {/* Consistent spacing */}
                                {integratedApps.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        No apps integrated yet
                                    </div>
                                ) : (
                                    integratedApps.map((app, index) => {
                                        const appKey = app.id || app.appId || `integrated-${index}`
                                        return (
                                            <li
                                                key={appKey}
                                                className="border rounded-lg p-3 bg-card"
                                            >
                                                <div className="font-medium mb-1">{app.name || 'Unnamed App'}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {app.description || 'No description available'}
                                                </div>
                                            </li>
                                        )
                                    })
                                )}
                            </ul>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}