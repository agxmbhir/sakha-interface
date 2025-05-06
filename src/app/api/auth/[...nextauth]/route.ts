import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { NextAuthOptions } from 'next-auth'
import crypto from 'crypto'

// Function to generate deterministic UUID from email
function generateUserUUID(email: string): string {
    if (!email) return '' // Add safety check
    const hash = crypto.createHash('sha256').update(email).digest('hex')
    return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-${hash.slice(12, 16)}-${hash.slice(16, 20)}-${hash.slice(20, 32)}`
}

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    callbacks: {
        jwt: async ({ token, user }) => {
            if (token.email) {
                // Generate deterministic UUID from email
                token.uuid = generateUserUUID(token.email as string)
            }
            return token
        },
        session: async ({ session, token }) => {
            if (session?.user) {
                // We always have email with Google auth
                session.user.uuid = generateUserUUID(session.user.email!)
            }
            return session
        }
    }
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }