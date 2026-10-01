import test from 'node:test';
import assert from 'node:assert/strict';
import assistant from '../api/assistant.js';
import worker from '../conversation-store/src/index.js';

const conversationId = 'ab47b3c1-ec44-47c3-8f37-0bd485335c7d';
const turnId = 'c131d54c-4162-445d-a13b-816c96da7855';
function response() {
  return { statusCode: 200, setHeader() { return this; }, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } };
}

test('the assistant sends a voice transcript and answer to the private store without audio or tokens', async () => {
  const originalFetch = global.fetch;
  const oldUrl = process.env.ASSISTANT_LOG_INGEST_URL;
  const oldSecret = process.env.ASSISTANT_LOG_SECRET;
  let sent;
  process.env.ASSISTANT_LOG_INGEST_URL = 'https://ankur-ai-twin-log.example';
  process.env.ASSISTANT_LOG_SECRET = 'test-only-store-secret';
  global.fetch = async (url, options) => { sent = { url, options, data: JSON.parse(options.body) }; return { ok: true }; };
  try {
    const res = response();
    await assistant({ method: 'POST', headers: { origin: 'https://ankur.works', 'content-type': 'application/json' }, body: {
      question: 'Who are you?', conversationId, turnId, channel: 'voice_call', page: '/', history: [],
    } }, res);
    assert.equal(res.statusCode, 200);
    assert.equal(sent.url, 'https://ankur-ai-twin-log.example/turns');
    assert.equal(sent.options.headers.Authorization, 'Bearer test-only-store-secret');
    assert.equal(sent.data.question, 'Who are you?');
    assert.equal(sent.data.answer, res.body.answer);
    assert.equal(sent.data.channel, 'voice_call');
    assert.equal(sent.data.assistantKind, 'ai_twin');
    assert.equal(sent.data.siteHost, 'ankur.works');
    assert.equal(sent.data.conversationId, conversationId);
    assert.equal(sent.data.turnId, turnId);
    assert.equal('audio' in sent.data, false);
    assert.equal('voiceToken' in sent.data, false);
  } finally {
    global.fetch = originalFetch;
    if (oldUrl === undefined) delete process.env.ASSISTANT_LOG_INGEST_URL;
    else process.env.ASSISTANT_LOG_INGEST_URL = oldUrl;
    if (oldSecret === undefined) delete process.env.ASSISTANT_LOG_SECRET;
    else process.env.ASSISTANT_LOG_SECRET = oldSecret;
  }
});

test('D1 worker rejects unauthenticated and invalid turns, then writes a valid turn', async () => {
  let binding;
  const env = { INGEST_SECRET: 'test-only-store-secret', DB: { prepare(sql) { return { bind(...values) { binding = { sql, values }; return { run: async () => ({ success: true }) }; } }; } } };
  const body = {
    conversationId, turnId, channel: 'chat', assistantKind: 'ai_twin', siteHost: 'ankur.works', pagePath: '/',
    question: 'Who are you?', answer: 'I am Ankur’s AI Twin.', outcome: 'answered', status: 200,
    sources: [], cache: 'guard', model: null, inputTokens: null, outputTokens: null,
  };
  const url = 'https://example.workers.dev/turns';
  const unauthenticated = await worker.fetch(new Request(url, { method: 'POST', body: JSON.stringify(body), headers: { 'content-type': 'application/json' } }), env);
  assert.equal(unauthenticated.status, 401);
  const invalid = await worker.fetch(new Request(url, { method: 'POST', body: JSON.stringify({ ...body, question: '' }), headers: { 'content-type': 'application/json', authorization: 'Bearer test-only-store-secret' } }), env);
  assert.equal(invalid.status, 400);
  const stored = await worker.fetch(new Request(url, { method: 'POST', body: JSON.stringify(body), headers: { 'content-type': 'application/json', authorization: 'Bearer test-only-store-secret' } }), env);
  assert.equal(stored.status, 201);
  assert.match(binding.sql, /ON CONFLICT\(turn_id\) DO NOTHING/);
  assert.equal(binding.values[0], turnId);
  assert.equal(binding.values[5], body.question);
});

test('scheduled cleanup removes turns older than the configured retention', async () => {
  let binding;
  const now = Date.now();
  await worker.scheduled({}, { RETENTION_DAYS: '90', DB: { prepare(sql) { return { bind(value) { binding = { sql, value }; return { run: async () => ({ success: true }) }; } }; } } });
  assert.match(binding.sql, /DELETE FROM conversation_turns/);
  assert.ok(Math.abs(binding.value - (now - 90 * 86400000)) < 1000);
});

test('the private shared cache stores validated chat and audio with separate expiry', async () => {
  const values = new Map();
  const env = { INGEST_SECRET: 'test-only-store-secret', ANSWER_CACHE: {
    get: async (key) => values.get(key)?.value ?? null,
    put: async (key, value, options) => { values.set(key, { value, options }); },
  } };
  const digest = 'a'.repeat(64);
  const base = `https://example.workers.dev/cache`;
  const headers = { authorization: 'Bearer test-only-store-secret', 'content-type': 'application/json' };
  const chat = { answer: 'I built Pepys.', outcome: 'answered', sources: [{ title: 'Pepys', url: '/#work' }] };
  const denied = await worker.fetch(new Request(`${base}/chat/${digest}`), env);
  assert.equal(denied.status, 401);
  const savedChat = await worker.fetch(new Request(`${base}/chat/${digest}`, { method: 'PUT', headers, body: JSON.stringify(chat) }), env);
  assert.equal(savedChat.status, 201);
  assert.equal(values.get(`chat:${digest}`).options.expirationTtl, 86400);
  const foundChat = await worker.fetch(new Request(`${base}/chat/${digest}`, { headers }), env);
  assert.deepEqual(await foundChat.json(), chat);
  const audio = { audio: 'SUQz', mime: 'audio/mpeg' };
  const savedAudio = await worker.fetch(new Request(`${base}/audio/${digest}`, { method: 'PUT', headers, body: JSON.stringify(audio) }), env);
  assert.equal(savedAudio.status, 201);
  assert.equal(values.get(`audio:${digest}`).options.expirationTtl, 2592000);
  const invalid = await worker.fetch(new Request(`${base}/audio/${digest}`, { method: 'PUT', headers, body: JSON.stringify({ audio: 'broken', mime: 'audio/wav' }) }), env);
  assert.equal(invalid.status, 400);
});
