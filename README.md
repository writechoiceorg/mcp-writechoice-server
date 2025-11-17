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
    `npm install`

3. Instale o Vale (verificador de estilo):

    - macOS
    `brew install vale`

    - Ubuntu/Debian
    `sudo apt install vale`

    - ou baixe de [https://github.com/errata-ai/vale/releases](https://github.com/errata-ai/vale/releases)  

4. Compile o projeto:
    `npm run build`

> Observação: Para desenvolver, use `npm run dev` para modo watch.

## 🚀 Formas de Usar

Este projeto oferece **múltiplas formas de uso** para atender diferentes necessidades:

### 🌟 **Comando Único** (Mais fácil!)
    # ⭐ RECOMENDADO: Inicia ambos servidores com um comando
    `npm run start-npm` 

    # Alternativas (mesma funcionalidade):
    `npm run start-js`     # Versão Node.js
    `./start-servers.sh`   # Versão Bash (se disponível)

### 🖥️ **Interface Web Tradicional** (Dois comandos)
    - Terminal 1: Iniciar API HTTP
    `npm run http`

    - Terminal 2: Iniciar interface web  
    `npm run web`

    - Acesse:  `http://localhost:8080/web-interface.html` 

### 🤖 **MCP Server** (Para Claude Desktop)
    `npm start`

### 📡 **API HTTP Direta**
    
    - Testar via curl/API calls
    
    ```bash
    curl -X POST http://localhost:3000/vale/lint \
      -H "Content-Type: application/json" \
      -d '{"text":"Your text here","fileName":"test.md"}'
    ```

## 🧩 Rodando o MCP com Gemini-CLI

Se você usa um cliente/CLI chamado "Gemini-CLI" (ou similar) para gerenciar servidores MCP e conectar assistentes, aqui está um guia prático para executar este servidor com o Gemini-CLI. As instruções abaixo são intencionais e genéricas — adapte flags/nomes/paths para o formato exato do Gemini-CLI que você usa.

1. Pré-requisitos
    - Tenha o projeto compilado (`npm run build`) ou execute em modo standalone (`npm start`).
    - Tenha Vale instalado e configurado (veja seção de instalação).
    - Tenha o Gemini-CLI instalado e configurado localmente (siga a documentação do CLI que você utiliza).

2. Iniciando o servidor MCP localmente (modo stdio / MCP)
    - Modo standalone (stdio MCP):
        `npm start`

    - Ou, se preferir usar apenas o MCP server (arquivo compilado):
        `node ./dist/index.js`

3. Exemplo de configuração do Gemini-CLI
    - Abaixo está um exemplo ilustrativo de um arquivo de configuração JSON que aponta para o servidor MCP deste repositório. Ajuste os caminhos conforme seu ambiente.
    ```json
    {
        "mcpServers": {
            "vale-server": {
                "command": "node",
                "args": ["./dist/index.js"],
                "env": {
                    "VALE_CONFIG_PATH": "./vale.ini"
                },
                "stdin": true,
                "protocol": "mcp"
            }
        }
    }
    ```

    - Observações:
      - `args`: caminho para o `dist/index.js` gerado pelo `npm run build`.
      - `VALE_CONFIG_PATH`: caminho relativo ou absoluto para o `vale.ini`.
      - `stdin`/`protocol`: campos ilustrativos — alguns CLIs usam chaves diferentes para indicar que o processo fala MCP por stdio ou socket; verifique o formato exato do seu Gemini-CLI.

4. Iniciando via Gemini-CLI
    - Com a configuração acima salva (por exemplo `gemini-config.json`), um comando típico pode ser:

        `gemini-cli --config ./gemini-config.json run vale-server`

    - Dependendo do cliente, você pode ter subcomandos diferentes, como `start`, `run`, `attach` ou similar. Consulte a documentação do seu Gemini-CLI para a sintaxe correta.

5. Fluxos comuns
    - Fluxo A (CLI gerencia processo):
        - Gemini-CLI inicia o `vale-server` com stdio MCP.
        - O assistente/cliente conecta via MCP e usa as ferramentas (`lint_text`, `vale_status`, etc.).

    - Fluxo B (servidor já em execução):
        - Você executa `npm start` separadamente.
        - Configure o Gemini-CLI para se conectar ao processo em `stdin`/socket/porta conforme suportado.

6. Dicas de troubleshooting
    - Se o Gemini-CLI não conectar:
      - Verifique se o processo `node ./dist/index.js` está rodando e não travou com erro.
      - Confirme `VALE_CONFIG_PATH` correto e que `vale.ini` e diretório `styles/` existem.
      - Rode `npm run build` novamente se os arquivos em `dist/` estiverem faltando.
    - Se o Vale retornar erros:
      - Vale pode retornar código de saída != 0 quando encontra problemas de lint — isso é comportamento esperado. Use a ferramenta `vale_status` ou `vale --version` para validar instalação.
    - Logs:
      - Ative logs detalhados no Gemini-CLI (se disponível) e no MCP server (ex.: variável de ambiente `DEBUG` ou flags de verbose) para diagnosticar handshake MCP.

7. Exemplo mínimo passo-a-passo
    1. Build:
        `npm run build`
    2. Criar `gemini-config.json` (ajuste caminhos)
    3. Iniciar com o Gemini-CLI:
        `gemini-cli --config ./gemini-config.json run vale-server`
    4. No cliente/assistente, selecione o servidor `vale-server` e execute ferramentas como `lint_text`.

Se você me disser qual é o repositório/executável exato do Gemini-CLI que está usando (ou colar o exemplo do config esperado), eu adapto o snippet de configuração e o comando final para o formato exato do seu CLI.

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

    # 🚀 Iniciar tudo (RECOMENDADO)
    `npm run start-npm`

    # 🧪 Testar funcionalidade
    `npm run test-server`

    # 🔨 Compilar TypeScript
    `npm run build`

    # 🌐 Apenas interface web
    `npm run web`

    # 📡 Apenas API HTTP
    `npm run http`

## 💡 Guia de Escolha da Interface

### ✅ **Para iniciantes ou teste rápido:**
- **Interface Web**: `http://localhost:8080/web-interface.html`
- Visual, intuitiva, sem configuração

### 🤖 **Para integração com Claude Desktop:**
- **MCP Server**: Configuração no claude_desktop_config.json
- Melhor para uso regular com Claude

### 🔧 **Para integração com outras aplicações:**
- **API HTTP**: Endpoints REST para integração
- Ideal para desenvolvimento de outras interfaces

## Estrutura do Projeto

```txt
    src/
    ├── index.ts           # Servidor MCP principal
    ├── vale-service.ts    # Serviço de integração com Vale
    └── test.ts            # Testes do servidor
```

## Desenvolvimento

    - Modo de desenvolvimento (watch)
    `npm run dev`

    - Build
    `npm run build`

    - Testes
    `npm test`

## Variáveis de Ambiente

- `VALE_CONFIG_PATH`: Caminho para o arquivo vale.ini (padrão: ./vale.ini)

## Problemas Comuns

### Vale não encontrado

- Certifique-se de que o Vale está instalado:
    - macOS
    `brew install vale`
    
    - Ubuntu/Debian
    `sudo apt install vale`
    
    - Windows
    `choco install vale`
    
    - ou baixe de [https://github.com/errata-ai/vale/releases](https://github.com/errata-ai/vale/releases)

### Problemas de configuração
- Verifique se o arquivo `vale.ini` está no local correto
- Certifique-se de que os estilos necessários estão no diretório `styles/`

## Licença

MIT
