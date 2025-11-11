/**
 * Provider-Agnostic Model Initialization
 * Run: npx tsx 02-chat-models/code/04-init-chat-model.ts
 *
 * IMPORTANT: initChatModel() works best with standard provider APIs.
 * For GitHub Models or Azure OpenAI (used in this course), use ChatOpenAI directly.
 *
 * This example demonstrates initChatModel() concepts, but the course uses
 * ChatOpenAI because it properly handles custom endpoints like GitHub Models.
 *
 * 🤖 Try asking GitHub Copilot Chat (https://github.com/features/copilot):
 * - "What are the advantages of initChatModel over using ChatOpenAI directly?"
 * - "How would I switch from OpenAI to Anthropic using initChatModel?"
 */

import { initChatModel } from "langchain/chat_models/universal";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage } from "langchain";
import "dotenv/config";

async function standardOpenAIExample() {
  console.log("\n=== initChatModel() with Standard OpenAI ===\n");

  // NOTE: This requires a standard OpenAI API key (not GitHub Models)
  // Uncomment and add OPENAI_API_KEY to your .env to test:
  /*
  const model = await initChatModel("gpt-5-mini", {
    modelProvider: "openai",
    temperature: 0.7,
    apiKey: process.env.OPENAI_API_KEY,
  });

  const response = await model.invoke([
    new HumanMessage("What is LangChain.js in one sentence?")
  ]);

  console.log("Response:", response.content);
  */

  console.log("This example requires a standard OpenAI API key.");
  console.log("For GitHub Models/Azure, use ChatOpenAI instead (see below).\n");
}

async function switchingProviders() {
  console.log("\n=== Switching Between Providers ===\n");

  // This is where initChatModel() shines - switching providers with similar code:
  /*
  // OpenAI
  const openaiModel = await initChatModel("gpt-5-mini", {
    modelProvider: "openai",
    apiKey: process.env.OPENAI_API_KEY,
  });

  // Anthropic
  const anthropicModel = await initChatModel("claude-3-5-sonnet-20241022", {
    modelProvider: "anthropic",
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  // Google
  const googleModel = await initChatModel("gemini-pro", {
    modelProvider: "google",
    apiKey: process.env.GOOGLE_API_KEY,
  });
  */

  console.log("initChatModel() excels at switching between different providers");
  console.log("(OpenAI, Anthropic, Google, etc.) with similar code structure.\n");
}

async function courseRecommendation() {
  console.log("\n=== Recommended Approach for This Course ===\n");

  // For GitHub Models and Azure OpenAI, use ChatOpenAI directly:
  const model = new ChatOpenAI({
    model: process.env.AI_MODEL,
    configuration: { baseURL: process.env.AI_ENDPOINT },
    apiKey: process.env.AI_API_KEY,
  });

  const response = await model.invoke([new HumanMessage("What is LangChain.js in one sentence?")]);

  console.log("✅ Using ChatOpenAI (recommended for this course)");
  console.log("Response:", response.content);
  console.log("\nWhy ChatOpenAI?");
  console.log("- Properly handles GitHub Models and Azure OpenAI endpoints");
  console.log("- More explicit and easier to understand for learning");
  console.log("- Works seamlessly with custom baseURL configuration");
}

// Run all examples
async function main() {
  console.log("🔌 Provider-Agnostic Initialization Concepts\n");
  console.log("=".repeat(60));

  try {
    await standardOpenAIExample();
    await switchingProviders();
    await courseRecommendation();

    console.log("\n" + "=".repeat(60));
    console.log("\n📚 Key Takeaway:");
    console.log("- initChatModel() is great for switching between provider types");
    console.log("- For this course (GitHub Models/Azure), ChatOpenAI is recommended");
    console.log("- Both approaches are valid - choose based on your needs\n");
  } catch (error) {
    console.error("Error:", error);
  }
}

main();
