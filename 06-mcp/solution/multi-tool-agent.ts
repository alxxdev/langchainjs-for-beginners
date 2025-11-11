/**
 * Chapter 6 Assignment Solution: Challenge 2 - Multi-Tool Agent with MCP
 *
 * This solution demonstrates:
 * - Combining MCP tools (from Context7) with custom tools (calculator)
 * - Creating an agent that can choose between MCP and custom tools
 * - Testing queries that require different tool types
 * - Demonstrating the flexibility of the agent pattern
 *
 * Run: npx tsx 06-mcp/solution/multi-tool-agent.ts
 */

import { MultiServerMCPClient } from "@langchain/mcp-adapters";
import { ChatOpenAI } from "@langchain/openai";
import { createAgent, HumanMessage, tool } from "langchain";
import * as z from "zod";
import "dotenv/config";

console.log("🎛️  Chapter 6 Assignment Solution: Challenge 2");
console.log("=" .repeat(60));
console.log();

// Custom calculator tool (not from MCP)
const calculatorTool = tool(
  async (input) => {
    console.log(`   [Calculator] Evaluating: ${input.expression}`);
    try {
      // Sanitize and evaluate the expression
      const sanitized = input.expression.replace(/[^0-9+\-*/().\s]/g, "");
      const result = Function(`"use strict"; return (${sanitized})`)();
      return `The result is: ${result}`;
    } catch (error) {
      return `Error calculating "${input.expression}": ${error}`;
    }
  },
  {
    name: "calculator",
    description:
      "Perform mathematical calculations. Use this for arithmetic operations like addition, subtraction, multiplication, division, and more complex expressions. Examples: '125 * 8', '50 + 25', '(10 + 5) * 2'",
    schema: z.object({
      expression: z
        .string()
        .describe("The mathematical expression to evaluate, e.g., '125 * 8' or '50 + 25'"),
    }),
  }
);

async function main() {
  // Step 1: Connect to Context7 MCP server
  console.log("📡 Connecting to Context7 MCP server...");
  const mcpClient = new MultiServerMCPClient({
    context7: {
      transport: "http",
      url: "https://mcp.context7.com/mcp",
    },
  });

  try {
    // Step 2: Get MCP tools
    console.log("🔍 Fetching MCP tools from Context7...");
    const mcpTools = await mcpClient.getTools();

    // Step 3: Combine MCP tools with custom tools
    console.log("🔧 Combining MCP tools with custom calculator tool...\n");
    const allTools = [...mcpTools, calculatorTool];

    console.log("📋 Available Tools:");
    console.log("\n   From Context7 (MCP):");
    mcpTools.forEach((tool) => {
      console.log(`   • ${tool.name}: ${tool.description}`);
    });
    console.log("\n   Custom Tools:");
    console.log(`   • calculator: Mathematical calculations`);
    console.log();

    // Step 4: Create model
    const model = new ChatOpenAI({
      model: process.env.AI_MODEL || "gpt-4o-mini",
      configuration: { baseURL: process.env.AI_ENDPOINT },
      apiKey: process.env.AI_API_KEY,
    });

    // Step 5: Create agent with all tools
    console.log("🤖 Creating multi-tool agent...\n");
    const agent = createAgent({
      model,
      tools: allTools,
    });

    // Step 6: Test with different queries
    const queries = [
      "What is 125 * 8?",
      "How do I use React hooks?",
      "Calculate 50 + 25",
    ];

    for (const query of queries) {
      console.log(`👤 User: ${query}`);

      const response = await agent.invoke({
        messages: [new HumanMessage(query)],
      });

      const lastMessage = response.messages[response.messages.length - 1];
      console.log(`🤖 Agent: ${lastMessage.content}`);
      console.log();
      console.log("-".repeat(60));
      console.log();
    }

    console.log("✅ Challenge 2 Complete!");
    console.log();
    console.log("💡 What Just Happened:");
    console.log("   • Math queries → Agent used the custom calculator tool");
    console.log("   • Documentation queries → Agent used Context7 MCP tools");
    console.log("   • Agent autonomously selected the right tool for each task");
    console.log("   • Same agent instance handled both MCP and custom tools!");
    console.log();
    console.log("🎯 Key Pattern:");
    console.log("   const allTools = [...mcpTools, customTool]");
    console.log("   const agent = createAgent({ model, tools: allTools })");
    console.log();
    console.log("   This pattern lets you mix MCP tools (from external servers)");
    console.log("   with your own custom tools in a single agent!");
    console.log();

  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  } finally {
    // Clean up
    await mcpClient.close();
    console.log("🔌 MCP client connection closed");
  }
}

main();
