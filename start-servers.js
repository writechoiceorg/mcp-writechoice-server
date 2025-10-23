#!/usr/bin/env node

// Script Node.js para iniciar ambos os servidores simultaneamente
// HTTP API Server (porta 3000) + Web Interface Server (porta 8080)

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cores para console
const colors = {
    green: '\x1b[32m',
    blue: '\x1b[34m', 
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    reset: '\x1b[0m'
};

console.log(`${colors.blue}🚀 Iniciando MCP Vale Servers...${colors.reset}\n`);

// Array para armazenar processos
const processes = [];

// Função para cleanup
function cleanup() {
    console.log(`\n${colors.red}🛑 Parando servidores...${colors.reset}`);
    processes.forEach(proc => {
        if (proc && !proc.killed) {
            proc.kill('SIGTERM');
        }
    });
    process.exit(0);
}

// Capturar sinais de interrupção
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

// Função para verificar se porta está em uso
function killProcessOnPort(port) {
    return new Promise((resolve) => {
        const killProcess = spawn('lsof', ['-ti', `:${port}`]);
        let pids = '';
        
        killProcess.stdout.on('data', (data) => {
            pids += data.toString();
        });
        
        killProcess.on('close', (code) => {
            if (pids.trim()) {
                console.log(`${colors.yellow}⚠️  Porta ${port} em uso. Liberando...${colors.reset}`);
                const killCmd = spawn('kill', ['-9', ...pids.trim().split('\n')]);
                killCmd.on('close', () => {
                    setTimeout(resolve, 1000);
                });
            } else {
                resolve();
            }
        });
        
        killProcess.on('error', () => resolve()); // Se lsof falhar, continua
    });
}

async function startServers() {
    try {
        // Liberar portas se necessário
        await killProcessOnPort(3000);
        await killProcessOnPort(8080);
        
        // Iniciar HTTP API Server
        console.log(`${colors.green}🔧 Iniciando HTTP API Server (porta 3000)...${colors.reset}`);
        const apiServer = spawn('node', ['http-server-simple.js'], {
            cwd: __dirname,
            stdio: ['ignore', 'pipe', 'pipe']
        });
        
        processes.push(apiServer);
        
        // Aguardar um momento
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Iniciar Web Interface Server
        console.log(`${colors.green}🌐 Iniciando Web Interface Server (porta 8080)...${colors.reset}`);
        const webServer = spawn('python3', ['-m', 'http.server', '8080'], {
            cwd: __dirname,
            stdio: ['ignore', 'pipe', 'pipe']
        });
        
        processes.push(webServer);
        
        // Aguardar um momento para ambos iniciarem
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        console.log(`\n${colors.green}✅ Ambos servidores iniciados com sucesso!${colors.reset}`);
        console.log(`\n${colors.blue}📡 HTTP API Server:${colors.reset} http://localhost:3000`);
        console.log(`${colors.blue}🌐 Web Interface:${colors.reset}   http://localhost:8080/web-interface.html`);
        console.log(`\n${colors.yellow}💡 Dicas:${colors.reset}`);
        console.log('   • Use Ctrl+C para parar ambos os servidores');
        console.log('   • Teste a API: curl http://localhost:3000/vale/status');
        console.log('   • Abra a interface: http://localhost:8080/web-interface.html');
        console.log(`\n${colors.green}🎯 Servidores rodando... Pressione Ctrl+C para parar${colors.reset}`);
        
        // Monitorar processos
        apiServer.on('error', (err) => {
            console.error(`${colors.red}❌ Erro no API Server: ${err.message}${colors.reset}`);
        });
        
        webServer.on('error', (err) => {
            console.error(`${colors.red}❌ Erro no Web Server: ${err.message}${colors.reset}`);
        });
        
        apiServer.on('exit', (code) => {
            if (code !== 0) {
                console.log(`${colors.red}❌ API Server saiu com código: ${code}${colors.reset}`);
            }
        });
        
        webServer.on('exit', (code) => {
            if (code !== 0) {
                console.log(`${colors.red}❌ Web Server saiu com código: ${code}${colors.reset}`);
            }
        });
        
        // Manter o processo principal vivo
        process.stdin.resume();
        
    } catch (error) {
        console.error(`${colors.red}❌ Erro ao iniciar servidores: ${error.message}${colors.reset}`);
        process.exit(1);
    }
}

// Iniciar servidores
startServers();