const express = require('express');
const fetch = require('node-fetch'); // para usar fetch no Node.js
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const SECRET_KEY = process.env.SECRET_KEY;

app.post('/gerar-pix', async (req, res) => {
  const { value } = req.body;

  if (!value || typeof value !== 'number') {
    return res.status(400).json({ error: 'O campo "value" deve ser um número válido.' });
  }

  const auth = Buffer.from(`${SECRET_KEY}:x`).toString('base64');

  const body = {
    amount: value,
    paymentMethod: "pix",
    items: [
      {
        name: "Pagamento via Pix",
        quantity: 1,
        unit_price: value
      }
    ],
    description: `Pagamento de R$${value}`,
    external_id: 'pedido_' + Date.now()
  };

  const options = {
    method: "POST",
    headers: {
      authorization: 'Basic ' + auth,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  };

  try {
    const response = await fetch('https://api.masterpagamentosbr.com/v1/transactions', options);
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.json(data);
  } catch (error) {
    console.error('Erro interno no servidor:', error);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
