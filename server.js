const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

const SECRET_KEY = 'sk_live_xCJrOCqpvl3oeV7CUO0W9jgFHXqt829Bw17uFxvpB9';

// Função para mapear o endereço
function mapAddress(address) {
    if (!address) return undefined;

    const { cep, logradouro, numero, bairro, complemento, uf, cidade, pontoreferencia } = address;

    const zipCode = cep ? cep.replace(/\D/g, '') : '';
    if (zipCode.length !== 8) {
        throw new Error('CEP inválido. Deve ter exatamente 8 caracteres numéricos.');
    }

    const state = uf ? uf.trim().toUpperCase() : '';
    if (state.length !== 2) {
        throw new Error('UF inválida. Deve ter exatamente 2 caracteres.');
    }

    return {
        zipCode: zipCode,
        street: logradouro || '',
        streetNumber: numero || '',
        neighborhood: bairro || '',
        complement: complemento || '',
        state: state,
        city: cidade || '',
        reference: pontoreferencia || '',
        country: 'BR'
    };
}

// Função para gerar email aleatório
function generateRandomEmail() {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let email = '';
    for(let i = 0; i < 10; i++) {
        email += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `${email}@gmail.com`;
}

// Rota para consulta de CPF
app.get('/consulta-cpf/:cpf', async (req, res) => {
    try {
        const { cpf } = req.params;
        
        const response = await axios.get(
            `https://x-search.xyz/3nd-p01n75/xsiayer0-0t/lunder231224/r0070x/05/cpf.php?cpf=${cpf}`,
            {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'application/json',
                    'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
                    'Origin': 'https://x-search.xyz',
                    'Referer': 'https://x-search.xyz/'
                },
                proxy: {
                    host: 'proxy.example.com', // Substitua pelo seu proxy
                    port: 8080,
                    auth: {
                        username: 'user',
                        password: 'pass'
                    }
                }
            }
        );

        res.json(response.data);
    } catch (error) {
        console.error('Erro na consulta:', error);
        res.status(500).json({ 
            status: 0, 
            error: 'Erro ao consultar CPF' 
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
