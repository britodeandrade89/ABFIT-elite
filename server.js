import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 10000;

// Caminho para a pasta dist
const distPath = path.join(__dirname, 'dist');

// Log de debug CRÍTICO
console.log('🚀 Iniciando servidor ABFIT...');
console.log('📁 Diretório atual:', __dirname);
console.log('📁 Caminho da dist:', distPath);

if (fs.existsSync(distPath)) {
    console.log('✅ Pasta dist encontrada!');
    console.log('📋 Conteúdo:');
    
    // Lista TODOS os arquivos recursivamente
    const listFiles = (dir, prefix = '') => {
        const files = fs.readdirSync(dir);
        files.forEach(file => {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);
            if (stat.isDirectory()) {
                console.log(prefix + '📁 ' + file + '/');
                listFiles(filePath, prefix + '  ');
            } else {
                console.log(prefix + '📄 ' + file + ' (' + stat.size + ' bytes)');
            }
        });
    };
    
    listFiles(distPath);
} else {
    console.log('❌ ERRO: Pasta dist NÃO encontrada!');
    console.log('📋 Conteúdo do diretório raiz:');
    fs.readdirSync(__dirname).forEach(file => {
        console.log('  - ' + file);
    });
}

// Serve TODOS os arquivos estáticos da pasta dist
app.use(express.static(distPath));

// Rota para todas as requisições (SPA)
app.get('*', (req, res) => {
    // Se a requisição NÃO for para um arquivo (não tem extensão)
    const ext = path.extname(req.path);
    if (!ext) {
        // Serve o index.html
        res.sendFile(path.join(distPath, 'index.html'));
    } else {
        // Se for um arquivo que não existe, retorna 404
        const filePath = path.join(distPath, req.path);
        if (fs.existsSync(filePath)) {
            res.sendFile(filePath);
        } else {
            console.log(`❌ Arquivo não encontrado: ${req.path}`);
            res.status(404).send(`Arquivo não encontrado: ${req.path}`);
        }
    }
});

app.listen(port, '0.0.0.0', () => {
    console.log(`✅ ABFIT rodando na porta ${port}`);
    console.log(`🌐 Acesse: http://localhost:${port}`);
    console.log('🔍 Dica: Verifique se os arquivos .js estão na lista acima!');
});