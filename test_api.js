const fetch = require('node-fetch');

// Configurações de teste
const API_BASE_URL = 'http://localhost:10000';

// Dados de teste
const dadosTeste = {
  valor: 1000, // R$ 10,00 em centavos
  nome: 'João da Silva',
  email: 'joao@gmail.com',
  telefone: '65992251655',
  cpf: '97098238090'
};

async function testarAPI() {
  console.log('🧪 Iniciando testes da API...\n');

  try {
    // Teste 1: Verificar status da API
    console.log('1️⃣ Testando endpoint de status...');
    const statusResponse = await fetch(`${API_BASE_URL}/status`);
    const statusData = await statusResponse.json();

    if (statusResponse.ok) {
      console.log('✅ Status OK:', statusData);
    } else {
      console.log('❌ Erro no status:', statusData);
    }
    console.log('');

    // Teste 2: Testar geração de PIX com dados válidos
    console.log('2️⃣ Testando geração de PIX com dados válidos...');
    const pixResponse = await fetch(`${API_BASE_URL}/gerar-pix`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dadosTeste)
    });

    const pixData = await pixResponse.json();

    if (pixResponse.ok) {
      console.log('✅ PIX gerado com sucesso:', pixData);
    } else {
      console.log('❌ Erro ao gerar PIX:', pixData);
    }
    console.log('');

    // Teste 3: Testar com dados inválidos (CPF)
    console.log('3️⃣ Testando com CPF inválido...');
    const dadosInvalidos = { ...dadosTeste, cpf: '123' };
    const invalidResponse = await fetch(`${API_BASE_URL}/gerar-pix`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dadosInvalidos)
    });

    const invalidData = await invalidResponse.json();

    if (!invalidResponse.ok) {
      console.log('✅ Validação funcionando:', invalidData);
    } else {
      console.log('❌ Validação falhou:', invalidData);
    }
    console.log('');

    // Teste 4: Testar com campos faltando
    console.log('4️⃣ Testando com campos obrigatórios faltando...');
    const dadosIncompletos = { valor: 1000, nome: 'João' };
    const incompleteResponse = await fetch(`${API_BASE_URL}/gerar-pix`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dadosIncompletos)
    });

    const incompleteData = await incompleteResponse.json();

    if (!incompleteResponse.ok) {
      console.log('✅ Validação de campos obrigatórios funcionando:', incompleteData);
    } else {
      console.log('❌ Validação de campos obrigatórios falhou:', incompleteData);
    }

  } catch (error) {
    console.error('❌ Erro durante os testes:', error.message);
    console.log('\n💡 Certifique-se de que a API está rodando em', API_BASE_URL);
  }
}

// Executar testes se o arquivo for chamado diretamente
if (require.main === module) {
  testarAPI();
}

module.exports = { testarAPI };

