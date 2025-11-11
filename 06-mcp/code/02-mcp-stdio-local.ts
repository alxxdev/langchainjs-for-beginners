/**
 * Chapter 6 Example 2: MCP with stdio Transport
 *
 * This example shows how to use stdio transport to connect to an MCP server
 * running as a subprocess, communicating via standard input/output streams.
 *
 * Comparison:
 * - Example 1: HTTP transport (network-based communication)
 * - Example 2: stdio transport (process-based communication)
 *
 * Run: tsx 06-mcp/code/02-mcp-stdio-local.ts
 */

import { MultiServerMCPClient } from "@langchain/mcp-adapters";
import { ChatOpenAI } from "@langchain/openai";
import { createAgent, HumanMessage } from "langchain";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import "dotenv/config";

// Get the directory of this file for resolving server path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log("🔧 Starting local MCP server via stdio...\n");

// Create MCP client with stdio transport - runs server as subprocess
const mcpClient = new MultiServerMCPClient({
  localCalculator: {
    transport: "stdio",
    command: "npx",
    args: ["tsx", join(__dirname, "servers/stdio-calculator-server.ts")]
  }
});

try {
  // 1. Get tools from local MCP server
  console.log("📟 Connecting to stdio MCP server...");
  const tools = await mcpClient.getTools();

  console.log(`✅ Connected! Retrieved ${tools.length} tools from local server:`);
  tools.forEach(tool => {
    console.log(`   • ${tool.name}: ${tool.description}`);
  });
  console.log();

  // 2. Create model
  const model = new ChatOpenAI({
    model: process.env.AI_MODEL,
    configuration: { baseURL: process.env.AI_ENDPOINT },
    apiKey: process.env.AI_API_KEY
  });

  // 3. Create agent with stdio MCP tools
  const agent = createAgent({
    model,
    tools
  });

  // 4. Test calculations
  console.log("🧮 Testing calculator tool...\n");

  const mathQuery = "What is 15 * 23 + 100?";
  console.log(`👤 User: ${mathQuery}`);

  const mathResponse = await agent.invoke({
    messages: [new HumanMessage(mathQuery)]
  });
  const mathResult = mathResponse.messages[mathResponse.messages.length - 1];
  console.log(`🤖 Agent: ${mathResult.content}\n`);

  // 5. Test temperature conversion
  console.log("🌡️  Testing temperature conversion...\n");

  const tempQuery = "Convert 100 degrees Fahrenheit to Celsius";
  console.log(`👤 User: ${tempQuery}`);

  const tempResponse = await agent.invoke({
    messages: [new HumanMessage(tempQuery)]
  });
  const tempResult = tempResponse.messages[tempResponse.messages.length - 1];
  console.log(`🤖 Agent: ${tempResult.content}\n`);

  // 6. Test complex calculation
  console.log("🔢 Testing complex math...\n");

  const complexQuery = "Calculate the square root of 144 plus the sine of pi/2";
  console.log(`👤 User: ${complexQuery}`);

  const complexResponse = await agent.invoke({
    messages: [new HumanMessage(complexQuery)]
  });
  const complexResult = complexResponse.messages[complexResponse.messages.length - 1];
  console.log(`🤖 Agent: ${complexResult.content}\n`);

  console.log("💡 Key Concepts:");
  console.log("   • stdio transport runs MCP server as a subprocess");
  console.log("   • Communicates via standard input/output streams");
  console.log("   • Server runs as child process of the client");
  console.log("   • HTTP transport uses network-based communication");
  console.log("   • stdio transport uses process-based communication");
  console.log("   • Same agent code works with both transports!\n");

  console.log("📚 Transport Comparison:");
  console.log("   stdio:  Process communication via stdin/stdout");
  console.log("   HTTP:   Network communication via HTTP requests");
  console.log("   Choose based on your architecture needs!");

} catch (error) {
  console.error("❌ Error with stdio MCP server:", error);
} finally {
  // Close the MCP client connection to allow script to exit
  await mcpClient.close();
  console.log("\n✅ MCP client connection closed");
}
