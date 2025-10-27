#!/usr/bin/env node

/**
 * Servidor HTTP simples para testar o MCP Vale
 * Sem TypeScript - apenas JavaScript puro para evitar erros de compilação
 */

import express from 'express';
import { spawn } from 'child_process';
import { promisify } from 'util';
import { exec } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const execAsync = promisify(exec);

const app = express();
app.use(express.json());

// Configuração CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Configuração do Vale
const VALE_CONFIG = path.resolve(__dirname, 'vale.ini');

// Função para executar Vale lint
async function runValeLint(text, fileName = 'document.md') {
  try {
    // Criar arquivo temporário
    const tempDir = path.join(__dirname, 'temp');
    await fs.mkdir(tempDir, { recursive: true });
    
    const tempFilePath = path.join(tempDir, fileName);
    await fs.writeFile(tempFilePath, text, 'utf8');

    // Executar Vale
    const valeCommand = `vale --config="${VALE_CONFIG}" --output=JSON "${tempFilePath}"`;
    
    let stdout = '';
    let stderr = '';
    
    try {
      const result = await execAsync(valeCommand);
      stdout = result.stdout;
      stderr = result.stderr;
    } catch (error) {
      // Vale retorna exit code 1 quando encontra problemas, mas isso é normal
      // Vamos processar stdout mesmo com erro
      stdout = error.stdout || '';
      stderr = error.stderr || '';
      
      // Se não há stdout, pode ser erro real
      if (!stdout && stderr) {
        console.error('Vale error:', stderr);
        throw new Error(`Vale execution failed: ${stderr}`);
      }
    }
    
    let valeOutput = {};
    if (stdout.trim()) {
      try {
        valeOutput = JSON.parse(stdout);
      } catch (parseError) {
        console.warn('Failed to parse Vale JSON output:', parseError);
        console.warn('Raw stdout:', stdout);
        console.warn('Raw stderr:', stderr);
      }
    }

    const fileResults = valeOutput[tempFilePath] || [];
    
    const errors = [];
    const warnings = [];
    const suggestions = [];

    fileResults.forEach((issue) => {
      const lintError = {
        line: issue.Line || 0,
        column: issue.Span?.[0] || 0,
        message: issue.Message || '',
        severity: issue.Severity || 'suggestion',
        rule: issue.Check || 'unknown',
        suggestion: issue.Action?.Name || undefined,
      };

      switch (issue.Severity?.toLowerCase()) {
        case 'error':
          errors.push(lintError);
          break;
        case 'warning':
          warnings.push(lintError);
          break;
        default:
          suggestions.push(lintError);
      }
    });

    // Limpar arquivo temporário
    try {
      await fs.unlink(tempFilePath);
    } catch (e) {
      // Ignorar erro de limpeza
    }

    return { errors, warnings, suggestions };
  } catch (error) {
    throw new Error(`Failed to run Vale lint: ${error.message}`);
  }
}

// Verificar status do Vale
async function checkValeStatus() {
  try {
    const { stdout } = await execAsync('vale --version');
    return {
      installed: true,
      version: stdout.trim(),
    };
  } catch (error) {
    return {
      installed: false,
      error: error.code === 'ENOENT' ? 'Vale is not installed or not found in PATH' : error.message,
    };
  }
}

// Rotas da API

// Página inicial com documentação
app.get('/', (req, res) => {
  res.json({
    message: '🚀 MCP Vale HTTP API',
    status: 'online',
    endpoints: {
      'GET /vale/status': 'Verifica status do Vale',
      'POST /vale/lint': 'Faz lint de texto { text, fileName? }',
      'GET /test': 'Endpoint de teste'
    },
    example: {
      'lint_request': {
        'url': 'POST /vale/lint',
        'body': {
          'text': 'Your text here',
          'fileName': 'document.md'
        }
      }
    }
  });
});

// Verificar status do Vale
app.get('/vale/status', async (req, res) => {
  try {
    const status = await checkValeStatus();
    
    let response = 'Vale Installation Status:\n\n';
    
    if (status.installed) {
      response += `✅ Vale is installed\n`;
      response += `Version: ${status.version}\n`;
      response += `Config Path: ${VALE_CONFIG}\n\n`;
      response += `Available rules:\n`;
      response += `- Vale (basic rules)\n`;
      response += `- Google (style guide)\n`;
      response += `- proselint (prose checks)\n`;
      response += `- alex (inclusive language)\n`;
      response += `- WC-Styles (max 20 words per sentence)\n`;
    } else {
      response += `❌ Vale is not installed or not accessible\n`;
      response += `Error: ${status.error}\n\n`;
      response += `To install Vale:\n`;
      response += `- macOS: brew install vale\n`;
      response += `- Linux: Download from https://github.com/errata-ai/vale/releases\n`;
      response += `- Windows: choco install vale\n`;
    }
    
    res.json({
      result: {
        content: [{ text: response }]
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Fazer lint de texto
app.post('/vale/lint', async (req, res) => {
  try {
    const { text, fileName } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    
    const result = await runValeLint(text, fileName || 'document.md');
    
    // Formatar resultado
    const totalIssues = result.errors.length + result.warnings.length + result.suggestions.length;
    let formattedResult = `Vale Lint Results for ${fileName || 'document.md'}\n`;
    formattedResult += `Total Issues: ${totalIssues}\n\n`;
    
    if (result.errors.length > 0) {
      formattedResult += `🚨 ERRORS (${result.errors.length}):\n`;
      result.errors.forEach((error) => {
        formattedResult += `  Line ${error.line}: ${error.message} (${error.rule})\n`;
      });
      formattedResult += '\n';
    }
    
    if (result.warnings.length > 0) {
      formattedResult += `⚠️ WARNINGS (${result.warnings.length}):\n`;
      result.warnings.forEach((warning) => {
        formattedResult += `  Line ${warning.line}: ${warning.message} (${warning.rule})\n`;
      });
      formattedResult += '\n';
    }
    
    if (result.suggestions.length > 0) {
      formattedResult += `💡 SUGGESTIONS (${result.suggestions.length}):\n`;
      result.suggestions.forEach((suggestion) => {
        formattedResult += `  Line ${suggestion.line}: ${suggestion.message} (${suggestion.rule})\n`;
      });
      formattedResult += '\n';
    }
    
    if (totalIssues === 0) {
      formattedResult += '✅ No issues found! Your text follows all Vale style guidelines.\n';
    }
    
    formattedResult += '\n📊 Analysis Summary:\n';
    formattedResult += '- Text analyzed successfully\n';
    formattedResult += '- Checked rules: Vale, Google, proselint, alex, WC-Styles\n';
    if (totalIssues > 0) {
      formattedResult += `- Found ${totalIssues} suggestions for improvement\n`;
    } else {
      formattedResult += '- Text quality: Excellent!\n';
    }
    
    res.json({
      result: {
        content: [{ text: formattedResult }]
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint de teste
app.get('/test', (req, res) => {
  res.json({
    message: '✅ Server is working!',
    timestamp: new Date().toISOString(),
    vale_config: VALE_CONFIG
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 MCP HTTP Server running on port ${PORT}`);
  console.log(`📝 Access http://localhost:${PORT} for API documentation`);
  console.log(`🔍 Test Vale: curl -X POST http://localhost:${PORT}/vale/lint -H "Content-Type: application/json" -d '{"text":"Test text"}'`);
  console.log('');
  console.log('✅ Server ready for web interface connections!');
});

// Cleanup ao sair
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  process.exit(0);
});