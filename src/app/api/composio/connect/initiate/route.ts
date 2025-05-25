import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route'; // Adjusted path if necessary
import { getComposioToolset } from '@/lib/composio';
import { Apps } from 'composio-core';

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.uuid) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let appNameString: string;
    try {
        const body = await req.json();
        appNameString = body.appName;
    } catch (e) {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    if (!appNameString || typeof appNameString !== 'string' || !Apps[appNameString.toUpperCase() as keyof typeof Apps]) {
        return NextResponse.json({ error: 'Invalid or missing appName provided. Ensure it matches Composio App enum keys (e.g., GITHUB, SLACK).' }, { status: 400 });
    }
    const appToConnectEnumKey = appNameString.toUpperCase() as keyof typeof Apps;

    const toolset = getComposioToolset();
    const userIdInMyApp = session.user.uuid;

    try {
        const entity = await toolset.getEntity(userIdInMyApp);
        console.log(`Initiating ${appNameString} connection for entity: ${entity.id}`);
        console.log('appToConnectEnumKey', appToConnectEnumKey)
        console.log('entity', entity)
        const connectionRequest = await entity.initiateConnection({
            appName: appToConnectEnumKey,
        });

        if (connectionRequest?.redirectUrl) {
            return NextResponse.json({
                redirectUrl: connectionRequest.redirectUrl,
                connectedAccountIdInProgress: connectionRequest.connectedAccountId
            });
        } else if (connectionRequest?.connectedAccountId) {
            await new Promise(resolve => setTimeout(resolve, 1500)); // Small delay for non-oauth
            const activeConnection = await toolset.client.connectedAccounts.get({
                connectedAccountId: connectionRequest.connectedAccountId
            });
            if (activeConnection.status === "ACTIVE") {
                return NextResponse.json({
                    status: 'CONNECTED',
                    connectedAccountId: connectionRequest.connectedAccountId,
                    appName: appNameString
                });
            } else {
                return NextResponse.json({ error: `Connection initiated but not active: ${activeConnection.status}` }, { status: 202 });
            }
        } else {
            return NextResponse.json({ error: 'Failed to initiate connection properly (no redirectUrl or connectedAccountId).' }, { status: 500 });
        }
    } catch (error: any) {
        console.error(`Error initiating ${appNameString} connection for ${userIdInMyApp}:`, error);
        const errorMessage = error.response?.data?.detail || error.message || 'Failed to initiate connection';
        return NextResponse.json({ error: errorMessage }, { status: error.response?.status || 500 });
    }
} 