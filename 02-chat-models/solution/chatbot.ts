/**
 * Challenge 1 Solution: Interactive Chatbot
 * Run: npx tsx 02-chat-models/solution/chatbot.ts
 */

import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, AIMessage, SystemMessage } from "langchain";
import readline from "readline";
import "dotenv/config";

const model = new ChatOpenAI({
  model: process.env.AI_MODEL,
  configuration: { baseURL: process.env.AI_ENDPOINT },
  apiKey: process.env.AI_API_KEY,
});

const messages: (SystemMessage | HumanMessage | AIMessage)[] = [
  new SystemMessage(
    "You are a friendly and helpful AI assistant. Be conversational and warm in your responses."
  ),
];

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function chat() {
  rl.question("\nYou: ", async (input) => {
    if (input.toLowerCase() === "quit" || input.toLowerCase() === "exit") {
      console.log(`\n👋 Goodbye! We had ${messages.length} messages in our conversation.`);
      rl.close();
      return;
    }

    if (!input.trim()) {
      chat();
      return;
    }

    messages.push(new HumanMessage(input));

    try {
      const response = await model.invoke(messages);
      console.log(`\n🤖 Chatbot: ${response.content}`);

      messages.push(new AIMessage(String(response.content)));
      console.log(`📊 Conversation length: ${messages.length} messages`);

      // Exit in CI mode after one interaction
      if (process.env.CI === "true") {
        rl.close();
        return;
      }

      chat();
    } catch (error: any) {
      console.error("\n❌ Error:", error.message);
      chat();
    }
  });
}

console.log("🤖 Chatbot: Hello! I'm your helpful assistant. Ask me anything!");
console.log('(Type "quit" to exit)\n');

chat();
