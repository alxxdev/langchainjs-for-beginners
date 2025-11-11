/**
 * Chapter 6 Example 1: Agent with MCP Server Integration
 *
 * This example shows how to connect to Context7 MCP server - a documentation
 * provider that delivers current, version-specific docs directly to your agent.
 *
 * Context7 provides these tools:
 * - resolve-library-id: Converts library names to Context7-compatible IDs
 * - get-library-docs: Retrieves documentation with optional topic filtering
 *
 * Prerequisites:
 * 1. Install @langchain/mcp-adapters: npm install @langchain/mcp-adapters
 * 2. Optional: Get a Context7 API key for higher rate limits (https://context7.com)
 *
 * Run: npx tsx 06-mcp/code/01-mcp-integration.ts
 *
 * 🤖 Try asking GitHub Copilot Chat (https://github.com/features/copilot):
 * - "How does MultiServerMCPClient differ from manually creating tools?"
 * - "Can I connect to multiple MCP servers simultaneously?"
 */

import { ChatOpenAI } from "@langchain/openai";
import { createAgent, HumanMessage } from "langchain";
import "dotenv/config";
import { MultiServerMCPClient } from "@langchain/mcp-adapters";

async function main() {
  console.log("🔌 MCP Integration Demo - Context7 Documentation Server\n");
  console.log("=".repeat(80) + "\n");

  // Context7 MCP Server - provides documentation for libraries
  // Remote (HTTP): https://mcp.context7.com/mcp (recommended)
  // Local (HTTP): http://localhost:3000/mcp (if running Context7 locally)
  const MCP_SERVER_URL = process.env.MCP_SERVER_URL || "https://mcp.context7.com/mcp";

  console.log(`📡 Connecting to MCP server at: ${MCP_SERVER_URL}\n`);

  // Create MCP client with HTTP transport to Context7
  const mcpClient = new MultiServerMCPClient({
    context7: {
      transport: "http",
      url: MCP_SERVER_URL,
      // Optional: Add Context7 API key for higher rate limits
      // headers: {
      //   "Authorization": `Bearer ${process.env.CONTEXT7_API_KEY}`
      // }
    },
  });

  try {
    // 2. Get all available tools from Context7
    console.log("🔧 Fetching tools from Context7 MCP server...");
    const tools = await mcpClient.getTools();

    console.log(`✅ Retrieved ${tools.length} tools from Context7:`);
    tools.forEach((tool) => {
      console.log(`   • ${tool.name}: ${tool.description}`);
    });
    console.log();

    // 3. Create model
    const model = new ChatOpenAI({
      model: process.env.AI_MODEL,
      configuration: { baseURL: process.env.AI_ENDPOINT },
      apiKey: process.env.AI_API_KEY,
    });

    // 4. Create agent with MCP tools - uses same createAgent() pattern!
    console.log("🤖 Creating agent with MCP tools...\n");
    const agent = createAgent({
      model,
      tools, // Tools from MCP server - that's the only difference!
    });

    // 5. Use the agent to get documentation
    const query = "How do I use React useState hook? Get the latest documentation.";
    console.log(`👤 User: ${query}\n`);

    const response = await agent.invoke({ messages: [new HumanMessage(query)] });
    const lastMessage = response.messages[response.messages.length - 1];

    console.log(`🤖 Agent: ${lastMessage.content}\n`);

    console.log("=".repeat(80) + "\n");
    console.log("💡 Key Concepts:");
    console.log("   • MCP provides standardized access to external tools");
    console.log("   • MultiServerMCPClient connects to one or more MCP servers");
    console.log("   • HTTP transport works with remote servers like Context7");
    console.log("   • Tools from MCP servers work seamlessly with createAgent()");
    console.log("   • Same createAgent() pattern, different tool source!");
    console.log("   • No manual loop needed - createAgent() handles the ReAct pattern");
  } catch (error) {
    console.error("❌ Error connecting to Context7 MCP server:", error);
  } finally {
    // Close the MCP client connection to allow the script to exit
    await mcpClient.close();
    console.log("\n✅ MCP client connection closed");
  }
}

main().catch(console.error);
