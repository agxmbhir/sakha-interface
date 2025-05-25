import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route';
import { getComposioToolset } from '@/lib/composio';
import { ConnectorListItemDTO, SingleAppInfoResDTO } from 'composio-core';

export async function GET() {
    try {
        const apiKey = process.env.COMPOSIO_API_KEY;
        // const session = await getServerSession(authOptions);
        // if (!session?.user?.uuid) {
        //     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        // }

        if (!apiKey) {
            throw new Error('Composio API key is not configured.');
        }

        const toolset = getComposioToolset();

        const integrations = await toolset.integrations.list();
        if (!integrations) {
            throw new Error('Failed to fetch integrations from Composio.');
        }

        // Fetch the app details for each availabe integration. 

        // in parallel fetch the app details for each available integration
        const appDetails = await Promise.all(integrations.items.map(async (app: ConnectorListItemDTO) => {
            return toolset.apps.get({ appKey: app.appName })
        }));

        // Add the integration id to the app details object
        const appDetailsWithIntegrationId = appDetails.map((app: SingleAppInfoResDTO, index: number) => ({
            ...app,
            integrationId: integrations.items[index].id
        }));

        console.log(appDetailsWithIntegrationId)
        const availableApps = appDetailsWithIntegrationId.map((app) => ({
            appKey: app.appId,
            appUniqueKey: app.key,
            displayName: app.name,
            integrationId: app.integrationId,
            logo: app.logo,
            description: app.description,
        }));


        return NextResponse.json(availableApps);

    } catch (error: any) {
        console.error('Error in /api/composio/available-apps:', error);
        return NextResponse.json({ error: error.message || 'Failed to fetch available apps' }, { status: 500 });
    }
} 