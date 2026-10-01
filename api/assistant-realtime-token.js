import { withinLimit } from './assistant-voice.js';

function reply(res, status, body) {
  res.setHeader('Cache-Control', 'private, no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  return res.status(status).json(body);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return reply(res, 405, { error: 'Use POST.' });
  const origin = req.headers.origin || '';
  let allowed = false;
  try {
    const url = new URL(origin);
    allowed = (url.protocol === 'https:' && ['ankur.works', 'www.ankur.works'].includes(url.hostname))
      || (url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname));
  } catch { /* Require a known browser origin. */ }
  if (!allowed || process.env.ASSISTANT_REALTIME_ENABLED !== '1') return reply(res, 403, { error: 'Real-time voice is unavailable.' });
  const key = process.env.ELEVENLABS_API_KEY;
  const agentId = process.env.ELEVENLABS_REALTIME_AGENT_ID;
  if (!key || !agentId) return reply(res, 503, { error: 'Real-time voice is not configured.' });
  try {
    if (!await withinLimit(req, 'realtime')) return reply(res, 429, { error: 'Voice call limit reached.' });
    const upstream = await fetch(`https://api.elevenlabs.io/v1/convai/conversation/token?agent_id=${encodeURIComponent(agentId)}`, {
      headers: { 'xi-api-key': key }, signal: AbortSignal.timeout(10000),
    });
    if (!upstream.ok) throw new Error(`ElevenLabs token request returned ${upstream.status}`);
    const data = await upstream.json();
    if (!data.token) throw new Error('ElevenLabs token missing');
    return reply(res, 200, { token: data.token });
  } catch (error) {
    console.warn('assistant_realtime_token_failure', String(error?.message || '').slice(0, 120));
    return reply(res, 503, { error: 'Real-time voice could not connect.' });
  }
}
