import { readFileSync } from 'node:fs';
import { loadEnv } from 'vite';

const env = loadEnv('development', process.cwd(), 'ELEVENLABS_');
const key = process.env.ELEVENLABS_API_KEY || env.ELEVENLABS_API_KEY;
const agentId = process.env.ELEVENLABS_REALTIME_AGENT_ID || env.ELEVENLABS_REALTIME_AGENT_ID;
const documentId = process.env.ELEVENLABS_REALTIME_KB_ID || env.ELEVENLABS_REALTIME_KB_ID;
if (!key || !agentId || !documentId) throw new Error('Set the ElevenLabs key, real-time agent ID, and KB ID.');

const records = JSON.parse(readFileSync('api/assistant-knowledge.json', 'utf8'));
const content = [
  'APPROVED ANKUR.WORKS FACTS, from the current site corpus. Each record is separate. Do not make claims beyond these records.',
  ...records.map((record) => `\n[${record.id}] ${record.title}\nSource: https://www.ankur.works${record.url}\n${record.text}`),
].join('\n');
const prompt = readFileSync('knowledge/realtime-agent-prompt.txt', 'utf8').trim();
const headers = { 'xi-api-key': key, 'Content-Type': 'application/json' };

async function patch(path, body) {
  const response = await fetch(`https://api.elevenlabs.io/v1/convai/${path}`, {
    method: 'PATCH', headers, body: JSON.stringify(body), signal: AbortSignal.timeout(20000),
  });
  if (!response.ok) throw new Error(`ElevenLabs ${path} returned ${response.status}: ${(await response.text()).slice(0, 200)}`);
}

await patch(`knowledge-base/${encodeURIComponent(documentId)}`, { content });
await patch(`agents/${encodeURIComponent(agentId)}`, { conversation_config: { agent: { prompt: { prompt } } } });
console.log(`Synced ${records.length} approved records and the voice prompt to the private ElevenLabs agent.`);
