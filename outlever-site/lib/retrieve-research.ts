import corpusData from "./research-corpus.generated.json";
import { sourceMap } from "../app/data";

type RecordEntry = {
  id: string;
  type: string;
  statement?: string;
  question?: string;
  answer?: string;
  action?: string;
  caveat?: string;
  source_url?: string;
  supporting_source_urls?: string[];
  captured_date?: string;
  required_data?: string;
  test_required?: string;
  supporting_object_ids?: string[];
  supporting_fact_ids?: string[];
};

const corpus = corpusData as RecordEntry[];
const knownTitles = new Map<string, string>(Object.values(sourceMap).map((source) => [source.url, source.title]));
const byId = new Map(corpus.map((entry) => [entry.id, entry]));
const stop = new Set(["the", "this", "that", "with", "what", "where", "when", "would", "could", "should", "from", "into", "have", "about", "their", "there", "these", "those", "does", "will", "your", "outlever", "state", "brand"]);

function terms(value: string) {
  return [...new Set((value.toLowerCase().match(/[a-z0-9]+/g) || []).filter((word) => word.length > 2 && !stop.has(word)))];
}

function searchable(entry: RecordEntry) {
  return [entry.statement, entry.question, entry.answer, entry.action, entry.caveat, entry.required_data, entry.test_required].filter(Boolean).join(" ");
}

function summarize(entry: RecordEntry) {
  const fields = [
    entry.statement && `STATEMENT: ${entry.statement}`,
    entry.question && `QUESTION: ${entry.question}`,
    entry.answer && `ANSWER: ${entry.answer}`,
    entry.action && `ACTION: ${entry.action}`,
    entry.caveat && `CAVEAT: ${entry.caveat}`,
    entry.required_data && `REQUIRED DATA: ${entry.required_data}`,
    entry.test_required && `TEST: ${entry.test_required}`,
    entry.source_url && `SOURCE URL: ${entry.source_url}`,
    entry.captured_date && `CAPTURED: ${entry.captured_date}`,
  ].filter(Boolean);
  return `[${entry.id} / ${entry.type}] ${fields.join(" | ")}`;
}

export function retrieveResearch(question: string) {
  const query = terms(question);
  if (!query.length) return { context: "", ids: [] as string[] };
  const scored = corpus.map((entry) => {
    const body = searchable(entry).toLowerCase();
    const entryTerms = new Set(terms(body));
    let score = query.reduce((sum, word) => sum + (entryTerms.has(word) ? 2 : 0), 0);
    if (entry.question && query.length > 1 && query.every((word) => entryTerms.has(word))) score += 5;
    if (["FAQ", "MELISSA_QUESTION", "SCEPTICAL_QUESTION", "IMPLEMENTATION_QUESTION"].includes(entry.type)) score += 1;
    if (entry.type === "UNKNOWN" && /missing|unknown|prove|wrong|test|evidence|traffic|visibility|index|backlink|conversion/i.test(question)) score += 2;
    return { entry, score };
  }).filter((item) => item.score > 1).sort((a, b) => b.score - a.score).slice(0, 6);
  const selected = new Map<string, RecordEntry>();
  for (const { entry } of scored) {
    selected.set(entry.id, entry);
    for (const id of [...(entry.supporting_object_ids || []), ...(entry.supporting_fact_ids || [])].slice(0, 3)) {
      const support = byId.get(id);
      if (support) selected.set(id, support);
    }
  }
  const records = [...selected.values()].slice(0, 10);
  return { context: records.map(summarize).join("\n"), ids: records.map((entry) => entry.id) };
}

export function corpusSourceLinks(ids: string[]) {
  const links = new Map<string, { title: string; url: string }>();
  for (const id of ids) {
    const entry = byId.get(id);
    if (!entry) continue;
    const urls = [entry.source_url, ...(entry.supporting_source_urls || [])].filter((url): url is string => Boolean(url));
    for (const url of urls) {
      if (!/^https:\/\//.test(url)) continue;
      const host = new URL(url).hostname.replace(/^www\./, "");
      links.set(url, { title: knownTitles.get(url) || `${host} / source ${id}`, url });
      if (links.size >= 4) return [...links.values()];
    }
  }
  return [...links.values()];
}
