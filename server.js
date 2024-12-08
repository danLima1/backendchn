const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');
const { HttpsProxyAgent } = require('https-proxy-agent');

const app = express();
const PORT = process.env.PORT || 3000;

// Configurações do proxy BrightData
const PROXY_HOST = 'brd.superproxy.io';
const PROXY_PORT = '33335';
const PROXY_USER = 'brd-customer-hl_a5695247-zone-residential_proxy1';
const PROXY_PASS = '9bt6utixk5tb';

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

        // Configuração do proxy
        const proxyUrl = `http://${PROXY_USER}:${PROXY_PASS}@${PROXY_HOST}:${PROXY_PORT}`;
        const httpsAgent = new HttpsProxyAgent(proxyUrl);

        // Adiciona logs para debug
        console.log('Proxy URL:', proxyUrl);
        console.log('Fazendo requisição para CPF:', cpf);

        // Faz a requisição usando o proxy
        const response = await axios.get(
            `https://x-search.xyz/3nd-p01n75/xsiayer0-0t/lunder231224/r0070x/05/cpf.php?cpf=${cpf}`,
            {
                httpsAgent,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'application/json',
                    'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7'
                },
                // Adiciona timeout e validação de status
                timeout: 30000,
                validateStatus: function (status) {
                    return status >= 200 && status < 500;
                }
            }
        );

        // Log da resposta
        console.log('Resposta da API:', response.data);

        res.json(response.data);
    } catch (error) {
        console.error('Erro detalhado:', {
            message: error.message,
            stack: error.stack,
            response: error.response?.data,
            status: error.response?.status
        });

        res.status(500).json({ 
            status: 0, 
            error: 'Erro ao consultar CPF',
            details: error.message,
            fullError: error.response?.data || error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
