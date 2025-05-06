'use client'

import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

export default function SignIn() {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <Card className="w-[400px]">
                <CardHeader>
                    <CardTitle>Welcome to Sakha</CardTitle>
                    <CardDescription>
                        Sign in to access your agents
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button
                        onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
                        className="w-full"
                    >
                        Sign in with Google
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}