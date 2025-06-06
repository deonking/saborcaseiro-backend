const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
app.use(express.json());
app.use(cors());

const SECRET_KEY = 'sk_live_v28vVO72eFvHXOoujyHBcA3q0pRQQ8sKZeDK9prEsM';

app.post('/api/pix', async (req, res) => {
    try {
        console.log('Recebendo requisição /api/pix:', req.body);
        const { amount, payer, description, reference } = req.body;
        const payload = { amount, payer, description, reference };
        console.log('Enviando para ByNet:', payload);
        const response = await axios.post(
            'https://api.bynetglobal.com.br/v1/transactions',
            payload,
            {
                headers: {
                    'authorization': 'Basic ' + Buffer.from(`${SECRET_KEY}:x`).toString('base64'),
                    'Content-Type': 'application/json'
                }
            }
        );
        console.log('Resposta da ByNet:', response.data);
        res.json(response.data);
    } catch (error) {
        console.error('Erro na requisição ByNet:', error.response?.data || error.message);
        res.status(500).json({ error: error.response?.data || error.message });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Pix API server running on port ${PORT}`);
});
