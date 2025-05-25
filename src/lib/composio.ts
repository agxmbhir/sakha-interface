import { OpenAIToolSet } from "composio-core";
import dotenv from "dotenv";

dotenv.config(); // Ensure API key is loaded

let toolsetInstance: OpenAIToolSet | null = null;

export function getComposioToolset(): OpenAIToolSet {
    if (!toolsetInstance) {
        if (!process.env.COMPOSIO_API_KEY) {
            throw new Error("COMPOSIO_API_KEY is not set in environment variables.");
        }
        toolsetInstance = new OpenAIToolSet({ apiKey: process.env.COMPOSIO_API_KEY });
    }
    return toolsetInstance;
} 