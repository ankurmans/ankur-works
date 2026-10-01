# AI Twin conversation records

The portfolio AI Twin writes completed text turns, submitted dictation, and voice-call transcripts to a dedicated Cloudflare D1 database. The browser sends `conversationId`, `turnId`, and `channel` to `/api/assistant`; the Vercel function sends a validated question/answer record to the private `ankur-ai-twin-log` Worker. The Worker accepts only requests with `INGEST_SECRET` and uses a D1 binding. The browser never receives that secret or direct D1 access. The same conversation ID is used across the portfolio and offer pages in one browser history. The Outlever research assistant writes its text questions and answers to the same database with `assistant_kind = 'outlever_research'`; its conversation IDs are separate from the portfolio history.

The record contains site host, page path, channel, question, answer or user-facing error, outcome, cited URLs, cache status, model, and input/output tokens when a model response reports them. It does **not** contain microphone audio, the ElevenLabs key, voice playback tokens, IP addresses, or the full retrieval context. Dictation that is not submitted as a question is not logged. Earlier chats that existed only in a visitor's local storage cannot be recovered.

The same Worker also has a private Cloudflare KV answer cache. Grounded model chat answers are keyed by the question, recent context, model, and knowledge version for 24 hours. Identical generated voice replies are keyed by the exact approved answer, voice ID, model, and settings for 30 days. Deterministic common answers already run without a model call. The audio cache stores generated reply audio, never a visitor's microphone recording. KV is a separate, globally distributed service; the D1 EU jurisdiction statement below applies only to conversation records.

The D1 database `ankur-ai-twin-conversations` is in Cloudflare's EU jurisdiction. The Worker deletes rows older than `RETENTION_DAYS` each day at 03:00 UTC; the current default is 90 days. D1 jurisdiction applies to this database, not to other services that process a question, including Vercel and ElevenLabs. In production, Vercel `waitUntil` completes the storage request after the answer is sent, so logging does not delay the reply. If logging is unavailable, the assistant still answers and emits `assistant_conversation_store_failure` without question text. That means the capture is best effort rather than a guaranteed audit log.

## Deployment

Source: `conversation-store/src/index.js`, configuration: `conversation-store/wrangler.jsonc`, schema: `conversation-store/migrations/0001_init.sql` and `0002_assistant_kind.sql`. The Worker is deployed at `https://ankur-ai-twin-log.ankur-fe9.workers.dev`. The Worker secret `INGEST_SECRET` matches `ASSISTANT_LOG_SECRET` in both the `ankur-works` and `outlever-ankur-works` Vercel production environments. `ASSISTANT_LOG_INGEST_URL` points to that Worker. Both site integrations were deployed and tested on production on 2026-10-01. Preview deployments do not write to the production D1 database unless separately configured.

For local development, the same two assistant log variables can be placed in gitignored `.env.local`. Rows from local requests carry `site_host` `localhost` or `127.0.0.1`, so they can be filtered out of production analysis. To test with a local D1 simulation instead, run `wrangler dev -c conversation-store/wrangler.jsonc` and point `ASSISTANT_LOG_INGEST_URL` at the local Worker.

## Inspecting conversations

Use the Cloudflare D1 console, or Wrangler with the checked-in configuration. Start with aggregate counts, then inspect a specific conversation when needed. Do not export the full table into logs or public analytics.

```bash
wrangler d1 execute ankur-ai-twin-conversations --remote -c conversation-store/wrangler.jsonc --command "SELECT date(created_at_ms / 1000, 'unixepoch') AS day, site_host, channel, count(*) AS turns FROM conversation_turns GROUP BY day, site_host, channel ORDER BY day DESC LIMIT 50"
```

```bash
wrangler d1 execute ankur-ai-twin-conversations --remote -c conversation-store/wrangler.jsonc --command "SELECT turn_id, question, answer, outcome, model, input_tokens, output_tokens FROM conversation_turns WHERE conversation_id = '<conversation-id>' ORDER BY created_at_ms"
```

The chat's **Clear on this device** control removes only that browser's local copy. A server-side deletion workflow and owner dashboard are separate work; the current retention job removes stored turns automatically. For a manual deletion request, identify the conversation ID and use a scoped D1 delete.
