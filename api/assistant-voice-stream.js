import { waitUntil } from '@vercel/functions';
import { verifyVoice } from './assistant-voice-token.js';
import { voiceCacheKey, withinLimit } from './assistant-voice.js';
import { getAssistantCache, putAssistantCache } from './assistant-cache.js';

export const config = { api: { bodyParser: { sizeLimit: '10kb' } } };
const MAX_AUDIO_BYTES = 2_000_000;

function fail(res, status, error) {
  res.setHeader('Cache-Control', 'private, no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  return res.status(status).json({ error });
}

function allowedOrigin(req) {
  if (!req.headers.origin) return true;
  try {
    const url = new URL(req.headers.origin);
    return url.protocol === 'https:' && ['ankur.works', 'www.ankur.works'].includes(url.hostname)
      || url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname);
  } catch { return false; }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return fail(res, 405, 'Use POST.');
  if (!allowedOrigin(req)) return fail(res, 403, 'This site cannot accept that request.');
  if (!String(req.headers['content-type'] || '').toLowerCase().includes('application/json')) return fail(res, 415, 'Send JSON.');
  if (Number(req.headers['content-length'] || 0) > 5000) return fail(res, 413, 'That voice request is too large.');
  let body;
  try { body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body; }
  catch { return fail(res, 400, 'That request was not valid JSON.'); }
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) return fail(res, 503, 'Voice is unavailable right now.');
  if (typeof body?.text !== 'string' || body.text.length < 1 || body.text.length > 700 || !verifyVoice(body.text, body.token, key))
    return fail(res, 403, 'That voice reply expired. Ask me again to hear it.');

  const voiceId = process.env.ELEVENLABS_VOICE_ID || '5VWjaX9CdWaweC8OO0dw';
  const digest = voiceCacheKey(body.text, voiceId);
  try {
    const cached = await getAssistantCache('audio', digest);
    if (!await withinLimit(req, 'speak', Boolean(cached))) return fail(res, 429, 'Voice is busy right now.');
    if (cached) {
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Cache-Control', 'private, no-store');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Audio-Cache', 'hit');
      return res.status(200).end(Buffer.from(cached.audio, 'base64'));
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 45000);
    const onClose = () => controller.abort();
    res.on?.('close', onClose);
    try {
      const upstream = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}/stream?output_format=mp3_44100_128`, {
        method: 'POST', headers: { 'xi-api-key': key, 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: body.text, model_id: 'eleven_v4_turbo', voice_settings: { stability: 0.5, similarity_boost: 0.8 } }),
        signal: controller.signal,
      });
      if (!upstream.ok || !upstream.body) throw new Error(`ElevenLabs stream returned ${upstream.status}`);
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Cache-Control', 'private, no-store');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Audio-Cache', 'miss');
      res.status(200);
      const reader = upstream.body.getReader();
      const chunks = [];
      let bytes = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        bytes += value.byteLength;
        if (bytes > MAX_AUDIO_BYTES) throw new Error('Voice reply too large');
        const chunk = Buffer.from(value);
        chunks.push(chunk);
        if (!res.write(chunk)) await new Promise((resolve) => res.once('drain', resolve));
      }
      if (!bytes) throw new Error('Empty voice reply');
      res.end();
      const audio = { audio: Buffer.concat(chunks).toString('base64'), mime: 'audio/mpeg' };
      const write = putAssistantCache('audio', digest, audio);
      if (process.env.VERCEL) {
        try { waitUntil(write); }
        catch { await write; }
      } else await write;
    } finally {
      clearTimeout(timeout);
      res.off?.('close', onClose);
    }
  } catch (error) {
    console.warn('assistant_voice_stream_failure', error?.name || 'Error', String(error?.message || '').slice(0, 100));
    if (res.headersSent) res.destroy?.(error);
    else return fail(res, 503, 'Voice is unavailable right now. You can keep chatting by text.');
  }
}
