import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getComposioToolset } from '@/lib/composio';
import { act } from 'react';

// Return all connections for the user

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.uuid) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const toolset = getComposioToolset();
    const userIdInMyApp = session.user.uuid;

    let entity = await toolset.getEntity(userIdInMyApp);

    const connections = await entity.getConnections();

    const activeConnections = connections.filter((connection) => connection.status === "ACTIVE");

    return NextResponse.json(activeConnections);
}