# MCP Vale Server

Um servidor Model Context Protocol (MCP) para verificação de qualidade de texto usando Vale, permitindo análise de estilo e gramática através de IA.

## Funcionalidades

- ✅ **Fazer lint de texto com Vale** - Analisar qualidade e estilo de texto
- ✅ **Verificar status do Vale** - Confirmar se Vale está instalado e configurado
- ✅ **Múltiplos estilos de verificação** - Google, proselint, alex, WC-Styles
- ✅ **Interface Web simples** - Interface gráfica para teste
- ✅ **API HTTP** - Endpoints REST para integração
- ✅ **Protocolo MCP nativo** - Integração direta com assistentes IA

## Instalação

1. Clone este repositório
2. Instale as dependências:
```bash
npm install
```

3. Instale o Vale (verificador de estilo):
```bash
# macOS
brew install vale

# Ubuntu/Debian
sudo apt install vale

# ou baixe de https://github.com/errata-ai/vale/releases
```

4. Compile o projeto:
```bash
npm run build
```

## 🚀 Formas de Usar

Este projeto oferece **múltiplas formas de uso** para atender diferentes necessidades:

### 🌟 **NOVO: Comando Único** (Mais fácil!)
```bash
# ⭐ RECOMENDADO: Inicia ambos servidores com um comando
npm run start-npm

# Alternativas (mesma funcionalidade):
npm run start-js     # Versão Node.js
./start-servers.sh   # Versão Bash (se disponível)
```

### 🖥️ **Interface Web Tradicional** (Dois comandos)
```bash
# Terminal 1: Iniciar API HTTP
npm run http

# Terminal 2: Iniciar interface web  
npm run web

# Acesse: http://localhost:8080/web-interface.html
```

### 🤖 **MCP Server** (Para Claude Desktop)
```bash
# Configure no Claude Desktop config
# Veja seção "Uso com Claude Desktop" abaixo
npm start
```

### 📡 **API HTTP Direta**
```bash
# Testar via curl/API calls
curl -X POST http://localhost:3000/vale/lint \
  -H "Content-Type: application/json" \
  -d '{"text":"Your text here","fileName":"test.md"}'
```

### 🔍 **Funcionalidades da Interface Web**
- 📁 **Upload de arquivos**: Suporte para .md, .mdx, .txt (máximo 1MB)
- 🖱️ **Drag-and-drop**: Arraste arquivos diretamente para a área de texto
- ✏️ **Edição manual**: Cole ou digite texto diretamente
- 🗑️ **Limpeza rápida**: Botão para limpar texto e reset da interface
- ⚡ **Análise em tempo real**: Resultados instantâneos do Vale

## Uso

### Como servidor standalone
```bash
npm start
```

### Integração com Claude Desktop

Adicione ao seu arquivo de configuração do Claude Desktop (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "vale-server": {
      "command": "node",
      "args": ["/caminho/para/mcp-vale-server/dist/index.js"],
      "env": {
        "VALE_CONFIG_PATH": "/caminho/para/vale.ini"
      }
    }
  }
}
```

## Ferramentas Disponíveis

### `lint_text`
Faz lint de texto usando Vale style checker.

**Parâmetros:**
- `text` (string): Conteúdo de texto para analisar
- `fileName` (string, opcional): Nome do arquivo para o texto (padrão: document.md)

### `check_vale_status`
Verifica se Vale está instalado e funcionando corretamente.

**Parâmetros:** Nenhum

## ⚡ Comandos Rápidos

```bash
# 🚀 Iniciar tudo (RECOMENDADO)
npm run start-npm

# 🧪 Testar funcionalidade
npm run test-server

# 🔨 Compilar TypeScript
npm run build

# 🌐 Apenas interface web
npm run web

# 📡 Apenas API HTTP
npm run http
```

## 💡 Guia de Escolha da Interface

### ✅ **Para iniciantes ou teste rápido:**
- **Interface Web**: http://localhost:8080/web-interface.html
- Visual, intuitiva, sem configuração

### 🤖 **Para integração com Claude Desktop:**
- **MCP Server**: Configuração no claude_desktop_config.json
- Melhor para uso regular com Claude

### 🔧 **Para integração com outras aplicações:**
- **API HTTP**: Endpoints REST para integração
- Ideal para desenvolvimento de outras interfaces

## Estrutura do Projeto

```
src/
├── index.ts           # Servidor MCP principal
├── vale-service.ts    # Serviço de integração com Vale
└── test.ts           # Testes do servidor
```

## Desenvolvimento

```bash
# Modo de desenvolvimento (watch)
npm run dev

# Build
npm run build

# Testes
npm test
```

## Variáveis de Ambiente

- `VALE_CONFIG_PATH`: Caminho para o arquivo vale.ini (padrão: ./vale.ini)

## Problemas Comuns

### Vale não encontrado
- Certifique-se de que o Vale está instalado:
  ```bash
  # macOS
  brew install vale
  
  # Ubuntu/Debian
  sudo apt install vale
  
  # ou baixe de https://github.com/errata-ai/vale/releases
  ```

### Problemas de configuração
- Verifique se o arquivo `vale.ini` está no local correto
- Certifique-se de que os estilos necessários estão no diretório `styles/`

## Licença

MIT