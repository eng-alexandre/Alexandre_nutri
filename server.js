import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import gerarPlanoHandler from './api/gerar-plano.js';

dotenv.config({ path: '.env.local' });
dotenv.config(); // fallback

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Proxy the serverless function
app.all('/api/gerar-plano', async (req, res) => {
  await gerarPlanoHandler(req, res);
});

app.listen(port, () => {
  console.log(`🚀 Local API server running on http://localhost:${port}`);
  console.log('Use this server to test Vercel Serverless Functions locally.');
});
