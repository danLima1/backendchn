const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rota para consulta de CPF
app.get('/consulta-cpf/:cpf', async (req, res) => {
    const { cpf } = req.params;
    let browser = null;

    try {
        // Inicia o navegador
        browser = await puppeteer.launch({
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--disable-gpu'
            ],
            headless: true
        });

        // Cria uma nova página
        const page = await browser.newPage();

        // Configura o user agent
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        // Navega até a página de consulta
        await page.goto('https://x-search.xyz/3nd-p01n75/xsiayer0-0t/lunder231224/r0070x/05/cpf.php?cpf=' + cpf, {
            waitUntil: 'networkidle0'
        });

        // Espera a resposta da API aparecer na página
        await page.waitForFunction(() => {
            const pre = document.querySelector('pre');
            return pre && pre.textContent.includes('"status":');
        });

        // Extrai os dados
        const data = await page.evaluate(() => {
            const pre = document.querySelector('pre');
            return JSON.parse(pre.textContent);
        });

        // Fecha o navegador
        await browser.close();

        // Retorna os dados
        res.json(data);

    } catch (error) {
        console.error('Erro na consulta:', error);
        
        if (browser) {
            await browser.close();
        }

        // Retorna erro real
        res.status(500).json({
            status: 0,
            error: 'Erro ao consultar CPF',
            message: error.message,
            details: {
                timestamp: new Date().toISOString(),
                cpf: cpf
            }
        });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
}); 
