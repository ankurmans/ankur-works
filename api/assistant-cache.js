const DIGEST = /^[a-f0-9]{64}$/;

function endpoint(kind, digest) {
  const base = process.env.ASSISTANT_LOG_INGEST_URL;
  const secret = process.env.ASSISTANT_LOG_SECRET;
  if (!base || !secret || !['chat', 'audio'].includes(kind) || !DIGEST.test(digest)) return null;
  return { url: `${base.replace(/\/$/, '')}/cache/${kind}/${digest}`, secret };
}

export async function getAssistantCache(kind, digest) {
  const target = endpoint(kind, digest);
  if (!target) return null;
  try {
    const response = await fetch(target.url, {
      headers: { Authorization: `Bearer ${target.secret}` }, signal: AbortSignal.timeout(2500),
    });
    if (response.status === 404) return null;
    if (!response.ok) throw new Error(`Cache returned ${response.status}`);
    return await response.json();
  } catch {
    return null;
  }
}

export async function putAssistantCache(kind, digest, value) {
  const target = endpoint(kind, digest);
  if (!target) return false;
  try {
    const response = await fetch(target.url, {
      method: 'PUT', headers: { Authorization: `Bearer ${target.secret}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(value), signal: AbortSignal.timeout(8000),
    });
    return response.ok;
  } catch {
    return false;
  }
}
