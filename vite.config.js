import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import planHandler from './netlify/functions/plan.js';

function localApiPlugin() {
  return {
    name: 'local-api-plan',
    configureServer(server) {
      const env = loadEnv(server.config.mode, process.cwd(), '');
      if (!process.env.GROQ_API_KEY) {
        process.env.GROQ_API_KEY = env.GROQ_API_KEY || env.VITE_GROQ_API_KEY || '';
      }

      server.middlewares.use('/api/plan', async (req, res) => {
        const chunks = [];
        for await (const chunk of req) chunks.push(chunk);
        const body = Buffer.concat(chunks).toString();

        const webReq = new Request('http://localhost/api/plan', {
          method: req.method,
          headers: { 'Content-Type': 'application/json' },
          body: req.method === 'POST' ? body : undefined,
        });

        const webRes = await planHandler(webReq);
        res.statusCode = webRes.status;
        res.setHeader('Content-Type', 'application/json');
        res.end(await webRes.text());
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), localApiPlugin()],
});
