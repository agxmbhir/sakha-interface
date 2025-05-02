// src/config/letta-client.ts
import { LettaClient } from '@letta-ai/letta-client'


const LETTA_TOKEN = process.env.NEXT_PUBLIC_LETTA_TOKEN
const LETTA_BASE_URL = process.env.NEXT_PUBLIC_LETTA_BASE_URL


if (!LETTA_TOKEN) {
  throw new Error('LETTA_TOKEN is not set in environment variables')
}

if (!LETTA_BASE_URL) {
  throw new Error('LETTA_BASE_URL is not set in environment variables')
}

const client = new LettaClient({
  token: LETTA_TOKEN,
  baseUrl: LETTA_BASE_URL
})

export default client