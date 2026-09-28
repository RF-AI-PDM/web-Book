import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

function geminiApiPlugin(): Plugin {
  return {
    name: 'gemini-mentor-api',
    configureServer(server) {
      server.middlewares.use('/api/gemini/mentor', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end('Method Not Allowed');
          return;
        }

        const { checkRateLimit } = await import('./src/server/rateLimit.ts');
        const ip = req.socket.remoteAddress || 'unknown';
        const rate = checkRateLimit(ip);
        if (!rate.allowed) {
          res.statusCode = 429;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Terlalu banyak permintaan. Coba lagi beberapa saat lagi.', retryAfterSeconds: rate.retryAfterSeconds }));
          return;
        }

        let body = '';
        req.on('data', (chunk) => {
          body += chunk;
        });
        req.on('end', async () => {
          try {
            const { validateMentorRequest } = await import('./src/server/validateMentorRequest.ts');
            const parsed = JSON.parse(body);
            const validation = validateMentorRequest(parsed);
            if (validation.ok === false) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: validation.error }));
              return;
            }

            const { askGeminiMentor } = await import('./src/server/gemini.ts');
            const result = await askGeminiMentor(validation.data);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(result));
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message || 'Internal error' }));
          }
        });
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), geminiApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
