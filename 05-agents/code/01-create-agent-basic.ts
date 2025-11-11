import { createAgent, HumanMessage, tool } from "langchain";
import { ChatOpenAI } from "@langchain/openai";
import * as z from "zod";
import "dotenv/config";

/**
 * Example 1: Using createAgent() (Recommended Approach)
 *
 * This example demonstrates building an agent using createAgent(), the recommended approach.
 * For comparison, see samples/basic-agent-manual-loop.ts which shows manual ReAct loop implementation.
 *
 * Key Benefits of createAgent():
 * - Handles the ReAct loop automatically
 * - Less boilerplate code
 * - Production-ready error handling built-in
 * - Cleaner, more maintainable
 */

// Define a calculator tool for the agent
const calculatorTool = tool(
  async (input) => {
    // Sanitize the expression to prevent code injection
    const sanitized = input.expression.replace(/[^0-9+\-*/().\s]/g, "");
    const result = Function(`"use strict"; return (${sanitized})`)();
    return String(result);
  },
  {
    name: "calculator",
    description:
      "A calculator that can perform basic arithmetic operations. Use this when you need to calculate mathematical expressions.",
    schema: z.object({
      expression: z
        .string()
        .describe("The mathematical expression to evaluate (e.g., '25 * 8')"),
    }),
  },
);

async function main() {
  console.log("🤖 Agent with createAgent() Example\n");

  // Create the model
  const model = new ChatOpenAI({
    model: process.env.AI_MODEL,
    configuration: { baseURL: process.env.AI_ENDPOINT },
    apiKey: process.env.AI_API_KEY,
  });

  // Create agent using v1 createAgent() - that's it!
  const agent = createAgent({
    model,
    tools: [calculatorTool],
  });

  // Use the agent
  const query = "What is 125 * 8?";
  console.log(`👤 User: ${query}\n`);

  // createAgent() returns a LangGraph agent that expects messages array
  const response = await agent.invoke({ messages: [new HumanMessage(query)] });
  // The response contains the full state, including all messages
  // Get the last message which is the agent's final answer
  const lastMessage = response.messages[response.messages.length - 1];
  console.log(`🤖 Agent: ${lastMessage.content}\n`);

  console.log("💡 Key Differences from Manual Loop:");
  console.log("   • createAgent() handles the ReAct loop automatically");
  console.log("   • Less code to write");
  console.log("   • Production-ready error handling built-in");
  console.log("   • Same result, simpler API\n");

  console.log("✅ Under the hood:");
  console.log(
    "   createAgent() implements the ReAct pattern (Thought → Action → Observation)",
  );
  console.log("   and handles all the boilerplate for you.");
}

main().catch(console.error);
