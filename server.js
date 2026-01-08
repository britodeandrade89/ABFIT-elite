import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Importante: Servir a pasta 'dist' onde o Vite gera o build final.
// Servir a raiz (__dirname) faria o navegador receber arquivos .tsx que ele não consegue ler.
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// Rota SPA: Redireciona tudo para o index.html dentro de dist
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(port, () => {
  console.log(`ABFIT Elite rodando na porta ${port}`);
});