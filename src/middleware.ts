import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { v4 as uuid } from 'uuid'
import { LETTA_UID } from '@/types'
import { USE_COOKIE_BASED_AUTHENTICATION } from '@/constants'
import { withAuth } from 'next-auth/middleware'

// Create a middleware handler that combines both cookie and NextAuth
async function cookieMiddleware(request: NextRequest) {
  if (!USE_COOKIE_BASED_AUTHENTICATION) {
    // do nothing if we're not using cookie based authentication
    return NextResponse.next()
  }

  const response = NextResponse.next()
  let lettaUid = request.cookies.get(LETTA_UID)?.value

  if (!lettaUid) {
    lettaUid = uuid()
    response.cookies.set({
      name: LETTA_UID,
      value: lettaUid,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      sameSite: 'lax',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production'
    })
  }
  return response
}

// Combine NextAuth with cookie middleware
const authMiddleware = withAuth(
  async function middleware(req) {
    // First run the cookie middleware
    const cookieResponse = await cookieMiddleware(req)
    return cookieResponse
  },
  {
    pages: {
      signIn: '/auth/signin',
    },
  }
)

export default authMiddleware

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/agents/:path*',
    '/api/composio/:path*',
    '/api/agents/:path*',
  ]
}