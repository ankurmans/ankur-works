import { createHash } from 'node:crypto';
import { waitUntil } from '@vercel/functions';
import { verifyVoice } from './assistant-voice-token.js';
import { increment } from './assistant.js';
import { getAssistantCache, putAssistantCache } from './assistant-cache.js';

export const config = { api: { bodyParser: { sizeLimit: '2mb' } } };

const MAX_AUDIO_BYTES = 1_200_000;
const AUDIO_TYPES = new Set(['audio/webm', 'audio/mp4', 'audio/ogg', 'audio/wav', 'audio/mpeg']);

function json(res, status, body) {
  res.setHeader('Cache-Control', 'private, no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  return res.status(status).json(body);
}
function allowedOrigin(req) {
  if (!req.headers.origin) return true;
  try {
    const url = new URL(req.headers.origin);
    return (url.protocol === 'https:' && ['ankur.works', 'www.ankur.works'].includes(url.hostname))
      || (url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname));
  } catch { return false; }
}
async function withinLimit(req, action, cached = false) {
  const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim();
  const ipHash = createHash('sha256').update(ip).digest('hex').slice(0, 16);
  const hour = new Date().toISOString().slice(0, 13);
  const day = hour.slice(0, 10);
  const ipCount = await increment(`ankur-voice:${action}:ip:${ipHash}:${hour}`, 3600);
  const dailyCount = cached ? 0 : await increment(`ankur-voice:${action}:daily:${day}`, 172800);
  const dailyCap = Math.max(1, Number.parseInt(process.env.ASSISTANT_VOICE_DAILY_CAP || '200', 10) || 200);
  const hourlyCap = Math.max(1, Number.parseInt(process.env.ASSISTANT_VOICE_HOURLY_CAP || '60', 10) || 60);
  return ipCount <= hourlyCap && (cached || dailyCount <= dailyCap);
}

export default async function handler(req, res) {
  if (req.method === 'GET') return json(res, 200, { ready: Boolean(process.env.ELEVENLABS_API_KEY) });
  if (req.method !== 'POST') return json(res, 405, { error: 'Use POST.' });
  if (!allowedOrigin(req)) return json(res, 403, { error: 'This site cannot accept that request.' });
  if (!String(req.headers['content-type'] || '').toLowerCase().includes('application/json')) return json(res, 415, { error: 'Send JSON.' });
  if (Number(req.headers['content-length'] || 0) > 1_700_000) return json(res, 413, { error: 'That recording is too large.' });
  let body;
  try { body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body; }
  catch { return json(res, 400, { error: 'That request was not valid JSON.' }); }
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) return json(res, 503, { error: 'Voice is being set up. Please type your question for now.' });
  if (!['transcribe', 'speak'].includes(body?.action)) return json(res, 400, { error: 'Unknown voice action.' });

  if (body.action === 'speak' && (typeof body.text !== 'string' || body.text.length < 1 || body.text.length > 700 || !verifyVoice(body.text, body.token, key)))
    return json(res, 403, { error: 'That voice reply expired. Ask me again to hear it.' });
  if (body.action === 'transcribe') {
    const mime = typeof body.mime === 'string' ? body.mime.split(';')[0] : '';
    if (!AUDIO_TYPES.has(mime) || typeof body.audio !== 'string' || !/^[A-Za-z0-9+/]+={0,2}$/.test(body.audio) || body.audio.length > Math.ceil(MAX_AUDIO_BYTES * 4 / 3) + 4)
      return json(res, 400, { error: 'Please record a shorter voice question.' });
  }

  try {
    const voiceId = process.env.ELEVENLABS_VOICE_ID || '5VWjaX9CdWaweC8OO0dw';
    const audioKey = body.action === 'speak' ? createHash('sha256').update(JSON.stringify({
      text: body.text, voiceId, model: 'eleven_v4_turbo', format: 'mp3_44100_128', stability: 0.5, similarityBoost: 0.8,
    })).digest('hex') : null;
    const cachedAudio = audioKey ? await getAssistantCache('audio', audioKey) : null;
    if (!await withinLimit(req, body.action, Boolean(cachedAudio))) return json(res, 429, { error: 'Voice is busy right now. Please type your question instead.' });
    if (cachedAudio) return json(res, 200, { ...cachedAudio, cache: 'hit' });
    if (body.action === 'transcribe') {
      const bytes = Buffer.from(body.audio, 'base64');
      if (!bytes.length || bytes.length > MAX_AUDIO_BYTES) return json(res, 413, { error: 'Please record a shorter voice question.' });
      const form = new FormData();
      form.set('model_id', 'scribe_v2');
      form.set('file', new Blob([bytes], { type: body.mime.split(';')[0] }), 'question');
      const result = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
        method: 'POST', headers: { 'xi-api-key': key }, body: form, signal: AbortSignal.timeout(20000),
      });
      if (!result.ok) throw new Error(`ElevenLabs transcription returned ${result.status}`);
      const transcript = (await result.json()).text?.trim();
      if (!transcript || transcript.length > 600) return json(res, 422, { error: 'I could not make out a short question. Please try again or type it.' });
      return json(res, 200, { text: transcript });
    }

    const result = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}?output_format=mp3_44100_128`, {
      method: 'POST', headers: { 'xi-api-key': key, 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: body.text, model_id: 'eleven_v4_turbo', voice_settings: { stability: 0.5, similarity_boost: 0.8 } }),
      signal: AbortSignal.timeout(45000),
    });
    if (!result.ok) throw new Error(`ElevenLabs speech returned ${result.status}`);
    const bytes = Buffer.from(await result.arrayBuffer());
    if (!bytes.length || bytes.length > 2_000_000) throw new Error('Voice reply too large');
    const audio = { audio: bytes.toString('base64'), mime: 'audio/mpeg' };
    const write = putAssistantCache('audio', audioKey, audio);
    if (process.env.VERCEL) {
      try { waitUntil(write); }
      catch { await write; }
    } else await write;
    return json(res, 200, { ...audio, cache: 'miss' });
  } catch (error) {
    console.warn('assistant_voice_failure', body.action, error?.name || 'Error', String(error?.message || '').slice(0, 100));
    return json(res, 503, { error: 'Voice is unavailable right now. You can keep chatting by text.' });
  }
}
