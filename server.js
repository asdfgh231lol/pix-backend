const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Verificação das variáveis de ambiente
const SECRET_KEY = process.env.SECRET_KEY;
const POSTBACK_URL = process.env.POSTBACK_URL || 'https://seusite.com/postback';

if (!SECRET_KEY) {
  console.error('ERRO: SECRET_KEY não foi definida nas variáveis de ambiente');
  process.exit(1);
}

// Função para validar CPF (básica)
function validarCPF(cpf) {
  // Remove caracteres não numéricos
  cpf = cpf.replace(/[^\d]/g, '');

  // Verifica se tem 11 dígitos
  if (cpf.length !== 11) return false;

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  return true;
}

// Função para validar email
function validarEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// Função para validar telefone (formato brasileiro básico)
function validarTelefone(telefone) {
  // Remove caracteres não numéricos
  const tel = telefone.replace(/[^\d]/g, '');

  // Verifica se tem 10 ou 11 dígitos (com DDD)
  return tel.length >= 10 && tel.length <= 11;
}

app.post('/gerar-pix', async (req, res) => {
  const { valor, nome, email, telefone, cpf } = req.body;

  // Validação dos campos obrigatórios
  if (!valor || !nome || !email || !telefone || !cpf) {
    return res.status(400).json({
      error: 'Campos obrigatórios faltando',
      required: ['valor', 'nome', 'email', 'telefone', 'cpf']
    });
  }

  // Validações específicas
  if (!validarCPF(cpf)) {
    return res.status(400).json({ error: 'CPF inválido' });
  }

  if (!validarEmail(email)) {
    return res.status(400).json({ error: 'Email inválido' });
  }

  if (!validarTelefone(telefone)) {
    return res.status(400).json({ error: 'Telefone inválido' });
  }

  if (typeof valor !== 'number' || valor <= 0) {
    return res.status(400).json({ error: 'Valor deve ser um número positivo em centavos' });
  }

  // Preparação da autenticação
  const auth = Buffer.from(`${SECRET_KEY}:x`).toString('base64');

  // Corpo da requisição conforme documentação da API
  const body = {
    amount: valor, // Valor em centavos
    paymentMethod: 'pix',
    customer: {
      name: nome,
      email: email,
      phone: telefone,
      document: {
        number: cpf.replace(/[^\d]/g, ''), // Remove formatação do CPF
        type: 'cpf'
      }
    },
    items: [
      {
        title: 'Pagamento PIX',
        unitPrice: valor,
        quantity: 1,
        tangible: false
      }
    ],
    pix: {
      expiresInDays: 2
    },
    postbackUrl: POSTBACK_URL,
    traceable: false
  };

  try {
    console.log('Enviando requisição para Master Pagamentos:', {
      url: 'https://api.masterpagamentosbr.com/v1/transactions',
      method: 'POST',
      body: JSON.stringify(body, null, 2)
    });

    const response = await fetch('https://api.masterpagamentosbr.com/v1/transactions', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    console.log('Resposta da API:', {
      status: response.status,
      statusText: response.statusText,
      data: data
    });

    if (!response.ok) {
      console.error('Erro da API Master Pagamentos:', {
        status: response.status,
        statusText: response.statusText,
        error: data
      });

      return res.status(response.status).json({
        error: 'Erro na API Master Pagamentos',
        details: data,
        status: response.status
      });
    }

    // Sucesso - retorna os dados da transação
    res.json({
      success: true,
      transaction: data,
      message: 'PIX gerado com sucesso'
    });

  } catch (err) {
    console.error('Erro interno na requisição:', err);

    res.status(500).json({
      error: 'Erro interno no servidor',
      message: err.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Endpoint para verificar status da API
app.get('/status', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    environment: {
      SECRET_KEY_DEFINED: !!SECRET_KEY,
      POSTBACK_URL: POSTBACK_URL
    }
  });
});

// Endpoint para receber postbacks (webhook)
app.post('/postback', (req, res) => {
  console.log('Postback recebido:', req.body);

  // Aqui você pode processar as atualizações de status da transação
  // Por exemplo: atualizar banco de dados, enviar notificações, etc.

  res.status(200).json({ received: true });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Status: http://localhost:${PORT}/status`);
  console.log(`Gerar PIX: POST http://localhost:${PORT}/gerar-pix`);
  console.log(`Postback: POST http://localhost:${PORT}/postback`);
});

module.exports = app;