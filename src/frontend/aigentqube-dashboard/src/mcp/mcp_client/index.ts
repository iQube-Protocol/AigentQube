#!/usr/bin/env node
import { Anthropic } from "@anthropic-ai/sdk";
import { MessageParam, Tool } from "@anthropic-ai/sdk/resources/messages/messages.mjs";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import readline from "readline/promises";
import dotenv from "dotenv";
import path from "path";

// Load environment variables
dotenv.config({
  path: path.resolve("../../../", '.env')
});

// Validate API key
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
if (!ANTHROPIC_API_KEY) {
  throw new Error("ANTHROPIC_API_KEY is not set in environment");
}

class MCPClient {
  private mcp: Client;
  private anthropic: Anthropic;
  private transport: SSEClientTransport | null = null;
  private tools: Tool[] = [];

  constructor() {
    this.anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });
    this.mcp = new Client({ name: "mcp-client-cli", version: "1.0.0" });
  }

  async connectToServer(serverUrl: string, token?: string) {
    const sseUrl = new URL("/sse", serverUrl);

    this.transport = new SSEClientTransport(sseUrl, {
      requestInit: {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      }
    });

    console.log("Connecting to MCP server via SSE...");

    await this.mcp.connect(this.transport);

    const { tools } = await this.mcp.listTools();
    this.tools = tools.map(t => ({
      name: t.name,
      description: t.description,
      input_schema: t.inputSchema,
    }));

    console.log("✅ Connected to server with tools:", this.tools.map(t => t.name));
  }

  async processQuery(query: string): Promise<string> {
    const messages: MessageParam[] = [{ role: "user", content: query }];

    const response = await this.anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1000,
      messages,
      tools: this.tools,
    });

    const finalText: string[] = [];

    for (const part of response.content) {
      if (part.type === "text") {
        finalText.push(part.text);
      } else if (part.type === "tool_use") {
        const result = await this.mcp.callTool({
          name: part.name,
          arguments: part.input as { [x: string]: unknown } | undefined,
        });
        finalText.push(`[Called ${part.name}: ${JSON.stringify(part.input)}]`);
        messages.push({ role: "user", content: result.content as string });

        const followUp = await this.anthropic.messages.create({
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 1000,
          messages,
        });
        if (followUp.content[0].type === "text") {
          finalText.push(followUp.content[0].text);
        }
      }
    }

    return finalText.join("\n");
  }

  async chatLoop() {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    console.log("\nMCP Client Started! Type your queries or 'quit' to exit.");

    try {
      while (true) {
        const msg = await rl.question("\nQuery> ");
        if (msg.trim().toLowerCase() === "quit") break;
        const reply = await this.processQuery(msg);
        console.log("\n" + reply);
      }
    } finally {
      rl.close();
    }
  }

  async cleanup() {
    await this.mcp.close();
    if (this.transport) {
      await this.transport.close();
    }
  }
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.error("Usage: node build/index.js <serverUrl> [--token <token>]");
    process.exit(1);
  }

  const serverUrl = args[0];
  let token: string | undefined;

  for (let i = 1; i < args.length; i++) {
    if (args[i] === "--token" && args[i + 1]) {
      token = args[i + 1];
      break;
    }
  }

  const client = new MCPClient();
  try {
    await client.connectToServer(serverUrl, token);
    await client.chatLoop();
  } finally {
    await client.cleanup();
    process.exit(0);
  }
}

main();
