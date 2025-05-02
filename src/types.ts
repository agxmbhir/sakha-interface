import { AssistantMessageContent } from '@letta-ai/letta-client/api/types'


export enum MESSAGE_TYPE {
  USER_MESSAGE = 'user_message',
  ASSISTANT_MESSAGE = 'assistant',
  TOOL_CALL = 'tool_call_message',
  TOOL_RETURN = 'tool_return_message'
}

export type AppMessage = {
  id: string
  date: number
  message: string
  messageType: MESSAGE_TYPE | string
}
export enum ROLE_TYPE {
  USER = 'user'
}

export interface Agent {
  description: any
  id: string
  name: string
  model: string
  embedding: string
  // Add other fields as needed
}

export const LETTA_UID = 'letta-uid'

export type Context<T> = { params: Promise<T> }

