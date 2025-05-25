import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// import { v4 as uuid } from 'uuid'
// import { LETTA_UID } from '@/types'
// import { USE_COOKIE_BASED_AUTHENTICATION } from '@/constants'
// import { withAuth } from 'next-auth/middleware'

// async function cookieMiddleware(request: NextRequest) {
//   if (!USE_COOKIE_BASED_AUTHENTICATION) {
//     return NextResponse.next()
//   }
//   const response = NextResponse.next()
//   let lettaUid = request.cookies.get(LETTA_UID)?.value
//   if (!lettaUid) {
//     lettaUid = uuid()
//     response.cookies.set({
//       name: LETTA_UID,
//       value: lettaUid,
//       expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
//       sameSite: 'lax',
//       httpOnly: true,
//       secure: process.env.NODE_ENV === 'production'
//     })
//   }
//   return response
// }

// const authMiddleware = withAuth(
//   async function middleware(req) {
//     return cookieMiddleware(req)
//   },
//   {
//     callbacks: {
//       authorized: ({ token, req }) => {
//         if (req.nextUrl.pathname.startsWith('/auth')) {
//           return true // Allow access to auth pages
//         }
//         if (USE_COOKIE_BASED_AUTHENTICATION) {
//           return true // if we are using cookie based authentication, then we don't need to check for token
//         }
//         return !!token // Check if token exists for other pages
//       }
//     },
//     pages: {
//       signIn: '/auth/signin' // Redirect to custom sign-in page
//     }
//   }
// )

export function middleware(request: NextRequest) {
  console.log('Simplified Middleware triggered for:', request.nextUrl.pathname);
  return NextResponse.next(); // Just pass through
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/agents/:path*',
    '/api/composio/:path*',
    '/api/agents/:path*',
    // Ensuring all possibly relevant paths are covered for logging
    '/api/:path*',
    '/:path*' // Catch-all for observing all requests if necessary
  ]
}