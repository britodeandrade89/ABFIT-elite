import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 10000;

// Onde o Vite guarda o app pronto no Render
const distPath = path.join(__dirname, 'dist');

// LOG DE EMERGÊNCIA (Verifique isso no log do Render depois)
console.log("Pasta dist encontrada em:", distPath);
if (fs.existsSync(distPath)) {
    console.log("Arquivos dentro da dist:", fs.readdirSync(distPath));
}

// 1. PRIORIDADE MÁXIMA: Entrega arquivos reais (.js, .css, imagens)
app.use(express.static(distPath, {
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
        }
    }
}));

// 2. SEGUNDA PRIORIDADE: Se não for um arquivo, entrega o index.html
app.get('*', (req, res) => {
    const indexPath = path.join(distPath, 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).send("Erro: O build do Vite não gerou o index.html na pasta dist.");
    }
});

app.listen(port, '0.0.0.0', () => {
    console.log(`ABFIT Elite rodando na porta ${port}`);
});