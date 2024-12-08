const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { ProxyAgent } = require('proxy-agent');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

// Configurações do proxy BrightData
const PROXY_URL = `http://brd-customer-hl_a5695247-zone-residential_proxy1:9bt6utixk5tb@brd.superproxy.io:33335`;

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

        // Cria um agente de proxy
        const agent = new ProxyAgent(PROXY_URL);

        console.log('Iniciando requisição para CPF:', cpf);

        const response = await fetch(
            `https://x-search.xyz/3nd-p01n75/xsiayer0-0t/lunder231224/r0070x/05/cpf.php?cpf=${cpf}`,
            {
                method: 'GET',
                agent,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'application/json',
                    'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
                    'Connection': 'keep-alive'
                }
            }
        );

        console.log('Status da resposta:', response.status);
        console.log('Headers da resposta:', Object.fromEntries(response.headers));

        const data = await response.text();
        console.log('Dados da resposta:', data);

        if (response.ok) {
            try {
                const jsonData = JSON.parse(data);
                res.json(jsonData);
            } catch (e) {
                throw new Error('Resposta não é um JSON válido');
            }
        } else {
            throw new Error(`Resposta inválida: Status ${response.status}`);
        }

    } catch (error) {
        console.error('Erro detalhado:', {
            message: error.message,
            stack: error.stack,
            response: {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data
            }
        });

        res.status(500).json({ 
            status: 0, 
            error: 'Erro ao consultar CPF',
            details: error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
