const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const SECRET_KEY = process.env.SECRET_KEY; // coloque sua chave real aqui

app.post('/gerar-pix', async (req, res) => {
  const { valor } = req.body;

  const auth = Buffer.from(`${SECRET_KEY}:x`).toString('base64');

  const options = {
    method: "POST",
    headers: {
      authorization: 'Basic ' + auth,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      value: valor,
      description: `Pagamento de R$${valor}`,
      external_id: 'pedido_' + Date.now()
    })
  };

  try {
    const response = await fetch('https://api.masterpagamentosbr.com/v1/transactions', options);
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
