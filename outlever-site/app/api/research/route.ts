import { createHash } from "node:crypto";
import { after, NextRequest, NextResponse } from "next/server";
import { RESEARCH_SYSTEM_PROMPT } from "../../../lib/research-prompt";
import { RESEARCH_BRIEF, sourceLinks, sources } from "../../../lib/research-brief";
import { corpusSourceLinks, retrieveResearch } from "../../../lib/retrieve-research";
import { OUTLEVER_SITE_CONTEXT } from "../../../lib/site-context";
import { recordResearchTurn, researchConversationMeta } from "../../../lib/conversation-log";

export const runtime = "nodejs";

type Answer = {
  direct_answer: string;
  evidence: string[];
  boundary: string;
  next_test: string;
  source_ids: string[];
  status: "OBSERVED" | "REPORTED" | "INFERRED" | "HYPOTHESIS" | "UNKNOWN";
};

const cache = new Map<string, { expires: number; answer: Answer }>();
const limits = new Map<string, { expires: number; count: number }>();
const extraction = /\b(?:ignore|override|disregard|reveal|print|show|repeat|bypass).{0,70}(?:system|developer|prompt|instruction|secret|api key)|\b(?:jailbreak|developer mode|system prompt|api key|secret key)\b/i;

function reply(body: object, status = 200) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" } });
}

function cannotGroundAnswer(send = reply) {
  return send({
    direct_answer: "We don’t have enough evidence in the public audit to answer that confidently.",
    evidence: [], boundary: "I could not ground a reliable answer in the dated public evidence brief.",
    next_test: "Check a primary source or obtain the data needed to test the claim.",
    status: "UNKNOWN", sources: [],
  });
}

function originAllowed(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    const url = new URL(origin);
    return (url.protocol === "https:" && url.hostname === "outlever.ankur.works")
      || (url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname));
  } catch { return false; }
}

function limit(key: string, max: number, ms: number) {
  const now = Date.now();
  const previous = limits.get(key);
  const current = previous && previous.expires > now ? previous : { expires: now + ms, count: 0 };
  current.count++;
  limits.set(key, current);
  return current.count <= max;
}

function validAnswer(value: unknown, allowed: Set<string>): value is Answer {
  if (!value || typeof value !== "object") return false;
  const a = value as Record<string, unknown>;
  if (typeof a.direct_answer !== "string" || !a.direct_answer.trim() || a.direct_answer.length > 600) return false;
  if (!Array.isArray(a.evidence) || a.evidence.length > 2 || a.evidence.some((x) => typeof x !== "string" || x.length > 230)) return false;
  if (typeof a.boundary !== "string" || a.boundary.length > 300 || typeof a.next_test !== "string" || a.next_test.length > 300) return false;
  if (!Array.isArray(a.source_ids) || a.source_ids.length > 4 || a.source_ids.some((x) => typeof x !== "string" || !allowed.has(x))) return false;
  if (!["OBSERVED", "REPORTED", "INFERRED", "HYPOTHESIS", "UNKNOWN"].includes(String(a.status))) return false;
  const prose = [a.direct_answer, ...a.evidence, a.boundary, a.next_test].join(" ");
  if (/https?:\/\/|www\.|\b(?:system prompt|developer message|api key|secret key|source_ids)\b/i.test(prose)) return false;
  return true;
}

function answerExceedsEvidence(answer: Answer) {
  const prose = [answer.direct_answer, ...answer.evidence].join(" ");
  if (/\b1[.,]5\s*(?:m|million)\b/i.test(prose) && (answer.status !== "REPORTED" || !answer.source_ids.includes("SUPERPATH"))) return true;
  if (/\b(?:50\+?|fifty(?:-plus)?)\b.{0,50}(?:newsroom|customer)/i.test(prose) && (answer.status !== "REPORTED" || !answer.source_ids.includes("OPERATION"))) return true;
  if (/\b236\b/i.test(prose) && !answer.source_ids.includes("SITEMAP") && !answer.source_ids.includes("F01")) return true;
  if (/\b(?:proven|confirmed|demonstrated)\b.{0,55}\b(?:traffic|ai visibility|citation|cannibali[sz]ation|conversion|revenue)\b/i.test(prose)) return true;
  if (/\b(?:traffic|ai visibility|citation|cannibali[sz]ation|conversion|revenue)\b.{0,55}\b(?:proven|confirmed|demonstrated)\b/i.test(prose)) return true;
  if (answer.status === "OBSERVED" && /\b(?:likely|possibly|probably|may have|could have|would|should|proposed|hypothes[ie]s|recommend)\b/i.test(prose)) return true;
  return false;
}

function commonAnswer(question: string) {
  if (/\b(?:which|what)\b.{0,35}\b(?:published|state of brand|pages|articles)\b.{0,40}\bdefine owned media\b|\bdefine owned media\b.{0,45}\b(?:pages|articles)\b/i.test(question)) return {
    direct_answer: "The observed State of Brand set includes two broad owned-media articles from May and July 2026, a September definition guide, and a separate September implementation guide.",
    evidence: [], boundary: "These are published page topics and dates, not evidence of which page ranks, captures a query, or should become the canonical guide.",
    next_test: "Compare GSC query/page data and URL-level backlinks before assigning final editorial roles.",
    status: "OBSERVED" as const, sources: sourceLinks(["MAY", "JULY", "DEFINITION", "BUILD_GUIDE"]),
  };
  if (/\b(?:evidence|facts?|observation)\b.{0,50}\b(?:maintained|definition|hub)\b|\b(?:maintained|definition|hub)\b.{0,50}\b(?:evidence|facts?|support)\b/i.test(question)) return {
    direct_answer: "The dated evidence is that four State of Brand owned-media pages cover related definitions and implementation questions. A maintained definition hub is Ankur Research’s proposed editorial role for testing, not an observed need proven by search data.",
    evidence: [], boundary: "We do not know whether those pages compete for the same queries or whether a hub would improve discovery.",
    next_test: "Compare GSC query/page series and URL-level backlinks, then test contextual routes before changing URLs.",
    status: "INFERRED" as const, sources: sourceLinks(["MAY", "JULY", "DEFINITION", "BUILD_GUIDE"]),
  };
  if (/\b(?:public capture|audit)\b.{0,50}\bsearch layer\b|\bsearch layer\b.{0,50}\b(?:public capture|audit|show|say)\b/i.test(question)) return {
    direct_answer: "The public capture shows newer owned-media evergreen guides beside a substantial newsroom archive. It also found 20 live homepage-linked news URLs absent from the sitemap at capture.",
    evidence: [], boundary: "This describes public architecture. Search traffic, indexing outcomes, and AI visibility were not measured.",
    next_test: "Review GSC query/page data and the sitemap generation rules before judging performance.",
    status: "OBSERVED" as const, sources: sourceLinks(["STATE", "DEFINITION", "BUILD_GUIDE", "SITEMAP"]),
  };
  if (/\b(?:how|where)\b.{0,35}\b(?:work|fit|operate|be built)\b.{0,35}\b(?:inside|within|at|for)\b.{0,15}\boutlever\b|\boutlever\b.{0,35}\b(?:implement|integrate|operate)\b/i.test(question)) return {
    direct_answer: "It could become an extension of Outlever’s newsroom workflow: map durable buyer questions, maintain answer hubs, route relevant reporting to them, connect State of Brand proof to a buyer page, and monitor search and direct AI answers.",
    evidence: [], boundary: "That is Ankur Research’s product hypothesis. Outlever may already do parts of it internally, and no impact was measured in Phase 1.",
    next_test: "Compare the proposed workflow with Outlever’s existing process and run one bounded pilot.",
    status: "HYPOTHESIS" as const, sources: sourceLinks(["OUTLEVER", "STATE", "FIELD_NOTE"]),
  };
  if (/\b(?:pilot|four.week|4.week)\b.{0,35}\b(?:measure|metrics?|signals?)\b|\b(?:measure|metrics?|signals?)\b.{0,35}\b(?:pilot|four.week|4.week)\b/i.test(question)) return {
    direct_answer: "Measure the baseline and follow-up for GSC query/page signals, URL-level backlinks, and direct AI mentions and citations. If Outlever shares analytics and CRM data, also track qualified actions on the proposed buyer route.",
    evidence: [], boundary: "Those are proposed measures, not results. Four weeks can validate implementation; outcome measurement needs longer.",
    next_test: "Agree on definitions, data access, and a dated baseline before the pilot.", status: "HYPOTHESIS" as const, sources: sourceLinks(["FIELD_NOTE"]),
  };
  if (/\b(?:sitemap|site map)\b.{0,45}\b(?:matter|gap|missing|issue)\b|\b(?:matter|gap|missing|issue)\b.{0,45}\b(?:sitemap|site map)\b/i.test(question)) return {
    direct_answer: "At capture, 20 live State of Brand news URLs linked from the homepage were absent from the XML sitemap. That makes the sitemap incomplete as an inventory for this audit and gives Outlever a specific publishing check to investigate.",
    evidence: [], boundary: "It does not prove those pages were unindexed or receiving less traffic.",
    next_test: "Check the sitemap generation rules and the URLs’ actual index status.", status: "INFERRED" as const, sources: sourceLinks(["STATE", "SITEMAP"]),
  };
  if (/\b(?:how confident|confidence)\b/i.test(question)) return {
    direct_answer: "Confidence is high in the dated public observations, such as live URLs and visible links, and low in any performance or causal diagnosis. The proposed architecture is a hypothesis to test.",
    evidence: [], boundary: "Phase 1 had no GSC, GA4, CRM, URL-level backlink export, or direct AI-answer results.",
    next_test: "Add those private data and repeated tests before making stronger claims.", status: "INFERRED" as const, sources: sourceLinks(["STATE", "SITEMAP", "FIELD_NOTE"]),
  };
  if (/\b(?:prove|disprove|falsif)\b.{0,35}\b(?:thesis|analysis)|\b(?:thesis|analysis)\b.{0,35}\b(?:wrong|false|prove|disprove)/i.test(question)) return {
    direct_answer: "The thesis weakens if private journey data already show a clear, effective buyer route; GSC shows the related articles serve distinct queries; or repeated AI tests and a bounded pilot show no useful signal from the proposed layer.",
    evidence: [], boundary: "None of those disconfirming tests was completed in Phase 1.",
    next_test: "Get the private data, then predefine pilot success and failure signals with Outlever.", status: "HYPOTHESIS" as const, sources: sourceLinks(["FIELD_NOTE"]),
  };
  if (/\b(?:observed|observation)\b.{0,30}\b(?:inferred|inference)|\b(?:inferred|inference)\b.{0,30}\b(?:observed|observation)/i.test(question)) return {
    direct_answer: "Observed: Ankur Research captured live State of Brand pages and the inspected Outlever homepage route. Inferred: those public surfaces raise an editorial-role and buyer-routing question. The Search + AI Capture Layer is a proposal, while traffic and conversion effects remain unknown.",
    evidence: [], boundary: "A public page can verify that a claim was made; it cannot verify the claimed business result.",
    next_test: "Compare the observations with GSC, backlinks, analytics, and direct AI-answer tests.", status: "INFERRED" as const, sources: sourceLinks(["STATE", "SITEMAP", "OUTLEVER", "FIELD_NOTE"]),
  };
  if (/\b(?:what|does|can)\b.{0,25}\bstate of brand\b.{0,25}\bprov(?:e|es|ing)\b/i.test(question)) return {
    direct_answer: "State of Brand is a live publication with at least 236 accessible news URLs in Ankur Research’s dated capture. It is a concrete operating example to inspect, but it does not by itself prove Outlever’s customer outcomes or commercial impact.",
    evidence: [], boundary: "Outlever’s account of how it runs State of Brand is a first-party claim; underlying platform and customer records were not reviewed.",
    next_test: "Request permissioned operating and customer evidence if those outcomes matter to the decision.", status: "OBSERVED" as const, sources: sourceLinks(["STATE", "SITEMAP", "OPERATION"]),
  };
  if (/\b(?:four.week|4.week|pilot)\b.{0,45}\b(?:test|do|measure|look like)\b|\b(?:test|do|measure|look like)\b.{0,45}\b(?:four.week|4.week|pilot)\b/i.test(question)) return {
    direct_answer: "Ankur Research proposes a four-week pilot to establish GSC and URL-level backlink baselines, define editorial roles, prototype one approved Outlever proof route, and run a fixed 15-prompt AI-answer panel.",
    evidence: [], boundary: "This is a test plan, not a measured result. Search, AI, and commercial outcomes need longer follow-up.",
    next_test: "Secure the baseline data and agree on one owned-media cluster to test.", status: "HYPOTHESIS" as const, sources: sourceLinks(["FIELD_NOTE"]),
  };
  if (/\b(?:what evidence|what data|which data)\b.{0,50}\b(?:missing|need|unavailable)|\b(?:missing|unavailable)\b.{0,40}\b(?:evidence|data)\b/i.test(question)) return {
    direct_answer: "Phase 1 lacked Outlever and State of Brand GSC, GA4, CRM/conversion data, URL-level backlink exports, and direct ChatGPT Search, Google AI, or Perplexity answer tests.",
    evidence: [], boundary: "Without those inputs, traffic, AI citations, search competition, redirect choices, conversion effects, and revenue impact remain unknown.",
    next_test: "Obtain dated private exports and run the fixed 15-prompt AI panel.", status: "UNKNOWN" as const, sources: sourceLinks(["FIELD_NOTE"]),
  };
  if (/\b(?:owned.media|editorial|articles?|pages?)\b.{0,50}\boverlap\b|\boverlap\b.{0,50}\b(?:owned.media|editorial|articles?|pages?)\b/i.test(question)) return {
    direct_answer: "State of Brand published several owned-media definition pieces and a separate implementation guide that cover related subjects. The public audit can show the overlap in topics, but it cannot tell us why those editorial choices were made.",
    evidence: [], boundary: "Search competition was not measured; similar subject matter alone does not establish it.",
    next_test: "Compare GSC query/page data, URL-level backlinks, and the intended role of each article.", status: "OBSERVED" as const, sources: sourceLinks(["MAY", "JULY", "DEFINITION", "BUILD_GUIDE"]),
  };
  if (/\b(?:buyer|commercial|proof)\b.{0,40}\b(?:page|destination|bridge)\b|\b(?:page|destination|bridge)\b.{0,40}\b(?:buyer|commercial|proof)\b/i.test(question)) return {
    direct_answer: "Ankur Research proposes a buyer-facing Outlever destination that explains the offer and links to clearly labelled State of Brand proof. The exact page structure and claims should be designed with Outlever before a pilot.",
    evidence: [], boundary: "This is a proposal, not an observed missing conversion path or a proven revenue opportunity.",
    next_test: "Review the current buyer journey and agree on one bounded page concept with Outlever.", status: "HYPOTHESIS" as const, sources: sourceLinks(["OUTLEVER", "OPERATION", "FIELD_NOTE"]),
  };
  if (/^(?:what|who) is outlever\??$/i.test(question)) return {
    direct_answer: "Outlever describes itself as a B2B editorial and newsroom service focused on reaching an ideal customer profile through expert perspectives and human-led distribution.",
    evidence: [], boundary: "That description comes from Outlever’s public site; its performance claims were not independently verified in this audit.",
    next_test: "", status: "REPORTED" as const, sources: sourceLinks(["OUTLEVER"]),
  };
  if (/\b(?:what would you (?:do|change) first|where would you start|first steps?)\b/i.test(question)) return {
    direct_answer: "I’d first get GSC query and page data and inspect URL-level backlinks for the overlapping owned-media articles. Then I’d assign each page an editorial role, connect State of Brand proof to a buyer-facing Outlever page, run the fixed AI prompt panel, and test one bounded pilot.",
    evidence: [], boundary: "That is Ankur Research’s proposed sequence. Phase 1 did not establish a traffic, citation, or conversion problem.",
    next_test: "Request access to the dated GSC and backlink exports.", status: "HYPOTHESIS" as const, sources: sourceLinks(["FIELD_NOTE"]),
  };
  if (/\b(?:search\s*\+\s*ai capture layer)\b/i.test(question) && /\b(?:what|how|explain|mean|do)\b/i.test(question)) return {
    direct_answer: "The Search + AI Capture Layer is Ankur Research’s proposal: map lasting buyer questions to maintained answer pages, connect timely reporting to those pages, show State of Brand proof on a buyer-facing Outlever destination, and measure what search and AI answers actually surface.",
    evidence: [], boundary: "It is a hypothesis. Outlever may already do parts of this internally, and Phase 1 did not test its impact.",
    next_test: "Run one bounded pilot with GSC, backlink, and direct AI-answer baselines.", status: "HYPOTHESIS" as const, sources: sourceLinks(["FIELD_NOTE"]),
  };
  if (/\b(?:how many|236|number of)\b.{0,60}\b(?:news|pages|urls|articles)\b|\b(?:news|pages|urls|articles)\b.{0,60}\b(?:how many|236)\b/i.test(question)) return {
    direct_answer: "Ankur Research observed at least 236 live State of Brand news URLs on 2026-10-01: 216 in the sitemap plus 20 additional homepage-linked URLs.",
    evidence: [], boundary: "That counts accessible URLs at capture, not traffic, readership, indexation, or backlinks.",
    next_test: "Recheck the live URL inventory if a current count is needed.", status: "OBSERVED" as const, sources: sourceLinks(["STATE", "SITEMAP"]),
  };
  return null;
}

function unprovenOutcome(question: string) {
  const exact = "We don’t have enough evidence in the public audit to answer that confidently.";
  const cases: { pattern: RegExp; boundary: string; next_test: string; ids: string[] }[] = [
    { pattern: /(?:traffic|organic).*(?:weak|low|poor|underperform)|(?:weak|low|poor) organic/i,
      boundary: "Outlever and State of Brand Google Search Console and GA4 data were unavailable; traffic weakness is unproven.",
      next_test: "Review dated GSC query/page and GA4 source reports for both properties.", ids: ["FIELD_NOTE"] },
    { pattern: /(?:ai visibility|chatgpt|perplexity|google ai).*(?:weak|absent|cited|citation|strong|perform|doing|well|visible|already)|(?:cited|citation|visibility).*(?:ai|chatgpt|perplexity)/i,
      boundary: "Phase 1 did not run direct AI-answer tests; presence, absence, and citation strength are unknown.",
      next_test: "Run the fixed, repeated 15-prompt panel with full answers, cited URLs, date, and locale.", ids: ["FIELD_NOTE"] },
    { pattern: /cannibali[sz]/i,
      boundary: "Related State of Brand editorial subjects were observed, but search competition was not measured.",
      next_test: "Compare GSC query/page series and URL-level backlinks for the owned-media pages.", ids: ["MAY", "JULY", "DEFINITION", "FIELD_NOTE"] },
    { pattern: /(?:which|what|should|must|definitely).*(?:redirect|canonical)|(?:redirect|canonical).*(?:which|what|should|must)/i,
      boundary: "No redirect target or canonical survivor is supported by Phase 1 evidence.",
      next_test: "Review GSC, URL-level backlinks, index state, and editorial purpose before changing URLs.", ids: ["FIELD_NOTE"] },
    { pattern: /(?:losing|leaking|leakage).*(?:conversion|lead|pipeline)|(?:conversion|lead).*(?:losing|leaking|leakage)/i,
      boundary: "The homepage route was observed, but no GA4 or CRM/conversion data were available; leakage is unproven.",
      next_test: "Define qualified actions and inspect journey and CRM data before changing the commercial route.", ids: ["OUTLEVER", "FIELD_NOTE"] },
    { pattern: /(?:will|guarantee|definitely).*(?:revenue|sales|pipeline)|(?:revenue|sales|pipeline).*(?:guarantee|definitely)/i,
      boundary: "The Search + AI Capture Layer is a hypothesis, and Phase 1 cannot establish revenue impact.",
      next_test: "Run one bounded pilot with a dated baseline and longer follow-up measurement.", ids: ["FIELD_NOTE"] },
  ];
  const selected = cases.find(({ pattern }) => pattern.test(question));
  if (!selected) return null;
  return { direct_answer: exact, evidence: [], boundary: selected.boundary,
    next_test: selected.next_test, status: "UNKNOWN" as const, sources: sourceLinks(selected.ids) };
}

function publicClaim(question: string) {
  if (/\b1[.,]5\s*(?:m|million)\b|\b1\.5m\b/i.test(question) || /monthly unique visitors/i.test(question)) return {
    direct_answer: "Melissa Rosenthal reported that State of Brand reached 1.5 million monthly unique visitors within three months in a June 2026 Superpath AMA.",
    evidence: [], boundary: "This is Melissa Rosenthal’s first-party reported claim. Ankur Research did not review an analytics export or independently verify the figure.",
    next_test: "Request dated analytics exports and the definition of monthly unique visitors.",
    status: "REPORTED" as const, sources: sourceLinks(["SUPERPATH"]),
  };
  if (/\b(?:50\+?|fifty(?:-plus)?)\b.{0,50}(?:newsroom|customer)|(?:newsroom|customer).{0,50}\b(?:50\+?|fifty(?:-plus)?)\b/i.test(question)) return {
    direct_answer: "State of Brand says Outlever’s system powers more than 50 customer brand newsrooms.",
    evidence: [], boundary: "This is a first-party claim; Ankur Research did not inspect a customer list or platform records.",
    next_test: "Request a dated customer definition and permissioned supporting records.",
    status: "REPORTED" as const, sources: sourceLinks(["OPERATION"]),
  };
  return null;
}

function methodologyAnswer(question: string) {
  if (!/(?:ai visibility panel|ai prompt panel|direct ai panel)/i.test(question)) return null;
  return {
    direct_answer: "Ankur Research proposes a fixed 15-prompt panel to check how Outlever and State of Brand appear in direct ChatGPT Search, Google AI, and Perplexity answers.",
    evidence: [], boundary: "The panel is a method proposal. Phase 1 captured no direct AI-answer results, so visibility and citation strength remain unknown.",
    next_test: "Run and repeat the prompts with engine, date, locale, full answer, named brands, and cited URLs recorded.",
    status: "HYPOTHESIS" as const, sources: sourceLinks(["FIELD_NOTE"]),
  };
}

export async function POST(request: NextRequest) {
  if (!originAllowed(request)) return reply({ error: "This site cannot accept that question." }, 403);
  if (!request.headers.get("content-type")?.includes("application/json")) return reply({ error: "Send JSON." }, 415);
  if (Number(request.headers.get("content-length") || 0) > 2000) return reply({ error: "That question is too long." }, 413);
  let input: unknown;
  try {
    const raw = await request.text();
    if (raw.length > 2000) return reply({ error: "That question is too long." }, 413);
    input = JSON.parse(raw);
  } catch { return reply({ error: "That request was not valid JSON." }, 400); }
  const question = typeof (input as { question?: unknown })?.question === "string" ? (input as { question: string }).question.trim() : "";
  if (!question || question.length > 600) return reply({ error: "Ask a shorter question." }, 400);
  const meta = researchConversationMeta(input, request, question);
  const respond = (body: object, status = 200) => {
    if (meta && process.env.ASSISTANT_LOG_INGEST_URL && process.env.ASSISTANT_LOG_SECRET)
      after(() => recordResearchTurn(meta, status, body as Record<string, unknown>));
    return reply(body, status);
  };
  if (extraction.test(question)) return respond({
    direct_answer: "I can help inspect the Outlever and State of Brand research, including what it does and does not prove.",
    evidence: [], boundary: "Private instructions and credentials are outside the public audit.", next_test: "", sources: [], status: "UNKNOWN",
  });
  const unsupported = unprovenOutcome(question);
  if (unsupported) return respond(unsupported);
  const attributed = publicClaim(question);
  if (attributed) return respond(attributed);
  const method = methodologyAnswer(question);
  if (method) return respond(method);
  const common = commonAnswer(question);
  if (common) return respond(common);

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const ipHash = createHash("sha256").update(ip).digest("hex").slice(0, 16);
  if (!limit(`hour:${ipHash}`, 20, 3600_000) || !limit("daily", 100, 86_400_000))
    return respond({ error: "The research assistant has reached its question limit. Please try later." }, 429);
  const cacheKey = createHash("sha256").update(question.toLowerCase()).digest("hex");
  const cached = cache.get(cacheKey);
  if (cached && cached.expires > Date.now()) return respond({ ...cached.answer, sources: [...sourceLinks(cached.answer.source_ids), ...corpusSourceLinks(cached.answer.source_ids)].slice(0, 4) });

  const token = process.env.AI_GATEWAY_API_KEY || request.headers.get("x-vercel-oidc-token") || process.env.VERCEL_OIDC_TOKEN;
  if (!token) return respond({ error: "The research assistant is unavailable right now." }, 503);
  const retrieved = retrieveResearch(question);
  try {
    const response = await fetch("https://ai-gateway.vercel.sh/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: process.env.RESEARCH_ASSISTANT_MODEL || "openai/gpt-5-nano",
        stream: false,
        messages: [
          { role: "system", content: RESEARCH_SYSTEM_PROMPT },
          { role: "user", content: JSON.stringify({ question, SITE_PAGE_CONTEXT: OUTLEVER_SITE_CONTEXT, COMPANY_EVIDENCE_BRIEF: RESEARCH_BRIEF, RETRIEVED_RECORDS: retrieved.context, ALLOWED_SOURCE_IDS: [...Object.keys(sources), ...retrieved.ids] }) },
        ],
        response_format: { type: "json_schema", json_schema: { name: "research_answer", strict: true, schema: {
          type: "object", additionalProperties: false,
          properties: {
            direct_answer: { type: "string" },
            evidence: { type: "array", items: { type: "string" }, maxItems: 2 },
            boundary: { type: "string" }, next_test: { type: "string" },
            source_ids: { type: "array", items: { type: "string" }, maxItems: 4 },
            status: { type: "string", enum: ["OBSERVED", "REPORTED", "INFERRED", "HYPOTHESIS", "UNKNOWN"] },
          },
          required: ["direct_answer", "evidence", "boundary", "next_test", "source_ids", "status"],
        } } },
        reasoning_effort: "minimal", verbosity: "low", max_completion_tokens: 650,
        providerOptions: { gateway: { zeroDataRetention: true, disallowPromptTraining: true } },
      }),
      signal: AbortSignal.timeout(20000),
    });
    if (!response.ok) throw new Error(`Gateway ${response.status}`);
    const raw = (await response.json()).choices?.[0]?.message?.content;
    const answer: unknown = JSON.parse(raw);
    if (!validAnswer(answer, new Set([...Object.keys(sources), ...retrieved.ids]))) return cannotGroundAnswer(respond);
    const checked = answer as Answer;
    if (checked.status !== "UNKNOWN" && !checked.source_ids.length) return cannotGroundAnswer(respond);
    if (answerExceedsEvidence(checked)) return cannotGroundAnswer(respond);
    const links = [...sourceLinks(checked.source_ids), ...corpusSourceLinks(checked.source_ids)].slice(0, 4);
    if (checked.status !== "UNKNOWN" && !links.length) return cannotGroundAnswer(respond);
    checked.direct_answer = checked.direct_answer.trim();
    checked.evidence = checked.evidence.map((point) => point.replace(/^(?:[A-Z_]+\d{2}\s*\/\s*[A-Z_]+:\s*)/i, "").replace(/\s*[([](?:OUTLEVER|STATE|DEFINITION|BUILD_GUIDE|SUPERPATH|MAY|JULY|SITEMAP|OPERATION|FIELD_NOTE)[)\]]/g, "").trim());
    checked.boundary = checked.boundary.trim();
    checked.next_test = checked.next_test.trim();
    if (/^We don[’']t have enough/i.test(checked.direct_answer)) checked.status = "UNKNOWN";
    if (checked.status === "UNKNOWN") {
      const exact = "We don’t have enough evidence in the public audit to answer that confidently.";
      checked.direct_answer = exact;
      checked.source_ids = [];
    }
    cache.set(cacheKey, { expires: Date.now() + 86_400_000, answer: checked });
    return respond({ ...checked, sources: links });
  } catch {
    return respond({ error: "I couldn’t verify an answer right now. Please try again later." }, 503);
  }
}
