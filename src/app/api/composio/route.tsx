// src/app/api/composio/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { OpenAIToolSet, InitiateConnectionDataReq } from 'composio-core'


export type IntegrationParams = {
    appName: string,
    entityId: 'default'
}
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
            case 'listIntegratedApps':
                result = await toolset.integrations.list()
                break
            case 'getRequiredParams':
                result = await toolset.integrations.getRequiredParams(params.integrationId)
                break
            case 'initiateIntegration':
                result = await toolset.connectedAccounts.initiate(params as IntegrationParams)
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