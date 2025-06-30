const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Defina essas variáveis no ambiente do Render (ou .env local)
const SECRET_KEY = process.env.SECRET_KEY;

app.post('/gerar-pix', async (req, res) => {
  const { valor } = req.body;

  if (!valor || isNaN(valor) || !Number.isInteger(valor)) {
    return res.status(400).json({ error: 'O valor deve ser inteiro e em centavos (ex: 1000 = R$10,00)' });
  }

  const auth = Buffer.from(`${SECRET_KEY}:x`).toString('base64');

  const payload = {
    amount: valor,
    paymentMethod: 'pix',
    description: `Pagamento de R$${(valor / 100).toFixed(2)}`,
    external_id: 'pedido_' + Date.now(),
    postbackUrl: 'https://seusite.com/postback', // ou null, se não tiver
    customer: {
      name: 'Gabriel Vieira',
      email: 'gabriel@email.com',
      phone: '11999999999',
      document: {
        number: '12345678910',
        type: 'cpf'
      },
      address: {
        street: 'Rua República Argentina',
        streetNumber: '4214',
        complement: null,
        zipCode: '11065030',
        neighborhood: 'Pompéia',
        city: 'Santos',
        state: 'SP',
        country: 'BR'
      }
    },
    items: [
      {
        title: 'Produto X',
        unitPrice: valor,
        quantity: 1,
        tangible: false
      }
    ]
  };

  try {
    const response = await fetch('https://api.masterpagamentosbr.com/v1/transactions', {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + auth,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Erro da API:', data);
      return res.status(response.status).json(data);
    }

    return res.json(data);
  } catch (err) {
    console.error('Erro no servidor:', err);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
