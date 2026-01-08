import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Serve os arquivos da pasta dist (onde o Vite gera o build)
// IMPORTANTE: Servir a raiz (__dirname) quebraria o app pois o navegador não lê .tsx
app.use(express.static(path.join(__dirname, 'dist')));

// Rota para qualquer outra página cair no index.html (importante para React)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`ABFIT Elite rodando na porta ${port}`);
});