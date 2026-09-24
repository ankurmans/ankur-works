import { defineConfig, loadEnv } from 'vite';
import contributions from './api/contributions.js';

// Vite does not run Vercel functions. Serve this one locally so the preview
// exercises the same authenticated GitHub endpoint as production.
export default defineConfig(({ mode }) => ({
  plugins: [{
    name: 'local-contributions-api',
    configureServer(server) {
      const { GITHUB_TOKEN } = loadEnv(mode, process.cwd(), 'GITHUB_TOKEN');
      if (GITHUB_TOKEN) process.env.GITHUB_TOKEN = GITHUB_TOKEN;
      server.middlewares.use('/api/contributions', async (request, response) => {
        if (request.method !== 'GET') {
          response.statusCode = 405;
          response.end();
          return;
        }
        const result = {
          setHeader(name, value) { response.setHeader(name, value); return this; },
          status(code) { response.statusCode = code; return this; },
          json(data) {
            response.setHeader('Content-Type', 'application/json; charset=utf-8');
            response.end(JSON.stringify(data));
            return this;
          },
        };
        try { await contributions(request, result); }
        catch {
          response.statusCode = 503;
          response.end(JSON.stringify({ error: 'Authenticated GitHub connection unavailable' }));
        }
      });
    },
  }],
}));
