/**
 * Challenge 2 Solution: Streaming Chat Interface
 * Run: npx tsx 02-chat-models/samples/streaming-chat.ts
 */

import { ChatOpenAI } from "@langchain/openai";
import readline from "readline";
import "dotenv/config";

const model = new ChatOpenAI({
  model: process.env.AI_MODEL,
  configuration: { baseURL: process.env.AI_ENDPOINT },
  apiKey: process.env.AI_API_KEY,
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function streamingChat() {
  rl.question("\nYou: ", async (input) => {
    if (input.toLowerCase() === "quit" || input.toLowerCase() === "exit") {
      console.log("\n👋 Goodbye!");
      rl.close();
      return;
    }

    if (!input.trim()) {
      streamingChat();
      return;
    }

    try {
      console.log("\n🤖 Typing...\n");

      const startTime = Date.now();
      let firstChunkTime = 0;
      let fullResponse = "";

      const stream = await model.stream(input);

      for await (const chunk of stream) {
        if (firstChunkTime === 0) {
          firstChunkTime = Date.now();
          // Clear the "Typing..." line
          process.stdout.write("\r🤖 Chatbot: ");
        }
        const content = String(chunk.content);
        process.stdout.write(content);
        fullResponse += content;
      }

      const endTime = Date.now();

      console.log("\n");
      console.log(`⚡ First chunk: ${firstChunkTime - startTime}ms`);
      console.log(`⏱️  Full response: ${endTime - startTime}ms`);

      // Exit in CI mode after one interaction
      if (process.env.CI === "true") {
        rl.close();
        return;
      }

      streamingChat();
    } catch (error: any) {
      console.error("\n❌ Error:", error.message);
      streamingChat();
    }
  });
}

console.log("⚡ Streaming Chat Interface");
console.log('Type your question and watch the response stream! (Type "quit" to exit)\n');

streamingChat();
