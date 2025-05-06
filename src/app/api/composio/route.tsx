import { NextRequest, NextResponse } from 'next/server'
import { OpenAIToolSet } from 'composio-core'


export async function POST(req: NextRequest) {
    try {
        const { action, params } = await req.json()
        const apiKey = req.headers.get('x-composio-key')

        if (!apiKey) {
            return NextResponse.json(
                { error: 'API key is required' },
                { status: 401 }
            )
        }

        const toolset = new OpenAIToolSet({ apiKey })

        let result
        switch (action) {
            case 'listAvailableApps':
                result = await toolset.apps.list()
                break
            case 'listIntegrations':
                result = await toolset.integrations.list()
                break
            case 'getOrCreateIntegration':
                // First try to find existing integration for this app
                const newIntegration = await toolset.integrations.create({
                    appUniqueKey: params.appUniqueKey,
                    name: params.name,
                    useComposioAuth: true
                })
                result = { integrationId: newIntegration.id }
                break
            case 'initiateConnection':
                // Get entity for the user
                const entity = await toolset.getEntity(params.entityId || 'default')
                // Initiate connection using appName
                result = await entity.initiateConnection({
                    appName: params.integrationId
                })
                break
            case 'checkConnection':
                // Check connection status
                result = await toolset.connectedAccounts.get({
                    connectedAccountId: params.connectedAccountId
                })
                break
            default:
                return NextResponse.json(
                    { error: 'Invalid action' },
                    { status: 400 }
                )
        }

        return NextResponse.json(result)
    } catch (error: any) {
        console.error('Composio API Error:', error)
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        )
    }
}