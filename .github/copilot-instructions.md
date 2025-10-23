# Copilot Instructions for MCP Google Docs + Vale Server

## Project Overview

This is a **Model Context Protocol (MCP) server** that integrates Google Docs with Vale (text linting). It provides 6 different usage modes, from web interfaces to programmatic APIs, with Vale document quality checking as a core feature.

## Key Architecture Components

### Dual Integration Pattern
- **Vale Config Root**: `/vale.ini` at repository root configures linting styles 
- **MCP Server**: `/mcp-google-docs/` contains the Node.js MCP server implementation
- **Shared Styles**: `/styles/` directory contains Vale style rules (Google, proselint, alex, etc.)

### Service Boundary Design
- `GoogleDocsService` class handles both Google API operations AND Vale CLI integration
- Vale config path is injected via constructor: `new GoogleDocsService(valeConfigPath)`
- All Vale operations use `../vale.ini` relative path from the MCP server directory

## Critical Developer Workflows

### Build & Development
```bash
cd mcp-google-docs/
npm install && npm run build  # Always build after changes
```

### Testing Strategy (6 Usage Modes)
1. **Web Interface**: `npm run web` → `http://localhost:8080/web-interface.html`
2. **CLI Interactive**: `npm run cli` (no Google setup needed)
3. **HTTP API**: `npm run http` → REST endpoints at `localhost:3000`
4. **Python Client**: `python3 test_client.py`
5. **Claude Desktop**: Use `claude_desktop_config.example.json` template
6. **MCP Standalone**: `npm start` (stdio protocol)

### Vale-First Development
- Vale functionality works immediately (no Google setup required)
- Google Docs features require OAuth setup (`npm run auth`)
- Test Vale integration: `python3 test_vale_direct.py`

## Project-Specific Conventions

### Environment Variable Pattern
```bash
VALE_CONFIG_PATH="../vale.ini"  # Relative to mcp-google-docs/
GOOGLE_CREDENTIALS_PATH="./credentials.json"
GOOGLE_TOKEN_PATH="./token.json"
```

### Error Handling Philosophy
- Vale CLI errors (exit code != 0) are **expected behavior** when issues found
- Google API failures should gracefully degrade (Vale still works)
- Temporary file cleanup is critical in Vale operations

### Multi-Mode Architecture
- Same core `GoogleDocsService` used across all 6 interfaces
- HTTP server (`http-server-simple.js`) wraps MCP tools as REST endpoints
- Web interface (`web-interface.html`) calls HTTP API, not MCP directly

## Integration Points

### Vale CLI Integration
- Uses `subprocess.exec()` with JSON output: `vale --config="../vale.ini" --output=JSON`
- Temporary files created in `./temp/` directory for text linting
- Results parsed into `ValeLintResult` interface with errors/warnings/suggestions

### Google APIs
- OAuth2 flow: `credentials.json` → `npm run auth` → `token.json`
- Uses Google Docs API v1 and Drive API for document operations
- Automatic token refresh handled by `google-auth-library`

### MCP Protocol
- Server name: `mcp-google-docs-server`
- Tools: `create_document`, `get_document`, `lint_document`, `lint_text`, `vale_status`
- Zod schemas define all tool parameters with descriptions

## Critical Files for Understanding

- `src/google-docs-service.ts`: Core service class (428 lines)
- `src/index.ts`: MCP server definition with tool schemas (403 lines)
- `http-server-simple.js`: Express wrapper for web/REST access (291 lines)
- `vale.ini`: Centralized linting configuration with 6 style packages
- `package.json`: Scripts define the 6 usage modes (`web`, `cli`, `http`, etc.)

## Development Anti-Patterns to Avoid

- Don't modify Vale config without testing all 6 usage modes
- Never run `npm install` in root directory (only in `mcp-google-docs/`)
- Don't hardcode paths - always use environment variables or relative paths
- Avoid breaking the "Vale works without Google" principle