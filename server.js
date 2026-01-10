import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 10000;

// Verifica TODAS as possíveis pastas de build
const possiblePaths = [
    path.join(__dirname, 'dist'),
    path.join(__dirname, 'build'),
    path.join(__dirname, 'public'),
    __dirname
];

let staticPath = null;
for (const p of possiblePaths) {
    if (fs.existsSync(p) && fs.existsSync(path.join(p, 'index.html'))) {
        staticPath = p;
        console.log(`✅ Usando pasta: ${p}`);
        console.log(`📁 Conteúdo:`, fs.readdirSync(p));
        break;
    }
}

if (!staticPath) {
    console.log('❌ ERRO: Nenhuma pasta com index.html encontrada!');
    console.log('📁 Diretório atual:', __dirname);
    console.log('📋 Conteúdo:', fs.readdirSync(__dirname));
    process.exit(1);
}

// Serve todos os arquivos estáticos
app.use(express.static(staticPath, {
    // Configuração EXTRA para garantir MIME types corretos
    setHeaders: (res, filePath) => {
        const ext = path.extname(filePath).toLowerCase();
        const mimeTypes = {
            '.js': 'application/javascript',
            '.css': 'text/css',
            '.html': 'text/html',
            '.json': 'application/json',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.svg': 'image/svg+xml'
        };
        if (mimeTypes[ext]) {
            res.setHeader('Content-Type', mimeTypes[ext]);
        }
    }
}));

// Rota para todas as páginas (SPA)
app.get('*', (req, res) => {
    // Verifica se é uma requisição para arquivo de asset
    const ext = path.extname(req.path).toLowerCase();
    if (['.js', '.css', '.png', '.jpg', '.jpeg', '.svg', '.ico', '.json'].includes(ext)) {
        // Se for um arquivo que não existe, retorna 404
        const filePath = path.join(staticPath, req.path);
        if (fs.existsSync(filePath)) {
            res.sendFile(filePath);
        } else {
            console.log(`❌ Arquivo não encontrado: ${req.path}`);
            res.status(404).send('Arquivo não encontrado');
        }
    } else {
        // Se não for arquivo, serve o index.html
        res.sendFile(path.join(staticPath, 'index.html'));
    }
});

app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Servidor rodando em http://0.0.0.0:${port}`);
});