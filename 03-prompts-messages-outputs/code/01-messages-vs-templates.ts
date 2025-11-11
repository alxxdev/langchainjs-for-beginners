/**
 * Messages vs Templates - Understanding the Two Paradigms
 * Run: npx tsx 03-prompts-messages-outputs/code/01-messages-vs-templates.ts
 *
 * 🤖 Try asking GitHub Copilot Chat (https://github.com/features/copilot):
 * - "When should I use messages vs templates in LangChain.js?"
 * - "How do agents use messages differently from RAG systems?"
 */

import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "langchain";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import "dotenv/config";

async function main() {
  console.log("🎯 Messages vs Templates: Two Approaches\n");
  console.log("=".repeat(80));

  const model = new ChatOpenAI({
    model: process.env.AI_MODEL,
    configuration: { baseURL: process.env.AI_ENDPOINT },
    apiKey: process.env.AI_API_KEY,
  });

  // ==========================================
  // APPROACH 1: Messages
  // ==========================================
  console.log("\n🤖 APPROACH 1: Message Arrays\n");

  const messages = [
    new SystemMessage("You are a helpful translator."),
    new HumanMessage("Translate 'Hello, world!' to French"),
  ];

  console.log("📝 Message structure:");
  messages.forEach((msg, i) => {
    console.log(`   ${i + 1}. ${msg.type}: "${msg.content}"`);
  });

  const messageResponse = await model.invoke(messages);
  console.log(`\n✅ Response: ${messageResponse.content}\n`);

  console.log("💡 Key points about messages:");
  console.log("   • Direct message construction - no template needed");
  console.log("   • Used by createAgent() in LangChain");
  console.log("   • Great for dynamic, conversational flows");
  console.log("   • Messages can include tool calls and results");
  console.log("   • Ideal for agents with middleware");

  // ==========================================
  // APPROACH 2: Templates (classic approach)
  // ==========================================
  console.log("\n" + "=".repeat(80));
  console.log("\n📋 APPROACH 2: Templates\n");

  const template = ChatPromptTemplate.fromMessages([
    ["system", "You are a helpful translator."],
    ["human", "Translate '{text}' to {language}"],
  ]);

  console.log("📝 Template structure:");
  console.log("   • System message: Fixed role definition");
  console.log("   • Human message: Variables {text} and {language}");
  console.log("   • Reusable across multiple invocations\n");

  const templateChain = template.pipe(model);
  const templateResponse = await templateChain.invoke({
    text: "Hello, world!",
    language: "French",
  });

  console.log(`✅ Response: ${templateResponse.content}\n`);

  console.log("💡 Key points about templates:");
  console.log("   • Reusable with variables");
  console.log("   • Required by createStuffDocumentsChain() for RAG");
  console.log("   • Great for consistent prompt structure");
  console.log("   • Pipes directly to models");
  console.log("   • Ideal for RAG and chain-based workflows");

  // ==========================================
  // WHEN TO USE EACH
  // ==========================================
  console.log("\n" + "=".repeat(80));
  console.log("\n🎯 Decision Framework: Which Approach to Use?\n");

  console.log("✅ USE MESSAGES when:");
  console.log("   • Building agents with createAgent()");
  console.log("   • Working with middleware");
  console.log("   • Handling multi-step reasoning");
  console.log("   • Integrating MCP tools");
  console.log("   • Need full control over message flow");

  console.log("✅ USE TEMPLATES when:");
  console.log("   • Building RAG systems");
  console.log("   • Need reusable prompt patterns");
  console.log("   • Want variable substitution");
  console.log("   • Creating chains with createStuffDocumentsChain()");
  console.log("   • Consistent prompts across application");

  console.log("📚 Modern LangChain.js Pattern:");
  console.log("   • Messages: Dynamic workflows + middleware");
  console.log("   • Templates: Reusable prompts for consistency");
  console.log("   • Both are valuable - learn when to use each!");
  console.log("\n" + "=".repeat(80));
}

main().catch(console.error);
