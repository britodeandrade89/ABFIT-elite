import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 10000;

// Caminho para a pasta dist (onde o Vite coloca os arquivos buildados)
const distPath = path.join(__dirname, 'dist');

// Log para debug
console.log('🚀 Iniciando servidor...');
console.log('📁 Pasta dist:', distPath);

if (fs.existsSync(distPath)) {
    console.log('✅ Pasta dist encontrada!');
    console.log('📋 Conteúdo:', fs.readdirSync(distPath));
} else {
    console.log('❌ ERRO: Pasta dist não encontrada!');
    console.log('📁 Diretório atual:', __dirname);
    console.log('📋 Conteúdo do diretório:', fs.readdirSync(__dirname));
}

// **CRÍTICO: Servir arquivos estáticos ANTES de qualquer coisa**
// Isso evita que arquivos .js/.css sejam tratados como rotas
app.use(express.static(distPath, {
    // Força o MIME type correto para arquivos JavaScript
    setHeaders: (res, filePath) => {
        const extname = path.extname(filePath);
        if (extname === '.js') {
            res.setHeader('Content-Type', 'application/javascript');
        } else if (extname === '.css') {
            res.setHeader('Content-Type', 'text/css');
        }
    }
}));

// **IMPORTANTE: Rota específica para o index.html**
app.get('/', (req, res) => {
    const indexPath = path.join(distPath, 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).send('index.html não encontrado');
    }
});

// **ROTA CATCH-ALL APENAS para SPA (Single Page Application)**
// Esta deve ser a ÚLTIMA rota
app.get('*', (req, res) => {
    // Verifica se a requisição é para um arquivo (tem extensão)
    const hasExtension = path.extname(req.path) !== '';
    
    if (!hasExtension) {
        // Se não tem extensão, é uma rota do React/Vue
        const indexPath = path.join(distPath, 'index.html');
        if (fs.existsSync(indexPath)) {
            res.sendFile(indexPath);
        } else {
            res.status(404).send('Página não encontrada');
        }
    } else {
        // Se tem extensão (.js, .css, .png, etc.) mas não foi encontrado
        res.status(404).send('Arquivo não encontrado');
    }
});

app.listen(port, '0.0.0.0', () => {
    console.log(`✅ Servidor rodando na porta ${port}`);
    console.log(`🌐 Acesse: http://localhost:${port}`);
});