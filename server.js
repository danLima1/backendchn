const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Configurações do proxy BrightData
const PROXY_CONFIG = {
    host: 'brd.superproxy.io',
    port: '33335',
    auth: {
        username: 'brd-customer-hl_a5695247-zone-residential_proxy1',
        password: '9bt6utixk5tb'
    }
};

app.use(bodyParser.json());
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rota para consulta de CPF
app.get('/consulta-cpf/:cpf', async (req, res) => {
    try {
        const { cpf } = req.params;

        // Faz a requisição usando o proxy
        const response = await axios.get(
            `https://x-search.xyz/3nd-p01n75/xsiayer0-0t/lunder231224/r0070x/05/cpf.php?cpf=${cpf}`,
            {
                proxy: {
                    host: PROXY_CONFIG.host,
                    port: PROXY_CONFIG.port,
                    auth: PROXY_CONFIG.auth,
                    protocol: 'http'
                },
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'application/json',
                    'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7'
                },
                // Ignora erros de SSL
                httpsAgent: new (require('https').Agent)({
                    rejectUnauthorized: false
                })
            }
        );

        res.json(response.data);
    } catch (error) {
        console.error('Erro na consulta:', error);
        res.status(500).json({ 
            status: 0, 
            error: 'Erro ao consultar CPF',
            details: error.message 
        });
    }
});

// Rota para criar transação PIX
app.post('/api/create-transaction', async (req, res) => {
    try {
        console.log("Recebendo dados para criar transação PIX:", JSON.stringify(req.body, null, 2));

        const { paymentMethod, amount, description, customer, items, pix } = req.body;

        if (!paymentMethod || !amount || !description || !customer || !items || !pix) {
            return res.status(400).json({ message: 'Campos obrigatórios faltando.' });
        }

        const payload = {
            paymentMethod: paymentMethod,
            amount: amount,
            description: description,
            customer: {
                name: customer.name,
                document: customer.document,
                email: generateRandomEmail()
            },
            items: items,
            pix: pix
        };

        console.log("Payload mapeado para PagShield:", JSON.stringify(payload, null, 2));

        const response = await axios.post('https://api.pagshield.io/v1/transactions', payload, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + Buffer.from(`${SECRET_KEY}:x`).toString('base64'),
            },
        });

        console.log("Transação criada com sucesso:", JSON.stringify(response.data, null, 2));
        res.json(response.data);
    } catch (error) {
        console.error("Erro ao criar transação PIX:", error.message);
        if (error.response) {
            console.error("Dados do erro da API:", JSON.stringify(error.response.data, null, 2));
            res.status(error.response.status).json(error.response.data);
        } else {
            res.status(500).json({ message: 'Erro interno do servidor.', details: error.message });
        }
    }
});

// Rota para obter detalhes da transação
app.get('/api/transactions/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`Recebendo solicitação para detalhes da transação com ID: ${id}`);

        const response = await axios.get(`https://api.pagshield.io/v1/transactions/${id}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + Buffer.from(`${SECRET_KEY}:x`).toString('base64'),
            },
        });
        console.log("Detalhes da transação obtidos com sucesso:", JSON.stringify(response.data, null, 2));
        res.json(response.data);
    } catch (error) {
        console.error(`Erro ao obter detalhes da transação com ID ${id}:`, error.message);
        if (error.response) {
            console.error("Dados do erro da API:", JSON.stringify(error.response.data, null, 2));
            res.status(error.response.status).json(error.response.data);
        } else {
            res.status(500).json({ message: 'Erro interno do servidor.', details: error.message });
        }
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
}); 
