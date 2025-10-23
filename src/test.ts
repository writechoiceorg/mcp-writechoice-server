#!/usr/bin/env node

// Teste simples para verificar se o servidor MCP está funcionando
import { ValeService } from './vale-service.js';
import path from 'path';

async function testMCPServer() {
  console.log('🚀 Testando servidor MCP Vale...');
  console.log('✅ Dependências carregadas com sucesso');
  
  // Test Vale integration
  const valeConfigPath = path.resolve(process.cwd(), 'vale.ini');
  const service = new ValeService(valeConfigPath);
  
  console.log(`📝 Vale config path: ${valeConfigPath}`);
  
  // Check Vale installation
  const valeStatus = await service.checkValeInstallation();
  if (valeStatus.installed) {
    console.log(`✅ Vale está instalado: ${valeStatus.version}`);
    
    // Test lint functionality with sample text
    const sampleText = `Este é um texto de teste para Vale.
    
Você pode utilizar esta ferramenta para verificar a qualidade do seu texto. É muito útil.

Algumas palavras podem estar repetidas repetidas para testar o sistema.`;
    
    try {
      const lintResult = await service.lintTextWithVale(sampleText, 'test.md');
      console.log('✅ Teste de lint do Vale executado com sucesso');
      console.log(`📊 Encontrados: ${lintResult.errors.length} erros, ${lintResult.warnings.length} avisos, ${lintResult.suggestions.length} sugestões`);
    } catch (error: any) {
      console.log(`⚠️ Erro no teste de lint: ${error.message}`);
    }
  } else {
    console.log(`❌ Vale não está instalado: ${valeStatus.error}`);
  }
  
  console.log('');
  console.log('📝 Servidor MCP Vale pronto para uso');
  console.log('');
  console.log('Para usar o servidor:');
  console.log('1. Execute: npm start');
  console.log('');
  console.log('Ferramentas disponíveis:');
  console.log('- lint_text: Verificar qualidade de texto com Vale');
  console.log('- check_vale_status: Verificar instalação do Vale');
}

testMCPServer().catch((error) => {
  console.error('Erro no teste:', error);
  process.exit(1);
});