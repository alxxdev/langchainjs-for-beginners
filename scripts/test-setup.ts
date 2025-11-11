/**
 * Setup Test - Verify AI Provider Access
 */
import { ChatOpenAI } from "@langchain/openai";
import "dotenv/config";

async function testSetup() {
  console.log("🚀 Testing AI provider connection...\n");

  // Check if required variables are set
  if (!process.env.AI_API_KEY) {
    console.error("❌ ERROR: AI_API_KEY not found in .env file");
    process.exit(1);
  }

  if (!process.env.AI_ENDPOINT) {
    console.error("❌ ERROR: AI_ENDPOINT not found in .env file");
    process.exit(1);
  }

  try {
    const model = new ChatOpenAI({
      model: process.env.AI_MODEL || "gpt-5-mini",
      configuration: {
        baseURL: process.env.AI_ENDPOINT,
      },
      apiKey: process.env.AI_API_KEY,
    });

    const response = await model.invoke("Say 'Setup successful!' if you can read this.");

    console.log("✅ SUCCESS! Your AI provider is working!");
    console.log(`   Provider: ${process.env.AI_ENDPOINT}`);
    console.log(`   Model: ${process.env.AI_MODEL || "gpt-5-mini"}`);
    console.log("\nModel response:", response.content);
    console.log("\n🎉 You're ready to start the course!");
  } catch (error) {
    console.error("❌ ERROR:", error instanceof Error ? error.message : String(error));
    console.log("\nTroubleshooting:");
    console.log("1. Check your AI_API_KEY in .env file");
    console.log("2. Verify the AI_ENDPOINT is correct");
    console.log("3. Ensure the AI_MODEL is valid for your provider");
    console.log("4. Verify the token/key has no extra spaces");
  }
}

testSetup();
