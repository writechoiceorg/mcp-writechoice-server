#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { ValeService } from './vale-service';

const server = new Server(
  {
    name: 'mcp-vale-server',
    version: '1.0.0',
  }
);

// Initialize Vale service with config path
const valeConfigPath = process.env.VALE_CONFIG_PATH || './vale.ini';
const valeService = new ValeService(valeConfigPath);

// Define tool schemas
const LintTextArgsSchema = z.object({
  text: z.string().describe('The text content to lint with Vale'),
  fileName: z.string().optional().describe('Optional filename for the text (default: document.md)'),
});

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'lint_text',
        description: 'Lint text content using Vale style checker',
        inputSchema: {
          type: 'object',
          properties: {
            text: {
              type: 'string',
              description: 'The text content to lint',
            },
            fileName: {
              type: 'string',
              description: 'Optional filename for the text (default: document.md)',
            },
          },
          required: ['text'],
        },
      },
      {
        name: 'check_vale_status',
        description: 'Check if Vale is installed and working properly',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'lint_text': {
        const { text, fileName = 'document.md' } = LintTextArgsSchema.parse(args);
        const result = await valeService.lintTextWithVale(text, fileName);
        
        // Format the result in a more readable way
        const totalIssues = result.errors.length + result.warnings.length + result.suggestions.length;
        let formattedResult = `Vale Lint Results for ${result.file}\n`;
        formattedResult += `Total Issues: ${totalIssues}\n\n`;
        
        if (result.errors.length > 0) {
          formattedResult += `🚨 ERRORS (${result.errors.length}):\n`;
          result.errors.forEach(error => {
            formattedResult += `  Line ${error.line}: ${error.message} (${error.rule})\n`;
          });
          formattedResult += '\n';
        }
        
        if (result.warnings.length > 0) {
          formattedResult += `⚠️ WARNINGS (${result.warnings.length}):\n`;
          result.warnings.forEach(warning => {
            formattedResult += `  Line ${warning.line}: ${warning.message} (${warning.rule})\n`;
          });
          formattedResult += '\n';
        }
        
        if (result.suggestions.length > 0) {
          formattedResult += `💡 SUGGESTIONS (${result.suggestions.length}):\n`;
          result.suggestions.forEach(suggestion => {
            formattedResult += `  Line ${suggestion.line}: ${suggestion.message} (${suggestion.rule})\n`;
          });
        }
        
        if (totalIssues === 0) {
          formattedResult += '✅ No issues found! Your text follows all Vale style guidelines.';
        }
        
        return {
          content: [
            {
              type: 'text',
              text: formattedResult,
            },
          ],
        };
      }

      case 'check_vale_status': {
        const status = await valeService.checkValeInstallation();
        let statusText = 'Vale Installation Status:\n\n';
        
        if (status.installed) {
          statusText += `✅ Vale is installed\n`;
          statusText += `Version: ${status.version}\n`;
          statusText += `Config Path: ${valeConfigPath}\n`;
        } else {
          statusText += `❌ Vale is not installed or not accessible\n`;
          statusText += `Error: ${status.error}\n\n`;
          statusText += `To install Vale:\n`;
          statusText += `- macOS: brew install vale\n`;
          statusText += `- Linux: Download from https://github.com/errata-ai/vale/releases\n`;
          statusText += `- Windows: choco install vale\n`;
        }
        
        return {
          content: [
            {
              type: 'text',
              text: statusText,
            },
          ],
        };
      }

      default:
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Unknown tool: ${name}`
        );
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new McpError(
        ErrorCode.InvalidParams,
        `Invalid arguments: ${error.message}`
      );
    }
    throw error;
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('MCP Vale server running on stdio');
}

main().catch((error) => {
  console.error('Server failed to start:', error);
  process.exit(1);
});