import test from 'node:test';
import assert from 'node:assert/strict';
import voiceHandler from '../api/assistant-voice.js';
import { signVoice, verifyVoice } from '../api/assistant-voice-token.js';

function request(body, headers = {}) {
  return { method: 'POST', headers: { origin: 'http://localhost:5173', 'content-type': 'application/json', ...headers }, body, socket: { remoteAddress: '127.0.0.31' } };
}
function response() {
  return { statusCode: 200, headers: {}, setHeader(name, value) { this.headers[name] = value; return this; }, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } };
}

test('voice token binds the exact answer and expires', () => {
  const token = signVoice('My answer.', 'test-key', 1000);
  assert.equal(verifyVoice('My answer.', token, 'test-key', 1001), true);
  assert.equal(verifyVoice('A different answer.', token, 'test-key', 1001), false);
  assert.equal(verifyVoice('My answer.', token, 'test-key', 301001), false);
});

test('voice endpoint rejects invented speech and oversized recordings', async () => {
  const oldKey = process.env.ELEVENLABS_API_KEY;
  process.env.ELEVENLABS_API_KEY = 'test-only-voice-key';
  try {
    const invented = response();
    await voiceHandler(request({ action: 'speak', text: 'Invented text.', token: signVoice('A real answer.', process.env.ELEVENLABS_API_KEY) }), invented);
    assert.equal(invented.statusCode, 403);
    const oversized = response();
    await voiceHandler(request({ action: 'transcribe', mime: 'audio/webm', audio: 'A'.repeat(1_700_000) }), oversized);
    assert.equal(oversized.statusCode, 400);
  } finally {
    if (oldKey === undefined) delete process.env.ELEVENLABS_API_KEY;
    else process.env.ELEVENLABS_API_KEY = oldKey;
  }
});

test('a signed reply is synthesized through the server without exposing the key', async () => {
  const oldKey = process.env.ELEVENLABS_API_KEY;
  const oldFetch = global.fetch;
  process.env.ELEVENLABS_API_KEY = 'test-only-voice-key';
  let upstream = '';
  global.fetch = async (url, options) => {
    upstream = String(url);
    assert.equal(options.headers['xi-api-key'], 'test-only-voice-key');
    const payload = JSON.parse(options.body);
    assert.equal(payload.model_id, 'eleven_v4_turbo');
    assert.deepEqual(payload.voice_settings, { stability: 0.5, similarity_boost: 0.8 });
    return { ok: true, arrayBuffer: async () => Uint8Array.from([73, 68, 51]).buffer };
  };
  try {
    const text = 'I build software.';
    const res = response();
    await voiceHandler(request({ action: 'speak', text, token: signVoice(text, process.env.ELEVENLABS_API_KEY) }), res);
    assert.equal(res.statusCode, 200);
    assert.match(upstream, /\/v1\/text-to-speech\//);
    assert.equal(res.body.mime, 'audio/mpeg');
    assert.equal(Buffer.from(res.body.audio, 'base64').toString(), 'ID3');
  } finally {
    global.fetch = oldFetch;
    if (oldKey === undefined) delete process.env.ELEVENLABS_API_KEY;
    else process.env.ELEVENLABS_API_KEY = oldKey;
  }
});

test('a repeated signed reply reuses stored audio instead of calling ElevenLabs again', async () => {
  const oldFetch = global.fetch;
  const oldKey = process.env.ELEVENLABS_API_KEY;
  const oldUrl = process.env.ASSISTANT_LOG_INGEST_URL;
  const oldSecret = process.env.ASSISTANT_LOG_SECRET;
  process.env.ELEVENLABS_API_KEY = 'test-only-voice-key';
  process.env.ASSISTANT_LOG_INGEST_URL = 'https://cache.example.workers.dev';
  process.env.ASSISTANT_LOG_SECRET = 'test-only-cache-secret';
  const stored = new Map();
  let syntheses = 0;
  global.fetch = async (url, options = {}) => {
    const address = String(url);
    if (address.startsWith('https://cache.example.workers.dev/cache/audio/')) {
      assert.equal(options.headers.Authorization, 'Bearer test-only-cache-secret');
      if (options.method === 'PUT') { stored.set(address, JSON.parse(options.body)); return { ok: true, status: 201 }; }
      return stored.has(address) ? { ok: true, status: 200, json: async () => stored.get(address) }
        : { ok: false, status: 404 };
    }
    syntheses++;
    assert.match(address, /api\.elevenlabs\.io\/v1\/text-to-speech/);
    return { ok: true, arrayBuffer: async () => Uint8Array.from([73, 68, 51]).buffer };
  };
  try {
    const text = 'I build software.';
    const body = { action: 'speak', text, token: signVoice(text, process.env.ELEVENLABS_API_KEY) };
    const first = response();
    const second = response();
    await voiceHandler(request(body, { 'x-forwarded-for': '127.0.0.42' }), first);
    await voiceHandler(request(body, { 'x-forwarded-for': '127.0.0.42' }), second);
    assert.equal(first.body.cache, 'miss');
    assert.equal(second.body.cache, 'hit');
    assert.equal(second.body.audio, first.body.audio);
    assert.equal(syntheses, 1);
  } finally {
    global.fetch = oldFetch;
    for (const [name, value] of Object.entries({ ELEVENLABS_API_KEY: oldKey, ASSISTANT_LOG_INGEST_URL: oldUrl, ASSISTANT_LOG_SECRET: oldSecret })) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  }
});
