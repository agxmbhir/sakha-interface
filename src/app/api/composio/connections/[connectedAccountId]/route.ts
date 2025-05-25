import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getComposioToolset } from '@/lib/composio';

// GET handler for status is in ./status/route.ts

export async function DELETE(
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
        // Security check: Verify the connection belongs to the user trying to delete it.
        const connection = await toolset.client.connectedAccounts.get({ connectedAccountId });
        if (connection.entityId !== session.user.uuid) {
            console.warn(`User ${session.user.uuid} attempted to delete unowned connection ${connectedAccountId}. Expected entity ${connection.entityId}.`);
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await toolset.client.connectedAccounts.delete({ connectedAccountId });
        return NextResponse.json({ message: 'Connection deleted successfully' });
    } catch (error: any) {
        console.error(`Error deleting connection ${connectedAccountId} for user ${session.user.uuid}:`, error);
        const errorMessage = error.response?.data?.detail || error.message || 'Failed to delete connection';
        return NextResponse.json({ error: errorMessage }, { status: error.response?.status || 500 });
    }
} 