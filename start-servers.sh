#!/bin/bash

# Script para iniciar ambos os servidores MCP Vale
# HTTP API Server (porta 3000) + Web Interface Server (porta 8080)

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Iniciando MCP Vale Servers...${NC}"
echo ""

# Verificar se as portas estão em uso
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo -e "${YELLOW}⚠️  Porta $1 já está em uso. Tentando liberar...${NC}"
        lsof -ti:$1 | xargs kill -9 2>/dev/null || true
        sleep 1
    fi
}

# Liberar portas se necessário
check_port 3000
check_port 8080

# Função para cleanup quando o script é interrompido
cleanup() {
    echo ""
    echo -e "${RED}🛑 Parando servidores...${NC}"
    jobs -p | xargs -r kill 2>/dev/null
    exit 0
}

# Capturar Ctrl+C
trap cleanup SIGINT SIGTERM

# Iniciar HTTP API Server (porta 3000)
echo -e "${GREEN}🔧 Iniciando HTTP API Server (porta 3000)...${NC}"
node http-server-simple.js &
API_PID=$!

# Aguardar um momento para o servidor HTTP iniciar
sleep 2

# Iniciar Web Interface Server (porta 8080)
echo -e "${GREEN}🌐 Iniciando Web Interface Server (porta 8080)...${NC}"
python3 -m http.server 8080 &
WEB_PID=$!

# Aguardar um momento para ambos servidores iniciarem
sleep 2

echo ""
echo -e "${GREEN}✅ Ambos servidores iniciados com sucesso!${NC}"
echo ""
echo -e "${BLUE}📡 HTTP API Server:${NC} http://localhost:3000"
echo -e "${BLUE}🌐 Web Interface:${NC}   http://localhost:8080/web-interface.html"
echo ""
echo -e "${YELLOW}💡 Dicas:${NC}"
echo "   • Use Ctrl+C para parar ambos os servidores"
echo "   • Teste a API: curl http://localhost:3000/vale/status"
echo "   • Abra a interface: http://localhost:8080/web-interface.html"
echo ""
echo -e "${GREEN}🎯 Servidores rodando... Pressione Ctrl+C para parar${NC}"

# Esperar por ambos os processos
wait $API_PID $WEB_PID