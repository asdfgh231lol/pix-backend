const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const SECRET_KEY = process.env.SECRET_KEY; // Defina no Render ou localmente

app.post('/gerar-pix', async (req, res) => {
  const { valor } = req.body; // valor em CENTAVOS, ex: 1500 = R$15,00

  // Verifica se valor está presente e é um número inteiro válido
  if (!valor || isNaN(valor) || !Number.isInteger(valor)) {
    return res.status(400).json({ error: "Campo 'valor' é obrigatório e deve ser um número inteiro em centavos." });
  }

  const auth = Buffer.from(`${SECRET_KEY}:x`).toString('base64');

  const options = {
    method: "POST",
    headers: {
      authorization: 'Basic ' + auth,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      value: valor, // valor em centavos (int)
      description: `Pagamento de R$${(valor / 100).toFixed(2)}`,
      external_id: 'pedido_' + Date.now(),
      paymentMethod: "pix",
      customer: {
        name: "João Teste",
        email: "joao@email.com",
        phone: "11999999999",
        document: {
          number: "28062080846",
          type: "cpf"
        }
      },
      items: [
        {
          title: "Produto Exemplo",
          unitPrice: valor,
          quantity: 1,
          tangible: true
        }
      ]
    })
  };

  try {
    const response = await fetch('https://api.masterpagamentosbr.com/v1/transactions', options);
    const data = await response.json();

    if (!response.ok) {
      console.error("Erro da API Master Pagamentos:", data);
      return res.status(response.status).json(data);
    }

    res.json(data);
  } catch (error) {
    console.error("Erro interno no servidor:", error);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
