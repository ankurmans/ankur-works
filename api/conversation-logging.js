const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const CHANNELS = new Set(['chat', 'dictation', 'voice_call']);

export function conversationMeta(body, req) {
  if (!UUID.test(body?.conversationId || '') || !UUID.test(body?.turnId || '') || !CHANNELS.has(body?.channel)) return null;
  let siteHost;
  try {
    siteHost = new URL(req.headers.origin || `https://${req.headers.host}`).hostname;
  } catch { return null; }
  if (siteHost !== 'ankur.works' && siteHost !== 'localhost' && siteHost !== '127.0.0.1'
    && !/^[a-z0-9-]+\.ankur\.works$/.test(siteHost)) return null;
  return {
    conversationId: body.conversationId,
    turnId: body.turnId,
    channel: body.channel,
    siteHost,
    pagePath: typeof body.page === 'string' && /^\/[a-z0-9/-]{0,100}$/.test(body.page) ? body.page : '/',
    question: body.question.trim(),
  };
}

export async function recordConversationTurn(meta, status, response) {
  if (!meta) return;
  const endpoint = process.env.ASSISTANT_LOG_INGEST_URL;
  const secret = process.env.ASSISTANT_LOG_SECRET;
  if (!endpoint || !secret) return;
  const answer = typeof response?.answer === 'string' ? response.answer : typeof response?.error === 'string' ? response.error : '';
  const payload = {
    ...meta,
    assistantKind: 'ai_twin',
    answer: answer.slice(0, 1800),
    outcome: status === 200 ? response?.outcome || 'answered' : 'error',
    status,
    sources: (response?.sources || []).map((source) => source.url).filter((url) => typeof url === 'string').slice(0, 3),
    cache: typeof response?.cache === 'string' ? response.cache : null,
    model: typeof response?.usage?.model === 'string' ? response.usage.model : null,
    inputTokens: Number.isSafeInteger(response?.usage?.inputTokens) ? response.usage.inputTokens : null,
    outputTokens: Number.isSafeInteger(response?.usage?.outputTokens) ? response.usage.outputTokens : null,
  };
  try {
    const result = await fetch(`${endpoint.replace(/\/$/, '')}/turns`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(12000),
    });
    if (!result.ok) throw new Error(`store returned ${result.status}`);
  } catch (error) {
    // A storage outage cannot block the conversation. Never log user text or credentials.
    if (process.env.NODE_ENV !== 'test') console.warn('assistant_conversation_store_failure', error?.name || 'Error', String(error?.message || '').slice(0, 70));
  }
}
