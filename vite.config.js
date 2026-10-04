import { defineConfig, loadEnv } from 'vite';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import contributions from './api/contributions.js';
import assistant from './api/assistant.js';
import assistantVoice from './api/assistant-voice.js';
import assistantRealtimeToken from './api/assistant-realtime-token.js';
import assistantRealtimeLog from './api/assistant-realtime-log.js';
import offerInquiry from './api/offer-inquiry.js';
import { offerPages } from './scripts/offer-knowledge.js';
import { mountAssistantOnOfferPage } from './scripts/assistant-mount-html.js';

// Vite does not run Vercel functions. Serve this one locally so the preview
// exercises the same authenticated GitHub endpoint as production.
export default defineConfig(({ mode }) => ({
  build: {
    rollupOptions: {
      input: Object.fromEntries([
        ['home', resolve(import.meta.dirname, 'index.html')],
        ['build-log', resolve(import.meta.dirname, 'build-log/index.html')],
        ...readdirSync(resolve(import.meta.dirname, 'content/build-log'))
          .filter((file) => file.endsWith('.mdx'))
          .map((file) => [file.slice(0, -4), resolve(import.meta.dirname, 'build-log', file.slice(0, -4), 'index.html')]),
        ...offerPages.filter((page) => existsSync(resolve(import.meta.dirname, page.file)))
          .map((page) => [page.id, resolve(import.meta.dirname, page.file)]),
      ]),
    },
  },
  server: { watch: { ignored: ['**/outlever-site/**', '**/.vercel/**'] } },
  plugins: [{
    name: 'local-contributions-api',
    transformIndexHtml(html) {
      return mountAssistantOnOfferPage(html, readFileSync(resolve(import.meta.dirname, 'index.html'), 'utf8'));
    },
    configureServer(server) {
      const { GITHUB_TOKEN } = loadEnv(mode, process.cwd(), 'GITHUB_TOKEN');
      if (GITHUB_TOKEN) process.env.GITHUB_TOKEN = GITHUB_TOKEN;
      server.middlewares.use('/api/offer-inquiry', async (request, response) => {
        for (const key of ['SES_REGION', 'AWS_REGION', 'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'SES_FROM_EMAIL', 'LEAD_NOTIFICATION_EMAIL', 'LEAD_AUTO_REPLY_ENABLED']) {
          const value = loadEnv(mode, process.cwd(), key)[key];
          if (value && !process.env[key]) process.env[key] = value;
        }
        const result = {
          setHeader(name, value) { response.setHeader(name, value); return this; },
          status(code) { response.statusCode = code; return this; },
          json(data) { response.setHeader('Content-Type', 'application/json; charset=utf-8'); response.end(JSON.stringify(data)); return this; },
        };
        try {
          let payload = '';
          for await (const chunk of request) {
            payload += chunk;
            if (payload.length > 6000) { response.statusCode = 413; response.end(); return; }
          }
          request.body = payload;
          await offerInquiry(request, result);
        } catch { response.statusCode = 503; response.end(JSON.stringify({ error: 'The form is unavailable.' })); }
      });
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
      server.middlewares.use('/api/assistant', async (request, response) => {
        for (const key of ['AI_GATEWAY_API_KEY', 'VERCEL_OIDC_TOKEN', 'ASSISTANT_MODEL', 'ASSISTANT_DAILY_CAP', 'ASSISTANT_REDIS_REST_URL', 'ASSISTANT_REDIS_REST_TOKEN', 'ELEVENLABS_API_KEY', 'ELEVENLABS_VOICE_ID', 'ASSISTANT_LOG_INGEST_URL', 'ASSISTANT_LOG_SECRET']) {
          const value = loadEnv(mode, process.cwd(), key)[key];
          if (value && !process.env[key]) process.env[key] = value;
        }
        const result = {
          setHeader(name, value) { response.setHeader(name, value); return this; },
          status(code) { response.statusCode = code; return this; },
          end() { response.end(); return this; },
          json(data) { response.setHeader('Content-Type', 'application/json; charset=utf-8'); response.end(JSON.stringify(data)); return this; },
        };
        try {
          let payload = '';
          for await (const chunk of request) {
            payload += chunk;
            if (payload.length > 4000) {
              response.statusCode = 413;
              response.end(JSON.stringify({ error: 'That question is too long.' }));
              return;
            }
          }
          request.body = payload;
          await assistant(request, result);
        } catch {
          response.statusCode = 503;
          response.end(JSON.stringify({ error: "I can't answer right now. You can email me directly." }));
        }
      });
      server.middlewares.use('/api/assistant-voice', async (request, response) => {
        for (const key of ['ELEVENLABS_API_KEY', 'ELEVENLABS_VOICE_ID', 'ASSISTANT_VOICE_DAILY_CAP', 'ASSISTANT_REDIS_REST_URL', 'ASSISTANT_REDIS_REST_TOKEN']) {
          const value = loadEnv(mode, process.cwd(), key)[key];
          if (value && !process.env[key]) process.env[key] = value;
        }
        const result = {
          setHeader(name, value) { response.setHeader(name, value); return this; },
          status(code) { response.statusCode = code; return this; },
          json(data) { response.setHeader('Content-Type', 'application/json; charset=utf-8'); response.end(JSON.stringify(data)); return this; },
        };
        try {
          if (request.method === 'POST') {
            let payload = '';
            for await (const chunk of request) {
              payload += chunk;
              if (payload.length > 1_700_000) {
                response.statusCode = 413;
                response.end(JSON.stringify({ error: 'That recording is too large.' }));
                return;
              }
            }
            request.body = payload;
          }
          await assistantVoice(request, result);
        } catch {
          response.statusCode = 503;
          response.end(JSON.stringify({ error: 'Voice is unavailable right now.' }));
        }
      });
      server.middlewares.use('/api/assistant-realtime-token', async (request, response) => {
        for (const key of ['ELEVENLABS_API_KEY', 'ELEVENLABS_REALTIME_AGENT_ID', 'ASSISTANT_REALTIME_ENABLED', 'ASSISTANT_REDIS_REST_URL', 'ASSISTANT_REDIS_REST_TOKEN']) {
          const value = loadEnv(mode, process.cwd(), key)[key];
          if (value && !process.env[key]) process.env[key] = value;
        }
        const result = {
          setHeader(name, value) { response.setHeader(name, value); return this; },
          status(code) { response.statusCode = code; return this; },
          json(data) { response.setHeader('Content-Type', 'application/json; charset=utf-8'); response.end(JSON.stringify(data)); return this; },
        };
        try { await assistantRealtimeToken(request, result); }
        catch { response.statusCode = 503; response.end(JSON.stringify({ error: 'Real-time voice could not connect.' })); }
      });
      server.middlewares.use('/api/assistant-realtime-log', async (request, response) => {
        for (const key of ['ELEVENLABS_API_KEY', 'ELEVENLABS_REALTIME_AGENT_ID', 'ASSISTANT_LOG_INGEST_URL', 'ASSISTANT_LOG_SECRET']) {
          const value = loadEnv(mode, process.cwd(), key)[key];
          if (value && !process.env[key]) process.env[key] = value;
        }
        const result = {
          setHeader(name, value) { response.setHeader(name, value); return this; },
          status(code) { response.statusCode = code; return this; },
          json(data) { response.setHeader('Content-Type', 'application/json; charset=utf-8'); response.end(JSON.stringify(data)); return this; },
        };
        try {
          let payload = '';
          for await (const chunk of request) {
            payload += chunk;
            if (payload.length > 1000) { response.statusCode = 413; response.end(); return; }
          }
          request.body = payload;
          await assistantRealtimeLog(request, result);
        } catch { response.statusCode = 503; response.end(JSON.stringify({ error: 'Call logging unavailable.' })); }
      });
    },
  }],
}));
