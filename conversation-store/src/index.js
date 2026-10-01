const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const CHANNELS = new Set(['chat', 'dictation', 'voice_call']);
const OUTCOMES = new Set(['answered', 'refused', 'error']);
const ASSISTANTS = new Set(['ai_twin', 'outlever_research']);

function reply(status, body) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff', 'X-Robots-Tag': 'noindex' } });
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

function reportFilters(url) {
  const assistant = url.searchParams.get('assistant') || '';
  const host = url.searchParams.get('host') || '';
  const channel = url.searchParams.get('channel') || '';
  const days = Number(url.searchParams.get('days') || '30');
  const page = Number(url.searchParams.get('page') || '0');
  if (assistant && !ASSISTANTS.has(assistant) || host && !/^(?:localhost|127\.0\.0\.1|(?:[a-z0-9-]+\.)?ankur\.works)$/.test(host)
    || channel && !CHANNELS.has(channel) || !Number.isInteger(days) || days < 1 || days > 90
    || !Number.isInteger(page) || page < 0 || page > 4000) return null;
  return { assistant, host, channel, days, page };
}

async function report(request, env, path, url) {
  if (!authorized(request, env.READ_SECRET)) return reply(401, { error: 'Unauthorized' });
  const filters = reportFilters(url);
  if (!filters) return reply(400, { error: 'Invalid report filter' });
  const since = Date.now() - filters.days * 86400000;
  const where = ['created_at_ms >= ?'];
  const values = [since];
  for (const [column, value] of [['assistant_kind', filters.assistant], ['site_host', filters.host], ['channel', filters.channel]]) {
    if (value) { where.push(`${column} = ?`); values.push(value); }
  }
  const clause = where.join(' AND ');
  if (path === '/report/overview') {
    const summary = await env.DB.prepare(`SELECT count(*) AS turns, count(DISTINCT conversation_id) AS conversations,
      sum(CASE WHEN channel = 'voice_call' THEN 1 ELSE 0 END) AS voice_turns,
      sum(CASE WHEN outcome = 'error' THEN 1 ELSE 0 END) AS errors,
      sum(CASE WHEN cache_status = 'hit' THEN 1 ELSE 0 END) AS cache_hits,
      coalesce(sum(input_tokens), 0) AS input_tokens, coalesce(sum(output_tokens), 0) AS output_tokens
      FROM conversation_turns WHERE ${clause}`).bind(...values).first();
    const conversations = await env.DB.prepare(`SELECT conversation_id, assistant_kind, site_host,
      min(created_at_ms) AS started_at_ms, max(created_at_ms) AS latest_at_ms,
      count(*) AS turns, group_concat(DISTINCT channel) AS channels,
      coalesce(sum(input_tokens), 0) AS input_tokens, coalesce(sum(output_tokens), 0) AS output_tokens,
      sum(CASE WHEN outcome = 'error' THEN 1 ELSE 0 END) AS errors,
      (SELECT latest.question FROM conversation_turns AS latest
        WHERE latest.conversation_id = conversation_turns.conversation_id
        ORDER BY latest.created_at_ms DESC, latest.turn_id DESC LIMIT 1) AS latest_question
      FROM conversation_turns WHERE ${clause}
      GROUP BY conversation_id ORDER BY latest_at_ms DESC, conversation_id DESC LIMIT 25 OFFSET ?`)
      .bind(...values, filters.page * 25).all();
    return reply(200, { filters, summary, conversations: conversations.results || [] });
  }
  const match = /^\/report\/conversation\/([0-9a-f-]{36})$/i.exec(path);
  if (!match || !UUID.test(match[1])) return reply(404, { error: 'Not found' });
  const turns = await env.DB.prepare(`SELECT turn_id, conversation_id, assistant_kind, site_host, page_path,
    channel, question, answer, outcome, status_code, sources_json, cache_status, model,
    input_tokens, output_tokens, created_at_ms FROM conversation_turns
    WHERE conversation_id = ? AND ${clause} ORDER BY created_at_ms ASC, turn_id ASC LIMIT 200`)
    .bind(match[1], ...values).all();
  return reply(200, { turns: turns.results || [] });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    if (request.method === 'GET' && path === '/health') return reply(200, { ready: true });
    if (path.startsWith('/report/')) {
      if (request.method !== 'GET') return reply(405, { error: 'Use GET' });
      return report(request, env, path, url);
    }
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
