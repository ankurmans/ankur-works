const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type ResearchMeta = { conversationId: string; turnId: string; question: string; siteHost: string };

export function researchConversationMeta(input: unknown, request: Request, question: string): ResearchMeta | null {
  if (!input || typeof input !== "object") return null;
  const ids = input as { conversationId?: unknown; turnId?: unknown };
  if (typeof ids.conversationId !== "string" || !UUID.test(ids.conversationId)
    || typeof ids.turnId !== "string" || !UUID.test(ids.turnId)) return null;
  const siteHost = new URL(request.url).hostname;
  if (siteHost !== "outlever.ankur.works" && siteHost !== "localhost" && siteHost !== "127.0.0.1") return null;
  return { conversationId: ids.conversationId, turnId: ids.turnId, question, siteHost };
}

export async function recordResearchTurn(meta: ResearchMeta, status: number, response: Record<string, unknown>) {
  const url = process.env.ASSISTANT_LOG_INGEST_URL;
  const secret = process.env.ASSISTANT_LOG_SECRET;
  if (!url || !secret) return;
  const evidence = Array.isArray(response.evidence) ? response.evidence.filter((item): item is string => typeof item === "string") : [];
  const answer = [response.direct_answer, ...evidence, response.boundary, response.next_test]
    .filter((part): part is string => typeof part === "string" && Boolean(part.trim())).join("\n").slice(0, 1800)
    || (typeof response.error === "string" ? response.error : "");
  const sources = Array.isArray(response.sources) ? response.sources.flatMap((source) =>
    source && typeof source === "object" && "url" in source && typeof source.url === "string" ? [source.url] : []).slice(0, 3) : [];
  const payload = {
    ...meta, assistantKind: "outlever_research", channel: "chat", pagePath: "/", answer,
    outcome: status === 200 ? response.status === "UNKNOWN" ? "refused" : "answered" : "error",
    status, sources, cache: null, model: null, inputTokens: null, outputTokens: null,
  };
  try {
    const result = await fetch(`${url.replace(/\/$/, "")}/turns`, {
      method: "POST", headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload), signal: AbortSignal.timeout(12000),
    });
    if (!result.ok) throw new Error(`store returned ${result.status}`);
  } catch (error) {
    console.warn("research_conversation_store_failure", error instanceof Error ? error.name : "Error");
  }
}
