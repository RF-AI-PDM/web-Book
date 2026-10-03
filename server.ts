import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { translationRouter } from './src/server/translationRouter';
import { askGeminiMentor } from './src/server/gemini';
import { checkRateLimit } from './src/server/rateLimit';
import { validateMentorRequest } from './src/server/validateMentorRequest';

dotenv.config({ path: ['.env.botdong', '.env.local', '.env'] });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(translationRouter);

// API route for Gemini 3.1 Pro Thinking Mentor
app.post('/api/gemini/mentor', async (req, res) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const rate = checkRateLimit(ip);
  if (!rate.allowed) {
    res.status(429).json({ error: 'Terlalu banyak permintaan. Coba lagi beberapa saat lagi.', retryAfterSeconds: rate.retryAfterSeconds });
    return;
  }

  const validation = validateMentorRequest(req.body);
  if (validation.ok === false) {
    res.status(400).json({ error: validation.error });
    return;
  }

  try {
    const result = await askGeminiMentor(validation.data);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error processing request' });
  }
});

// Serve static assets in production
app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`F15 Library server running on port ${PORT}`);
});
