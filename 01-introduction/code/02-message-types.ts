/**
 * Message Types
 * Run: npx tsx 01-introduction/code/02-message-types.ts
 *
 * 🤖 Try asking GitHub Copilot Chat (https://github.com/features/copilot):
 * - "What's the difference between SystemMessage and HumanMessage?"
 * - "How would I add an AIMessage to continue this conversation?"
 */

import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "langchain";
import "dotenv/config";

async function main() {
  console.log("🎭 Understanding Message Types\n");

  const model = new ChatOpenAI({
    model: process.env.AI_MODEL,
    configuration: { baseURL: process.env.AI_ENDPOINT },
    apiKey: process.env.AI_API_KEY,
  });

  // Using structured messages for better control
  const messages = [
    new SystemMessage("You are a helpful AI assistant who explains things simply."),
    new HumanMessage("Explain quantum computing to a 10-year-old."),
  ];

  const response = await model.invoke(messages);

  console.log("🤖 AI Response:\n");
  console.log(response.content);
  console.log("\n✅ Notice how the SystemMessage influenced the response style!");
}

main().catch(console.error);
