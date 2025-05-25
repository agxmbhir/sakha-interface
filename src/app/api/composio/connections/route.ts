import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getComposioToolset } from '@/lib/composio';

// Removed problematic GET handler for listing all connections due to SDK uncertainties.
// The frontend will need an alternative way to list connections, or this needs to be re-implemented
// once the correct Composio SDK method for listing connections per entity is clarified.
// (e.g., by storing connection IDs in the app's own user database).

// This file could contain a POST to create a "connection" in a general sense,
// but connection initiation is handled by /api/composio/connect/initiate for specific apps.

// We will add DELETE for a specific connection in a different file: src/app/api/composio/connections/[connectedAccountId]/route.ts
// This file ( connections/route.ts ) is typically for collection-level GET (list) and POST (create new if applicable).
// A general DELETE for all connections of a user could be here, but is destructive. 