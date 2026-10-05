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
  ...records.map((record) => `\n[${record.id}] ${record.title}\n${record.url ? `Public source: https://www.ankur.works${record.url}\n` : ''}${record.evidence_type ? `Evidence type: ${record.evidence_type}\n` : ''}${record.provenance ? `Provenance: ${record.provenance}\n` : ''}${record.last_verified ? `Last verified: ${record.last_verified}\n` : ''}${record.text}`),
].join('\n');
const prompt = readFileSync('knowledge/realtime-agent-prompt.txt', 'utf8').trim();
const languagePresets = {
  es: { overrides: { agent: { first_message: 'Hola, soy el gemelo de IA de Ankur. ¿En qué estás trabajando?' } } },
  fr: { overrides: { agent: { first_message: "Bonjour, je suis le jumeau IA d’Ankur. Sur quoi travaillez-vous ?" } } },
  de: { overrides: { agent: { first_message: 'Hallo, ich bin Ankurs KI-Zwilling. Woran arbeitest du gerade?' } } },
  it: { overrides: { agent: { first_message: "Ciao, sono il gemello IA di Ankur. A cosa stai lavorando?" } } },
  pt: { overrides: { agent: { first_message: 'Olá, sou o gêmeo de IA do Ankur. No que você está trabalhando?' } } },
  hi: { overrides: { agent: { first_message: 'नमस्ते, मैं अंकुर का एआई ट्विन हूँ। आप किस पर काम कर रहे हैं?' } } },
  ja: { overrides: { agent: { first_message: 'こんにちは、アンクルのAIツインです。今、何に取り組んでいますか？' } } },
  zh: { overrides: { agent: { first_message: '你好，我是 Ankur 的 AI 分身。你现在在做什么项目？' } } },
};
const headers = { 'xi-api-key': key, 'Content-Type': 'application/json' };

async function patch(path, body) {
  const response = await fetch(`https://api.elevenlabs.io/v1/convai/${path}`, {
    method: 'PATCH', headers, body: JSON.stringify(body), signal: AbortSignal.timeout(20000),
  });
  if (!response.ok) throw new Error(`ElevenLabs ${path} returned ${response.status}: ${(await response.text()).slice(0, 200)}`);
}

const agentResponse = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${encodeURIComponent(agentId)}`, {
  headers: { 'xi-api-key': key }, signal: AbortSignal.timeout(20000),
});
if (!agentResponse.ok) throw new Error(`ElevenLabs agent read returned ${agentResponse.status}`);
const agent = await agentResponse.json();
const existingTools = Object.fromEntries(Object.entries(agent.conversation_config?.agent?.prompt?.built_in_tools || {})
  .filter(([, tool]) => tool));
await patch(`knowledge-base/${encodeURIComponent(documentId)}`, { content });
await patch(`agents/${encodeURIComponent(agentId)}`, {
  conversation_config: {
    agent: { prompt: { prompt, built_in_tools: {
      ...existingTools,
      language_detection: {
        type: 'system', name: 'language_detection', description: '',
        params: { system_tool_type: 'language_detection' },
      },
    } } },
    language_presets: { ...agent.conversation_config?.language_presets, ...languagePresets },
  },
});
console.log(`Synced ${records.length} approved records, the voice prompt, and ${Object.keys(languagePresets).length} additional languages to the private ElevenLabs agent.`);
