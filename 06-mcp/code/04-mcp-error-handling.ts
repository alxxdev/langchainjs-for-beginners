/**
 * Chapter 6 Example 4: MCP Error Handling & Production Patterns
 *
 * This example shows production-ready patterns for handling MCP failures:
 * - Built-in retry logic with LangChain's withRetry()
 * - Connection errors and timeouts
 * - Graceful degradation
 * - Fallback strategies
 *
 * These patterns are essential for building reliable MCP integrations!
 *
 * Run: tsx 06-mcp/code/04-mcp-error-handling.ts
 */

import { MultiServerMCPClient } from "@langchain/mcp-adapters";
import { ChatOpenAI } from "@langchain/openai";
import { createAgent, HumanMessage } from "langchain";
import "dotenv/config";

// Utility: Safe MCP client creation with error handling
async function createMCPClientSafely(config: any): Promise<MultiServerMCPClient | null> {
  try {
    console.log("🔄 Attempting to connect to MCP server...");
    const client = new MultiServerMCPClient(config);

    // Test connection by getting tools (MCP client handles connection internally)
    const tools = await client.getTools();
    console.log(`✅ Connected! Retrieved ${tools.length} tools`);

    return client;
  } catch (error) {
    console.error("❌ Failed to connect to MCP server:", error instanceof Error ? error.message : error);
    return null;
  }
}

// Main execution
console.log("🛡️  MCP Error Handling & Retry Patterns\n");

// Pattern 1: Try primary server, fall back to alternative
console.log("Pattern 1: Primary + Fallback Strategy\n");

let mcpClient: MultiServerMCPClient | null = null;

try {
  // Try Context7 (primary)
  console.log("📡 Trying primary server (Context7)...");
  mcpClient = await createMCPClientSafely({
    context7: {
      transport: "http",
      url: "https://mcp.context7.com/mcp"
    }
  });

  if (!mcpClient) {
    // If Context7 fails, you could fall back to alternative server
    console.log("\n📡 Primary failed, trying fallback server...");
    // This is where you'd try an alternative server
    // For demo, we'll continue without fallback
    throw new Error("No MCP servers available");
  }

  // Get tools with error handling
  let tools: any[] = [];
  try {
    console.log("\n🔧 Fetching tools from MCP server...");
    tools = await mcpClient!.getTools();

    console.log(`✅ Retrieved ${tools.length} tools successfully\n`);
    tools.forEach(tool => {
      console.log(`   • ${tool.name}`);
    });
  } catch (error) {
    console.error("❌ Failed to fetch tools:", error instanceof Error ? error.message : error);
    console.log("💡 Fallback: Using empty tools array");
    tools = [];
  }

  // Pattern 2: Create Model with Built-In Retry Logic
  console.log("\n\nPattern 2: Using LangChain's Built-In withRetry()\n");

  if (tools.length === 0) {
    console.log("⚠️  No tools available - agent will run without MCP tools");
    console.log("   This is graceful degradation - app continues to work!");
  }

  // Create base model
  const baseModel = new ChatOpenAI({
    model: process.env.AI_MODEL,
    configuration: { baseURL: process.env.AI_ENDPOINT },
    apiKey: process.env.AI_API_KEY
  });

  // Use LangChain's built-in retry logic - automatically handles exponential backoff!
  const modelWithRetry = baseModel.withRetry({
    stopAfterAttempt: 3  // Max 3 retry attempts
  });

  console.log("✅ Model configured with automatic retry (max 3 attempts)");
  console.log("   - LangChain handles exponential backoff automatically");
  console.log("   - No custom retry loops needed!");

  const agent = createAgent({
    model: modelWithRetry,  // Use model with retry
    tools  // May be empty array if MCP failed
  });

  // Pattern 3: Execute with timeout and error handling
  console.log("\n\nPattern 3: Query Execution with Timeout\n");

  const query = "What is React? Get the latest documentation.";
  console.log(`👤 User: ${query}`);

  try {
    // Wrap agent execution with timeout
    const timeoutMs = 30000;  // 30 second timeout
    const responsePromise = agent.invoke({
      messages: [new HumanMessage(query)]
    });

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Query timeout")), timeoutMs)
    );

    const response = await Promise.race([responsePromise, timeoutPromise]) as any;

    const lastMessage = response.messages[response.messages.length - 1];
    console.log(`🤖 Agent: ${lastMessage.content}\n`);

  } catch (error) {
    console.error("❌ Query failed:", error instanceof Error ? error.message : error);

    // Fallback response
    console.log("💡 Fallback: Providing cached/default response");
    console.log("🤖 Agent: I'm experiencing connectivity issues. Please try again later.");
  }

  // Pattern 4: Health checks
  console.log("\nPattern 4: MCP Server Health Check\n");

  async function checkMCPHealth(client: MultiServerMCPClient): Promise<boolean> {
    try {
      const tools = await Promise.race([
        client.getTools(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Health check timeout")), 5000)
        )
      ]) as any[];

      const isHealthy = tools.length > 0;
      console.log(isHealthy ? "✅ MCP server is healthy" : "⚠️  MCP server returned no tools");
      return isHealthy;
    } catch (error) {
      console.error("❌ MCP server is unhealthy:", error instanceof Error ? error.message : error);
      return false;
    }
  }

  const isHealthy = await checkMCPHealth(mcpClient);
  console.log(`\n🏥 Health status: ${isHealthy ? "HEALTHY" : "UNHEALTHY"}`);

  // Best practices summary
  console.log("\n\n💡 Error Handling Best Practices:");
  console.log("   ✅ Use LangChain's withRetry() for automatic exponential backoff");
  console.log("   ✅ Implement fallback servers for high availability");
  console.log("   ✅ Set timeouts on all network operations");
  console.log("   ✅ Gracefully degrade when MCP is unavailable");
  console.log("   ✅ Implement health checks for monitoring");
  console.log("   ✅ Log errors for debugging and alerting");
  console.log("   ✅ Provide user-friendly error messages");

  console.log("\n🎯 Production Checklist:");
  console.log("   ✅ Use model.withRetry() for automatic retries");
  console.log("   □ Request timeouts");
  console.log("   □ Fallback strategies");
  console.log("   □ Health monitoring");
  console.log("   □ Error logging/metrics");
  console.log("   □ Graceful degradation");
  console.log("   □ Circuit breaker pattern (for advanced use)");

} catch (error) {
  console.error("\n❌ Critical error:", error);
  console.log("💡 In production, this would trigger alerts and fallback to cached data");
} finally {
  // Always clean up connections
  if (mcpClient) {
    try {
      await mcpClient.close();
      console.log("\n✅ MCP connection closed gracefully");
    } catch (error) {
      console.error("⚠️  Error closing MCP connection:", error);
    }
  }
}

console.log("\n🎓 Key Takeaways:");
console.log("   • Use LangChain's withRetry() instead of custom retry loops");
console.log("   • withRetry() provides production-tested exponential backoff");
console.log("   • Always handle MCP connection failures gracefully");
console.log("   • Implement timeouts to prevent hangs");
console.log("   • Provide fallbacks for degraded operation");
console.log("   • Monitor health and log errors");
console.log("   • Clean up resources in finally blocks");
