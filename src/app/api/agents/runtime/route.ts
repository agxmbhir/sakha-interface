import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    LETTA_SERVER_URL: process.env.NEXT_PUBLIC_LETTA_BASE_URL,
    LETTA_ACCESS_TOKEN: process.env.NEXT_PUBLIC_LETTA_TOKEN
  })
}