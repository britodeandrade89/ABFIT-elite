import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 10000;

// Onde o Vite coloca os arquivos prontos
const distPath = path.join(__dirname, 'dist');

// LOG PARA VOCÊ VER NO RENDER SE A PASTA EXISTE
console.log("Checando pasta dist em:", distPath);
if (fs.existsSync(distPath)) {
    console.log("Arquivos na dist:", fs.readdirSync(distPath));
} else {
    console.log("ERRO: A pasta dist não foi criada!");
}

// 1. PRIMEIRO: Tenta servir arquivos estáticos (JS, CSS, Imagens)
app.use(express.static(distPath));

// 2. SEGUNDO: Se não for um arquivo, entrega o index.html (Para rotas do React)
app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
    console.log(`ABFIT Elite rodando na porta ${port}`);
});