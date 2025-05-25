// src/app/dashboard/composio/page.tsx
'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, AlertCircle, CheckCircle2 } from 'lucide-react'
// Removed unused Card, CardHeader, etc. from @/components/ui/card for now, will add back if used for styling
// Removed unused Input, Button from @/components/ui/input for now
// Removed unused Search from lucide-react
// Removed unused Apps, InitiateConnectionResponse from composio-core
// Removed dotenv import as process.env is directly available in Next.js client components (if .env is set up correctly)

// Define the structure for an available app from Composio
interface ComposioApp {
    appKey: string;
    displayName: string;
    logo?: string;
    description?: string;
}

interface UserConnection {
    id: string;                 // Composio Connected Account ID
    appName: string;            // Name of the app (e.g., "GitHub", "Slack") - crucial for display
    status: string;             // e.g., "ACTIVE", "INACTIVE"
    createdAt?: string;
    integrationId?: string;    // Helpful for debugging or mapping
}

export default function DashboardPage() {
    // const [isMounted, setIsMounted] = useState(false); // Not strictly needed for the current logic
    // const [isClient, setIsClient] = useState(false); // Not strictly needed

    // State for the new integrations UI
    const [connectedApps, setConnectedApps] = useState<UserConnection[]>([]);
    const [allComposioApps, setAllComposioApps] = useState<ComposioApp[]>([]);
    const [isLoadingConnections, setIsLoadingConnections] = useState(true);
    const [isLoadingAvailableApps, setIsLoadingAvailableApps] = useState(true);
    const [isConnecting, setIsConnecting] = useState<string | null>(null);
    const [isDisconnecting, setIsDisconnecting] = useState<string | null>(null);
    const [uiMessage, setUiMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [searchTerm, setSearchTerm] = useState(''); // State for search

    // useEffect(() => {
    //     setIsClient(true);
    //     setIsMounted(true);
    // }, []);

    const fetchConnectedApplications = useCallback(async () => {
        setIsLoadingConnections(true);
        try {
            const response = await fetch('/api/composio/connections');
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Failed to load connected apps' }));
                throw new Error(errorData.error || `Server error: ${response.status}`);
            }
            const data: UserConnection[] = await response.json();
            setConnectedApps(data);
        } catch (error: any) {
            setUiMessage({ type: 'error', text: `Error fetching connected apps: ${error.message}` });
            setConnectedApps([]);
        } finally {
            setIsLoadingConnections(false);
        }
    }, []);

    const fetchAllComposioApps = useCallback(async () => {
        setIsLoadingAvailableApps(true);
        try {
            const response = await fetch('/api/composio/available-apps');
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Failed to load available integrations' }));
                throw new Error(errorData.error || `Server error: ${response.status}`);
            }
            const data: ComposioApp[] = await response.json();
            setAllComposioApps(data);
        } catch (error: any) {
            setUiMessage({ type: 'error', text: `Error fetching available integrations: ${error.message}` });
            setAllComposioApps([]);
        } finally {
            setIsLoadingAvailableApps(false);
        }
    }, []);

    useEffect(() => {
        fetchConnectedApplications();
        fetchAllComposioApps();

        const queryParams = new URLSearchParams(window.location.search);
        if (queryParams.get('composio_connection_status') === 'success') {
            setUiMessage({ type: 'success', text: `Successfully connected ${queryParams.get('app_display_name') || queryParams.get('app') || 'app'}!` });
            window.history.replaceState(null, '', window.location.pathname);
        } else if (queryParams.get('composio_connection_status') === 'error') {
            setUiMessage({ type: 'error', text: `Failed to connect ${queryParams.get('app_display_name') || queryParams.get('app') || 'app'}: ${queryParams.get('message') || 'Unknown error'}` });
            window.history.replaceState(null, '', window.location.pathname);
        }
    }, [fetchConnectedApplications, fetchAllComposioApps]); // Removed isMounted and fetchApps from dependencies

    const handleConnect = async (appKey: string, displayName: string) => {
        if (isConnecting) return;
        setIsConnecting(appKey);
        setUiMessage(null);
        try {
            const response = await fetch('/api/composio/connect/initiate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ appName: appKey }),
            });
            const data = await response.json();

            if (!response.ok || data.error) {
                throw new Error(data.error || `Failed to initiate connection for ${displayName}.`);
            }

            if (data.redirectUrl) {
                const redirectUrl = new URL(data.redirectUrl);
                const callbackUrl = new URL(redirectUrl.searchParams.get('redirect_url') || window.location.href);
                callbackUrl.searchParams.set('app_display_name', displayName);
                redirectUrl.searchParams.set('redirect_url', callbackUrl.toString());
                window.location.href = redirectUrl.toString();
            } else if (data.status === 'CONNECTED' || data.message?.includes('already connected')) {
                setUiMessage({ type: 'success', text: `${displayName} connected successfully!` });
                fetchConnectedApplications();
                fetchAllComposioApps();
            } else {
                setUiMessage({ type: 'success', text: `Connection process for ${displayName} initiated. Status: ${data.status}` });
                setTimeout(() => {
                    fetchConnectedApplications();
                    fetchAllComposioApps();
                }, 3000);
            }
        } catch (error: any) {
            setUiMessage({ type: 'error', text: error.message });
        } finally {
            setIsConnecting(null);
        }
    };

    const handleDisconnect = async (connectionId: string, appName: string) => {
        if (isDisconnecting) return;
        if (!confirm(`Are you sure you want to disconnect ${appName}?`)) return;

        setIsDisconnecting(connectionId);
        setUiMessage(null);
        try {
            const response = await fetch(`/api/composio/connections/${connectionId}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: `Failed to disconnect ${appName}.` }));
                throw new Error(errorData.error || `Failed to disconnect ${appName}.`);
            }
            setUiMessage({ type: 'success', text: `${appName} disconnected successfully.` });
            fetchConnectedApplications();
            fetchAllComposioApps();
        } catch (error: any) {
            setUiMessage({ type: 'error', text: error.message });
        } finally {
            setIsDisconnecting(null);
        }
    };

    const filteredAvailableApps = allComposioApps.filter(app => {
        const searchTermLower = searchTerm.toLowerCase();
        const isNotConnected = !connectedApps.some(conn => conn.appName?.toLowerCase() === app.appKey.toLowerCase() && conn.status === 'ACTIVE');
        const matchesSearch = searchTermLower === '' ? true :
            (app.displayName.toLowerCase().includes(searchTermLower) ||
                (app.description && app.description.toLowerCase().includes(searchTermLower)));
        return isNotConnected && matchesSearch;
    });

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold mb-8 text-gray-800">Integrations Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="flex flex-col h-[calc(100vh-150px)]"> {/* Adjust height as needed */}
                    <CardHeader>
                        <CardTitle className="text-xl">Available Integrations</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col flex-grow">
                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input
                                type="text"
                                placeholder="Search available apps..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <div className="overflow-y-auto flex-grow pr-2 space-y-3">
                            {isLoadingAvailableApps ? (
                                <p className="text-gray-500 text-center py-4">Loading available integrations...</p>
                            ) : filteredAvailableApps.length === 0 && allComposioApps.length > 0 && searchTerm === '' ? (
                                <p className="text-gray-500 text-center py-4">All available apps are connected.</p>
                            ) : filteredAvailableApps.length === 0 && searchTerm !== '' ? (
                                <p className="text-gray-500 text-center py-4">No apps found matching "{searchTerm}".</p>
                            ) : filteredAvailableApps.length === 0 && allComposioApps.length === 0 ? (
                                <p className="text-gray-500 text-center py-4">No integrations currently available.</p>
                            ) : (
                                <ul className="space-y-3">
                                    {filteredAvailableApps.map(app => (
                                        <li
                                            key={app.appKey}
                                            className="p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow flex items-center justify-between"
                                        >
                                            <div className="flex items-center overflow-hidden mr-2">
                                                {app.logo && <img src={app.logo} alt={`${app.displayName} logo`} className="w-9 h-9 mr-4 rounded-md flex-shrink-0" />}
                                                <div className="overflow-hidden">
                                                    <p className="font-semibold text-gray-700 truncate">{app.displayName}</p>
                                                    {app.description && <p className="text-sm text-gray-500 truncate">{app.description}</p>}
                                                </div>
                                            </div>
                                            <Button
                                                onClick={() => handleConnect(app.appKey, app.displayName)}
                                                disabled={isConnecting === app.appKey}
                                                size="sm"
                                            >
                                                {isConnecting === app.appKey ? 'Connecting...' : 'Connect'}
                                            </Button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="flex flex-col h-[calc(100vh-150px)]"> {/* Adjust height as needed */}
                    <CardHeader>
                        <CardTitle className="text-xl">Your Connected Apps</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col flex-grow">
                        <div className="overflow-y-auto flex-grow pr-2 space-y-3">
                            {isLoadingConnections ? (
                                <p className="text-gray-500 text-center py-4">Loading your connections...</p>
                            ) : connectedApps.length === 0 ? (
                                <p className="text-gray-500 text-center py-4">No apps connected yet.</p>
                            ) : (
                                <ul className="space-y-3">
                                    {connectedApps.map(conn => {
                                        const appDetails = allComposioApps.find(a => a.appKey.toLowerCase() === conn.appName?.toLowerCase());
                                        return (
                                            <li
                                                key={conn.id}
                                                className={`p-4 border rounded-lg shadow-sm flex items-center justify-between ${conn.status === 'ACTIVE' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}
                                            >
                                                <div className="flex items-center overflow-hidden mr-2">
                                                    {appDetails?.logo && <img src={appDetails.logo} alt={`${conn.appName} logo`} className="w-9 h-9 mr-4 rounded-md flex-shrink-0" />}
                                                    <div className="overflow-hidden">
                                                        <p className="font-semibold text-gray-700 truncate">{conn.appName || 'Unknown App'}</p>
                                                        <p className={`text-sm font-medium truncate ${conn.status === 'ACTIVE' ? 'text-green-600' : 'text-red-600'}`}>Status: {conn.status}</p>
                                                    </div>
                                                </div>
                                                {conn.status === 'ACTIVE' && (
                                                    <Button
                                                        onClick={() => handleDisconnect(conn.id, conn.appName || 'this app')}
                                                        disabled={isDisconnecting === conn.id}
                                                        variant="destructive"
                                                        size="sm"
                                                    >
                                                        {isDisconnecting === conn.id ? 'Disconnecting...' : 'Disconnect'}
                                                    </Button>
                                                )}
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {uiMessage && (
                <div className={`fixed bottom-5 left-1/2 -translate-x-1/2 p-4 rounded-md shadow-lg text-white flex items-center justify-between min-w-[300px] max-w-md z-50 ${uiMessage.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
                    {uiMessage.type === 'success' ? <CheckCircle2 className="mr-2" /> : <AlertCircle className="mr-2" />}
                    <span>{uiMessage.text}</span>
                    <button onClick={() => setUiMessage(null)} className="ml-4 text-xl font-semibold hover:text-gray-200">&times;</button>
                </div>
            )}
        </div>
    );
}