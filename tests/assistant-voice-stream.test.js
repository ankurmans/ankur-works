import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import handler from '../api/assistant-voice-stream.js';
import { signVoice } from '../api/assistant-voice-token.js';

class ResponseMock extends EventEmitter {
  constructor() { super(); this.headers = {}; this.chunks = []; this.statusCode = 200; }
  setHeader(name, value) { this.headers[name] = value; return this; }
  status(code) { this.statusCode = code; return this; }
  json(value) { this.body = value; return this; }
  write(value) { this.chunks.push(Buffer.from(value)); return true; }
  end(value) { if (value) this.chunks.push(Buffer.from(value)); this.ended = true; return this; }
}

test('signed voice reply streams audio chunks without exposing the ElevenLabs key', async () => {
  const oldKey = process.env.ELEVENLABS_API_KEY;
  const oldFetch = global.fetch;
  process.env.ELEVENLABS_API_KEY = 'test-only-voice-key';
  const text = 'I built Pepys to make recordings useful.';
  const seen = [];
  global.fetch = async (url, options) => {
    seen.push({ url, options });
    return { ok: true, body: new ReadableStream({ start(controller) {
      controller.enqueue(new Uint8Array([0x49, 0x44, 0x33]));
      controller.enqueue(new Uint8Array([1, 2, 3]));
      controller.close();
    } }) };
  };
  try {
    const req = { method: 'POST', headers: { origin: 'https://www.ankur.works', 'content-type': 'application/json',
      'x-forwarded-for': '198.51.100.81' }, body: { text, token: signVoice(text, process.env.ELEVENLABS_API_KEY) } };
    const res = new ResponseMock();
    await handler(req, res);
    assert.equal(res.statusCode, 200);
    assert.equal(res.headers['Content-Type'], 'audio/mpeg');
    assert.equal(res.headers['Cache-Control'], 'private, no-store');
    assert.equal(res.chunks.length, 2);
    assert.equal(Buffer.concat(res.chunks).toString('hex'), '494433010203');
    assert.equal(seen.length, 1);
    assert.match(seen[0].url, /\/stream\?output_format=mp3_44100_128$/);
    assert.equal(seen[0].options.headers['xi-api-key'], 'test-only-voice-key');
    assert.equal(JSON.parse(seen[0].options.body).model_id, 'eleven_v4_turbo');
    const invented = new ResponseMock();
    await handler({ ...req, body: { text: 'Invented.', token: req.body.token } }, invented);
    assert.equal(invented.statusCode, 403);
  } finally {
    global.fetch = oldFetch;
    if (oldKey === undefined) delete process.env.ELEVENLABS_API_KEY;
    else process.env.ELEVENLABS_API_KEY = oldKey;
  }
});
