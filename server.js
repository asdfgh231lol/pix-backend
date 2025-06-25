app.post('/gerar-pix', async (req, res) => {
  const { value } = req.body;

  if (!value || typeof value !== 'number') {
    return res.status(400).json({ error: 'O campo "value" deve ser um número válido.' });
  }

  const auth = Buffer.from(`${SECRET_KEY}:x`).toString('base64');

  const options = {
    method: "POST",
    headers: {
      authorization: 'Basic ' + auth,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      amount: value,
      paymentMethod: "pix",
      items: [
        {
          name: "Vaquinha",
          quantity: 1,
          unitPrice: value
        }
      ],
      customer: {
        name: "Bosta Liquida",
        email: "joao@email.com"
      }
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
    console.error('Erro interno no servidor:', error);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
});
