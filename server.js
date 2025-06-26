const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const SECRET_KEY = 'sk_live_v2Q9kTcgVp92SAl7Q87UarEQeXXnqvg4mtCoUufvJI'; // sua chave fixa aqui

app.post('/gerar-pix', async (req, res) => {
  const { value } = req.body;

  if (!value || typeof value !== 'number' || value <= 0) {
    return res.status(400).json({ error: 'O campo "value" deve ser um número válido e maior que zero.' });
  }

  const valorCentavos = Math.round(value * 100);
  const auth = Buffer.from(`${SECRET_KEY}:x`).toString('base64');

  const body = {
    amount: valorCentavos,
    paymentMethod: "pix",
    items: [
      {
        title: "Produto Teste",
        quantity: 1,
        unitPrice: valorCentavos,
        tangible: false
      }
    ],
    customer: {
      name: "Gabriel Vieira",
      email: "gabriel@email.com",
      phone: "27996959606", // Campo necessário
      document: {
        number: "16695900701",
        type: "cpf"
      }
    }
  };

  const options = {
    method: "POST",
    headers: {
      Authorization: 'Basic ' + auth,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  };

  try {
    const response = await fetch('https://api.masterpagamentosbr.com/v1/transactions', options);
    const data = await response.json();

    if (!response.ok) {
      console.error('Erro da API Master Pagamentos:', data);
      return res.status(response.status).json({ error: data.message || 'Erro ao gerar pagamento' });
    }

    return res.json({
      pix: data.pix,
      secureUrl: data.secureUrl,
      amount: data.amount
    });
  } catch (error) {
    console.error('Erro interno no servidor:', error);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
