const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const CHANNELS = new Set(['chat', 'dictation', 'voice_call']);
const OUTCOMES = new Set(['answered', 'refused', 'error']);
const ASSISTANTS = new Set(['ai_twin', 'outlever_research']);

function reply(status, body) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
}
function authorized(request, secret) {
  const received = request.headers.get('Authorization') || '';
  const expected = `Bearer ${secret || ''}`;
  if (!secret || received.length !== expected.length) return false;
  let difference = 0;
  for (let i = 0; i < received.length; i++) difference |= received.charCodeAt(i) ^ expected.charCodeAt(i);
  return difference === 0;
}
async function readBody(request, limit = 8192) {
  if (Number(request.headers.get('Content-Length') || 0) > limit) return null;
  const reader = request.body?.getReader();
  if (!reader) return null;
  const chunks = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > limit) { await reader.cancel(); return null; }
    chunks.push(value);
  }
  try {
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch { return null; }
}
function validCacheValue(kind, value) {
  if (!value || typeof value !== 'object') return false;
  if (kind === 'audio') return value.mime === 'audio/mpeg'
    && typeof value.audio === 'string' && value.audio.length > 0 && value.audio.length <= 2700000
    && /^[A-Za-z0-9+/]+={0,2}$/.test(value.audio);
  return typeof value.answer === 'string' && value.answer.length > 0 && value.answer.length <= 700
    && ['answered', 'refused'].includes(value.outcome)
    && Array.isArray(value.sources) && value.sources.length <= 3
    && value.sources.every((source) => source && typeof source.title === 'string' && source.title.length <= 100
      && typeof source.url === 'string' && source.url.length <= 150);
}
function valid(value) {
  return value && UUID.test(value.conversationId) && UUID.test(value.turnId)
    && CHANNELS.has(value.channel) && OUTCOMES.has(value.outcome)
    && ASSISTANTS.has(value.assistantKind)
    && typeof value.siteHost === 'string' && /^(?:localhost|127\.0\.0\.1|(?:[a-z0-9-]+\.)?ankur\.works)$/.test(value.siteHost)
    && typeof value.pagePath === 'string' && /^\/[a-z0-9/-]{0,100}$/.test(value.pagePath)
    && typeof value.question === 'string' && value.question.length > 0 && value.question.length <= 600
    && typeof value.answer === 'string' && value.answer.length <= 1800
    && Number.isInteger(value.status) && value.status >= 200 && value.status <= 599
    && Array.isArray(value.sources) && value.sources.length <= 3 && value.sources.every((source) => typeof source === 'string' && source.length <= 150)
    && (value.cache === null || typeof value.cache === 'string' && value.cache.length <= 16)
    && (value.model === null || typeof value.model === 'string' && value.model.length <= 80)
    && (value.inputTokens === null || Number.isSafeInteger(value.inputTokens) && value.inputTokens >= 0)
    && (value.outputTokens === null || Number.isSafeInteger(value.outputTokens) && value.outputTokens >= 0);
}

export default {
  async fetch(request, env) {
    const path = new URL(request.url).pathname;
    if (request.method === 'GET' && path === '/health') return reply(200, { ready: true });
    const cache = /^\/cache\/(chat|audio)\/([a-f0-9]{64})$/.exec(path);
    if (cache) {
      if (!authorized(request, env.INGEST_SECRET)) return reply(401, { error: 'Unauthorized' });
      if (!['GET', 'PUT'].includes(request.method)) return reply(405, { error: 'Use GET or PUT' });
      const [, kind, digest] = cache;
      const cacheKey = `${kind}:${digest}`;
      if (request.method === 'GET') {
        const stored = await env.ANSWER_CACHE.get(cacheKey);
        return stored === null ? reply(404, { error: 'Cache miss' })
          : new Response(stored, { headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' } });
      }
      if (!request.headers.get('Content-Type')?.toLowerCase().includes('application/json')) return reply(415, { error: 'Send JSON' });
      const value = await readBody(request, kind === 'audio' ? 2800000 : 4096);
      if (!validCacheValue(kind, value)) return reply(400, { error: 'Invalid cache value' });
      await env.ANSWER_CACHE.put(cacheKey, JSON.stringify(value), { expirationTtl: kind === 'audio' ? 2592000 : 86400 });
      return reply(201, { saved: true });
    }
    if (request.method !== 'POST' || path !== '/turns') return reply(404, { error: 'Not found' });
    if (!authorized(request, env.INGEST_SECRET)) return reply(401, { error: 'Unauthorized' });
    if (!request.headers.get('Content-Type')?.toLowerCase().includes('application/json')) return reply(415, { error: 'Send JSON' });
    const value = await readBody(request);
    if (!valid(value)) return reply(400, { error: 'Invalid turn' });
    await env.DB.prepare(`INSERT INTO conversation_turns
      (turn_id, conversation_id, site_host, page_path, channel, question, answer, outcome, status_code, sources_json, cache_status, model, input_tokens, output_tokens, created_at_ms, assistant_kind)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(turn_id) DO NOTHING`).bind(
      value.turnId, value.conversationId, value.siteHost, value.pagePath, value.channel,
      value.question, value.answer, value.outcome, value.status, JSON.stringify(value.sources),
      value.cache, value.model, value.inputTokens, value.outputTokens, Date.now(), value.assistantKind,
    ).run();
    return reply(201, { saved: true });
  },
  async scheduled(_event, env) {
    const days = Number.parseInt(env.RETENTION_DAYS || '90', 10);
    if (!Number.isSafeInteger(days) || days <= 0) return;
    await env.DB.prepare('DELETE FROM conversation_turns WHERE created_at_ms < ?')
      .bind(Date.now() - Math.min(days, 3650) * 86400000).run();
  },
};
