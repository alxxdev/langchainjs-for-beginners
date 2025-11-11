/**
 * Chapter 6 Sample: Simple MCP Server (HTTP Streaming - Stateful)
 *
 * This example shows how to build a basic MCP server that exposes tools.
 * This is the server-side implementation - the counterpart to the client
 * code you've seen in the chapter examples.
 *
 * Run: npx tsx 06-mcp/samples/basic-mcp-server.ts
 *
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { 
  ListToolsRequestSchema, 
  CallToolRequestSchema,
  isInitializeRequest,
  JSONRPCError
} from "@modelcontextprotocol/sdk/types.js";
import { evaluate } from "mathjs";
import express, { Request, Response } from "express";
import { randomUUID } from "node:crypto";

// Create MCP server with tools capability
const mcpServer = new Server(
  { name: "my-calculator", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

// Define available tools
mcpServer.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "calculate",
      description: "Perform mathematical calculations",
      inputSchema: {
        type: "object",
        properties: {
          expression: { type: "string", description: "Math expression to evaluate" }
        },
        required: ["expression"]
      }
    }
  ]
}));

// Handle tool execution
mcpServer.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "calculate") {
    const { expression } = request.params.arguments as { expression: string };
    try {
      const result = evaluate(expression);
      return { content: [{ type: "text", text: String(result) }] };
    } catch (error) {
      throw new Error(`Invalid expression: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  throw new Error(`Unknown tool: ${request.params.name}`);
});

// StreamableHTTPServer class wrapper for session management
class StreamableHTTPServer {
  mcpServer: Server;
  // Map to store transports by session ID
  private transports: { [sessionId: string]: StreamableHTTPServerTransport } = {};

  constructor(mcpServer: Server) {
    this.mcpServer = mcpServer;
  }

  async handleGetRequest(req: Request, res: Response) {
    res.status(405).json(this.createRPCErrorResponse('Method not allowed.'));
    console.log('🚫 Responded to GET with 405 Method Not Allowed');
  }

  async handlePostRequest(req: Request, res: Response) {
    console.log(`📩 POST ${req.originalUrl} - payload received`);

    try {
      // Check for existing session ID
      const sessionId = req.headers['mcp-session-id'] as string | undefined;
      let transport: StreamableHTTPServerTransport;

      if (sessionId && this.transports[sessionId]) {
        // Reuse existing transport
        transport = this.transports[sessionId];
        console.log(`🔄 Reusing existing session: ${sessionId}`);
      } else if (!sessionId && isInitializeRequest(req.body)) {
        // New initialization request
        transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: () => randomUUID(),
          onsessioninitialized: (sessionId) => {
            // Store the transport by session ID
            this.transports[sessionId] = transport;
            console.log(`🆕 New session initialized: ${sessionId}`);
          }
        });

        // Clean up transport when closed
        transport.onclose = () => {
          if (transport.sessionId) {
            delete this.transports[transport.sessionId];
            console.log(`🗑️ Session removed: ${transport.sessionId}`);
          }
        };

        // Connect transport to the MCP server
        console.log('🔄 Connecting transport to server...');
        await this.mcpServer.connect(transport);
        console.log('🔗 Transport connected successfully');
      } else {
        // Invalid request
        res.status(400).json({
          jsonrpc: '2.0',
          error: {
            code: -32000,
            message: 'Bad Request: No valid session ID provided',
          },
          id: null,
        });
        console.error('❌ Invalid request: No valid session ID provided');
        return;
      }

      // Handle the request
      await transport.handleRequest(req, res, req.body);
      console.log(`✅ POST request handled successfully (status=${res.statusCode})`);
    } catch (error) {
      console.error('💥 Error handling MCP request:', error);
      if (!res.headersSent) {
        res
          .status(500)
          .json(this.createRPCErrorResponse('Internal server error.'));
        console.error('🔥 Responded with 500 Internal Server Error');
      }
    }
  }

  // Handle DELETE requests for session termination
  async handleDeleteRequest(req: Request, res: Response) {
    const sessionId = req.headers['mcp-session-id'] as string | undefined;
    if (!sessionId || !this.transports[sessionId]) {
      res.status(400).send('Invalid or missing session ID');
      console.log('🚫 DELETE request rejected: Invalid or missing session ID');
      return;
    }

    const transport = this.transports[sessionId];

    try {
      transport.close();
      delete this.transports[sessionId];
      res.status(200).send('Session terminated successfully');
      console.log(`🔒 Session ${sessionId} terminated successfully`);
    } catch (error) {
      console.error(`💥 Error terminating session ${sessionId}:`, error);
      res.status(500).send('Error terminating session');
    }
  }

  async close() {
    console.log('🛑 Shutting down server...');
    // Close all active transports
    for (const transport of Object.values(this.transports)) {
      try {
        transport.close();
        console.log(`🗑️ Transport closed for session ID: ${transport.sessionId}`);
      } catch (error) {
        console.error('💥 Error closing transport:', error);
      }
    }
    await this.mcpServer.close();
    console.log('👋 Server shutdown complete.');
  }

  private createRPCErrorResponse(message: string): JSONRPCError {
    return {
      jsonrpc: '2.0',
      error: {
        code: -32603,
        message: message,
      },
      id: randomUUID(),
    };
  }
}

// Create StreamableHTTPServer instance
const server = new StreamableHTTPServer(mcpServer);

// Express app setup
const app = express();
app.use(express.json());

const router = express.Router();
const MCP_ENDPOINT = '/mcp';

router.get(MCP_ENDPOINT, async (req: Request, res: Response) => {
  await server.handleGetRequest(req, res);
});

router.post(MCP_ENDPOINT, async (req: Request, res: Response) => {
  await server.handlePostRequest(req, res);
});

// Handle session termination
router.delete(MCP_ENDPOINT, async (req: Request, res: Response) => {
  await server.handleDeleteRequest(req, res);
});

app.use('/', router);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 MCP Calculator Server (HTTP Streaming - Stateful)`);
  console.log(`🌐 MCP endpoint: http://localhost:${PORT}${MCP_ENDPOINT}`);
  console.log(`⌨️  Press Ctrl+C to stop the server`);
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log(`🛑 Shutting down server...`);
  await server.close();
  process.exit(0);
});