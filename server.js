const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const SECRET_KEY = process.env.SECRET_KEY; // Defina sua chave aqui ou em .env
const POSTBACK_URL = process.env.POSTBACK_URL || 'https://seusite.com/postback';

app.post('/gerar-pix', async (req, res) => {
  const { valor, nome, email, telefone, cpf } = req.body;

  if (!valor || !nome || !email || !telefone || !cpf) {
    return res.status(400).json({ error: 'Campos obrigatórios faltando' });
  }

  const auth = Buffer.from(`${SECRET_KEY}:x`).toString('base64');

  const body = {
    amount: valor,
    paymentMethod: 'pix',
    customer: {
      name: nome,
      email,
      phone: telefone,
      document: {
        number: cpf,
        type: 'cpf'
      }
    },
    items: [
      {
        title: 'Pagamento',
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
    const response = await fetch('https://api.masterpagamentosbr.com/v1/transactions', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Erro API:', data);
      return res.status(response.status).json(data);
    }

    res.json(data);
  } catch (err) {
    console.error('Erro interno:', err);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
