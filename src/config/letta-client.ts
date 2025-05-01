// src/config/letta-client.ts
import { LettaClient } from '@letta-ai/letta-client'
import { config } from 'dotenv'

config()

const LETTA_TOKEN = process.env.LETTA_TOKEN
const LETTA_BASE_URL = process.env.LETTA_BASE_URL

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