'use client'

import { SidebarProvider } from '@/components/ui/sidebar'
import { QueryClient, QueryClientProvider, isServer } from '@tanstack/react-query'
import { SessionProvider } from 'next-auth/react'

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000
      }
    }
  })
}

let browserQueryClient: QueryClient | undefined = undefined

function getQueryClient() {
  if (isServer) {
    return makeQueryClient()
  } else {
    if (!browserQueryClient) browserQueryClient = makeQueryClient()
    return browserQueryClient
  }
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient()

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <SidebarProvider>
          {children}
        </SidebarProvider>
      </QueryClientProvider>
    </SessionProvider>
  )
}