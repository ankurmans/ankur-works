import test from 'node:test';
import assert from 'node:assert/strict';
import handler, { pairedTurns } from '../api/assistant-realtime-log.js';

function response() {
  return { setHeader() { return this; }, status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; } };
}

test('paired voice transcript preserves each user question and agent answer', () => {
  const turns = pairedTurns([
    { role: 'agent', message: 'Hello' },
    { role: 'user', message: 'I have a product but need discovery.' },
    { role: 'agent', message: 'I would start with search demand.', llm_usage: { model_usage: {
      'gpt-4.1-mini': { input: { tokens: 120 }, output_total: { tokens: 22 } },
    } } },
    { role: 'user', message: 'What about AI search?' },
    { role: 'agent', message: 'I would map answer surfaces.' },
  ], 'conv_test12345678');
  assert.equal(turns.length, 2);
  assert.match(turns[0].id, /^[0-9a-f-]{36}$/);
  assert.equal(turns[0].question, 'I have a product but need discovery.');
  assert.equal(turns[0].inputTokens, 120);
  assert.equal(turns[0].outputTokens, 22);
  assert.equal(turns[1].answer, 'I would map answer surfaces.');
});

test('server verifies the ElevenLabs agent before logging voice turns to D1', async () => {
  const vars = ['ELEVENLABS_API_KEY', 'ELEVENLABS_REALTIME_AGENT_ID', 'ASSISTANT_LOG_INGEST_URL', 'ASSISTANT_LOG_SECRET'];
  const previous = Object.fromEntries(vars.map((key) => [key, process.env[key]]));
  const oldFetch = global.fetch;
  Object.assign(process.env, { ELEVENLABS_API_KEY: 'test-key', ELEVENLABS_REALTIME_AGENT_ID: 'agent_test',
    ASSISTANT_LOG_INGEST_URL: 'https://log.example', ASSISTANT_LOG_SECRET: 'store-secret' });
  const stored = [];
  global.fetch = async (url, options) => {
    if (String(url).includes('elevenlabs.io')) return { ok: true, json: async () => ({ agent_id: 'agent_test', status: 'done', transcript: [
      { role: 'user', message: 'What can you build?' }, { role: 'agent', message: 'I build products.' },
    ] }) };
    stored.push(JSON.parse(options.body));
    return { ok: true };
  };
  try {
    const req = { method: 'POST', headers: { origin: 'https://www.ankur.works' }, body: {
      vendorConversationId: 'conv_test12345678', conversationId: '11111111-1111-4111-8111-111111111111', page: '/',
    } };
    const res = response();
    await handler(req, res);
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.logged, 1);
    assert.equal(stored[0].channel, 'voice_call');
    assert.equal(stored[0].question, 'What can you build?');
    assert.equal(stored[0].answer, 'I build products.');
    assert.equal(stored[0].model, 'elevenlabs-agent');
    assert.equal(stored[0].siteHost, 'www.ankur.works');
  } finally {
    global.fetch = oldFetch;
    for (const [name, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[name]; else process.env[name] = value;
    }
  }
});
