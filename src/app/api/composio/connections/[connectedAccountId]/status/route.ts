import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getComposioToolset } from '@/lib/composio';

export async function GET(
    req: NextRequest,
    { params }: { params: { connectedAccountId: string } }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.uuid) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { connectedAccountId } = params;
    if (!connectedAccountId) {
        return NextResponse.json({ error: 'Connected Account ID required' }, { status: 400 });
    }

    const toolset = getComposioToolset();

    try {
        const connection = await toolset.client.connectedAccounts.get({ connectedAccountId });

        // Security check: Ensure the fetched connection belongs to the logged-in user's entity
        // This assumes entityId in Composio is your app's session.user.uuid
        if (connection.entityId !== session.user.uuid) {
            console.warn(`User ${session.user.uuid} attempted to access unowned connection ${connectedAccountId}. Expected entity ${connection.entityId}.`);
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        return NextResponse.json({
            id: connection.id,
            status: connection.status,
            integrationId: connection.integrationId,
            entityId: connection.entityId,
            createdAt: connection.createdAt,
            // Add any other fields from 'connection' object you want to return
        });
    } catch (error: any) {
        console.error(`Error fetching status for connection ${connectedAccountId}:`, error);
        const errorMessage = error.response?.data?.detail || error.message || 'Failed to fetch connection status';
        return NextResponse.json({ error: errorMessage }, { status: error.response?.status || 500 });
    }
} 