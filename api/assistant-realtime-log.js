import { createHash } from 'node:crypto';
import { recordConversationTurn } from './conversation-logging.js';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const VENDOR_ID = /^conv_[a-zA-Z0-9_-]{8,100}$/;

function reply(res, status, body) {
  res.setHeader('Cache-Control', 'private, no-store');
  return res.status(status).json(body);
}

function originHost(req) {
  try {
    const url = new URL(req.headers.origin);
    if (url.protocol === 'https:' && ['ankur.works', 'www.ankur.works'].includes(url.hostname)) return url.hostname;
    if (url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname)) return url.hostname;
  } catch { /* Unknown origin. */ }
  return null;
}

function turnId(vendorId, index) {
  const hex = createHash('sha256').update(`${vendorId}:${index}`).digest('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-8${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

export function pairedTurns(transcript, vendorId) {
  if (!Array.isArray(transcript)) return [];
  const turns = [];
  let question = '';
  for (const item of transcript) {
    const message = typeof item?.message === 'string' ? item.message.trim() : '';
    if (!message) continue;
    if (item.role === 'user') {
      if (question) turns.push({ id: turnId(vendorId, turns.length), question: question.slice(0, 600), answer: '' });
      question = message;
    } else if (item.role === 'agent' && question) {
      const usage = Object.entries(item.llm_usage?.model_usage || {});
      turns.push({
        id: turnId(vendorId, turns.length), question: question.slice(0, 600), answer: message.slice(0, 1800),
        model: usage[0]?.[0] || 'elevenlabs-agent',
        inputTokens: usage.reduce((sum, [, value]) => sum + (value?.input?.tokens || 0), 0),
        outputTokens: usage.reduce((sum, [, value]) => sum + (value?.output_total?.tokens || 0), 0),
      });
      question = '';
    }
  }
  if (question) turns.push({ id: turnId(vendorId, turns.length), question: question.slice(0, 600), answer: '' });
  return turns.slice(0, 30);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return reply(res, 405, { error: 'Use POST.' });
  const siteHost = originHost(req);
  let body;
  try { body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {}; }
  catch { return reply(res, 400, { error: 'Invalid call.' }); }
  if (!siteHost || !UUID.test(body.conversationId || '') || !VENDOR_ID.test(body.vendorConversationId || '')
    || typeof body.page !== 'string' || !/^\/[a-z0-9/-]{0,100}$/.test(body.page)) {
    return reply(res, 400, { error: 'Invalid call.' });
  }
  const key = process.env.ELEVENLABS_API_KEY;
  const agentId = process.env.ELEVENLABS_REALTIME_AGENT_ID;
  if (!key || !agentId) return reply(res, 503, { error: 'Call logging is unavailable.' });
  try {
    let details;
    for (let attempt = 0; attempt < 3; attempt++) {
      const upstream = await fetch(`https://api.elevenlabs.io/v1/convai/conversations/${encodeURIComponent(body.vendorConversationId)}`, {
        headers: { 'xi-api-key': key }, signal: AbortSignal.timeout(10000),
      });
      if (!upstream.ok) throw new Error(`conversation lookup returned ${upstream.status}`);
      details = await upstream.json();
      if (details.agent_id !== agentId) return reply(res, 403, { error: 'Unknown agent.' });
      if (details.status === 'done' || details.status === 'failed') break;
      await new Promise((resolve) => setTimeout(resolve, 1200));
    }
    const turns = pairedTurns(details.transcript, body.vendorConversationId);
    for (const turn of turns) {
      await recordConversationTurn({
        conversationId: body.conversationId, turnId: turn.id, channel: 'voice_call', siteHost,
        pagePath: body.page, question: turn.question,
      }, 200, { answer: turn.answer, outcome: turn.answer ? 'answered' : 'refused', sources: [],
        usage: { model: turn.model || 'elevenlabs-agent', inputTokens: turn.inputTokens, outputTokens: turn.outputTokens } });
    }
    return reply(res, 200, { logged: turns.length });
  } catch (error) {
    console.warn('assistant_realtime_log_failure', String(error?.message || '').slice(0, 100));
    return reply(res, 503, { error: 'Call transcript could not be saved yet.' });
  }
}
