# MCP Vale Server

Um servidor Model Context Protocol (MCP) para verificação de qualidade de texto usando Vale, permitindo análise de estilo e gramática através de IA.

## Funcionalidades

- ✅ **Fazer lint de texto com Vale** - Analisar qualidade e estilo de texto
- ✅ **Verificar status do Vale** - Confirmar se Vale está instalado e configurado
- ✅ **Múltiplos estilos de verificação** - Google, proselint, alex, WC-Styles, Aspect
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

## Configuração do Google Cloud

### 1. Criar um projeto no Google Cloud Console

1. Vá para o [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Ative as APIs necessárias:
   - Google Docs API
   - Google Drive API

### 2. Configurar credenciais OAuth 2.0

1. Vá para "APIs & Services" > "Credentials"
2. Clique em "Create Credentials" > "OAuth client ID"
3. Escolha "Desktop application"
4. Baixe o arquivo JSON das credenciais
5. Renomeie o arquivo para `credentials.json` e coloque na raiz do projeto

### 3. Gerar token de acesso

Execute o script de autenticação para gerar o `token.json`:

```bash
npm run auth
```

Isso abrirá um navegador para autenticar com sua conta Google.

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
    "google-docs": {
      "command": "node",
      "args": ["/caminho/para/mcp-google-docs/dist/index.js"],
      "env": {
        "GOOGLE_CREDENTIALS_PATH": "/caminho/para/credentials.json",
        "GOOGLE_TOKEN_PATH": "/caminho/para/token.json"
      }
    }
  }
}
```

## Ferramentas Disponíveis

### `create_google_doc`
Cria um novo documento do Google Docs.

**Parâmetros:**
- `title` (string): Título do novo documento

### `get_google_doc`
Obtém o conteúdo de um documento do Google Docs.

**Parâmetros:**
- `documentId` (string): ID do documento do Google Docs

### `update_google_doc`
Atualiza o conteúdo de um documento do Google Docs existente.

**Parâmetros:**
- `documentId` (string): ID do documento
- `content` (string): Novo conteúdo para o documento

### `search_google_docs`
Pesquisa documentos do Google Docs por título.

**Parâmetros:**
- `query` (string): Termo de pesquisa
- `maxResults` (number, opcional): Número máximo de resultados (padrão: 10)

### `list_google_docs`
Lista documentos recentes do Google Docs.

**Parâmetros:**
- `maxResults` (number, opcional): Número máximo de documentos (padrão: 10)

### `lint_google_doc`
Faz lint de um documento do Google Docs usando Vale style checker.

**Parâmetros:**
- `documentId` (string): ID do documento do Google Docs

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
- **Interface Web**: http://localhost:8084/web-interface.html
- Visual, intuitiva, sem configuração

### ✅ **Para uso em linha de comando:**
- **CLI JavaScript**: `node src/cli-simple.js`
- Funciona imediatamente, sem erros de compilação

### ⚠️ **Para desenvolvedores TypeScript:**
- **CLI TypeScript**: `src/cli.ts`
- **Nota**: Tem erros de tipagem que precisam ser corrigidos
- Requer compilação prévia com `npm run build`

### 🤖 **Para integração com Claude Desktop:**
- **MCP Server**: Configuração no claude_desktop_config.json
- Melhor para uso regular com Claude

### 🔧 **Para integração com outras aplicações:**
- **API HTTP**: Endpoints REST para integração
- Ideal para desenvolvimento de outras interfaces

## Estrutura do Projeto

```
src/
├── index.ts              # Servidor MCP principal
├── google-docs-service.ts # Serviço de integração com Google Docs
└── auth.ts               # Script de autenticação (a ser criado)
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

- `GOOGLE_CREDENTIALS_PATH`: Caminho para o arquivo credentials.json
- `GOOGLE_TOKEN_PATH`: Caminho para o arquivo token.json
- `VALE_CONFIG_PATH`: Caminho para o arquivo vale.ini (padrão: ./vale.ini)

## Problemas Comuns

### Erro de autenticação
- Verifique se os arquivos `credentials.json` e `token.json` estão no lugar correto
- Certifique-se de que as APIs necessárias estão habilitadas no Google Cloud Console

### Permissões
- O servidor precisa de acesso às APIs do Google Docs e Google Drive
- Certifique-se de que sua conta tem permissão para acessar os documentos

## Licença

MIT