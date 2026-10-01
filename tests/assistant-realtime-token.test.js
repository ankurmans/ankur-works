import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/assistant-realtime-token.js';

function response() {
  return { headers: {}, setHeader(name, value) { this.headers[name] = value; return this; },
    status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } };
}

test('real-time call issues a short-lived token to approved site origins when enabled', async () => {
  const names = ['ELEVENLABS_API_KEY', 'ELEVENLABS_REALTIME_AGENT_ID', 'ASSISTANT_REALTIME_ENABLED'];
  const old = Object.fromEntries(names.map((name) => [name, process.env[name]]));
  const oldFetch = global.fetch;
  process.env.ELEVENLABS_API_KEY = 'test-secret';
  process.env.ELEVENLABS_REALTIME_AGENT_ID = 'agent_test';
  process.env.ASSISTANT_REALTIME_ENABLED = '1';
  let upstreamCalls = 0;
  global.fetch = async (url, options) => {
    upstreamCalls++;
    assert.match(url, /\/conversation\/token\?agent_id=agent_test$/);
    assert.equal(options.headers['xi-api-key'], 'test-secret');
    return { ok: true, json: async () => ({ token: 'short-lived-client-token' }) };
  };
  try {
    const remote = response();
    await handler({ method: 'POST', headers: { origin: 'https://other.example' } }, remote);
    assert.equal(remote.statusCode, 403);
    assert.equal(upstreamCalls, 0);
    const local = response();
    await handler({ method: 'POST', headers: { origin: 'http://127.0.0.1:5184', 'x-forwarded-for': '127.0.0.91' } }, local);
    assert.equal(local.statusCode, 200);
    assert.deepEqual(local.body, { token: 'short-lived-client-token' });
    assert.equal(local.headers['Cache-Control'], 'private, no-store');
    const production = response();
    await handler({ method: 'POST', headers: { origin: 'https://www.ankur.works', 'x-forwarded-for': '127.0.0.92' } }, production);
    assert.equal(production.statusCode, 200);
    assert.equal(upstreamCalls, 2);
  } finally {
    global.fetch = oldFetch;
    for (const [name, value] of Object.entries(old)) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  }
});
