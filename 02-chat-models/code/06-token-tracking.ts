/**
 * Token Usage Tracking Example
 * Run: npx tsx 02-chat-models/code/06-token-tracking.ts
 *
 * 🤖 Try asking GitHub Copilot Chat (https://github.com/features/copilot):
 * - "How can I track token usage across multiple API calls in a conversation?"
 * - "How would I calculate the cost based on token usage?"
 */

import { ChatOpenAI } from "@langchain/openai";
import "dotenv/config";

async function trackTokenUsage() {
  const model = new ChatOpenAI({
    model: process.env.AI_MODEL,
    configuration: { baseURL: process.env.AI_ENDPOINT },
    apiKey: process.env.AI_API_KEY,
  });

  console.log("📊 Token Usage Tracking Example\n");

  // Make a request
  const response = await model.invoke("Explain what TypeScript is in 2 sentences.");

  // Extract token usage from metadata (v1 uses usage_metadata)
  const usage = response.usage_metadata;

  if (usage) {
    console.log("Token Breakdown:");
    console.log(`  Prompt tokens:     ${usage.input_tokens}`);
    console.log(`  Completion tokens: ${usage.output_tokens}`);
    console.log(`  Total tokens:      ${usage.total_tokens}`);
  } else {
    console.log("⚠️  Token usage information not available in response metadata.");
  }

  console.log("\n📝 Response:");
  console.log(response.content);
}

trackTokenUsage().catch(console.error);
