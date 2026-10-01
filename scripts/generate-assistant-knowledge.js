import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { loadOfferRecords } from './offer-knowledge.js';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const output = new URL('../api/assistant-knowledge.json', import.meta.url);
const approvedClaims = JSON.parse(readFileSync(new URL('../knowledge/approved-claims.json', import.meta.url), 'utf8'));
const personalStories = JSON.parse(readFileSync(new URL('../knowledge/personal-stories.json', import.meta.url), 'utf8'));
const searchObservations = JSON.parse(readFileSync(new URL('../knowledge/search-observations.json', import.meta.url), 'utf8'));

function plain(value = '') {
  return value
    .replace(/<svg\b[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

function first(block, tag, className) {
  const attrs = className ? `[^>]*class="[^"]*\\b${className}\\b[^"]*"[^>]*` : '[^>]*';
  return plain(block.match(new RegExp(`<${tag}${attrs}>([\\s\\S]*?)<\\/${tag}>`, 'i'))?.[1]);
}

function paragraphs(block) {
  return [...block.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)].map((match) => plain(match[1])).filter(Boolean);
}

const records = [];
const hero = html.match(/<section class="hero wrap">([\s\S]*?)<\/section>/)?.[1];
if (!hero) throw new Error('Portfolio hero not found');
const heroTitle = first(hero, 'h1');
const heroLede = first(hero, 'p', 'lede');
records.push({ id: 'about', title: 'About Ankur', url: '/#top', text: `${heroTitle}${/[.!?]$/.test(heroTitle) ? ' ' : '. '}${heroLede}` });

const projects = [...html.matchAll(/<article class="project [^"]+">([\s\S]*?)<\/article>/g)];
if (projects.length < 5) throw new Error('Expected the five featured software projects');
for (const [index, match] of projects.entries()) {
  const body = match[1];
  const title = first(body, 'h3');
  const summary = paragraphs(body)[0];
  const status = plain(body.match(/<div class="project-bottom"><span>([\s\S]*?)<\/span>/)?.[1]);
  if (!title || !summary) throw new Error(`Incomplete project card ${index + 1}`);
  records.push({ id: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'), title, url: '/#work', text: `${title}. ${summary}${status ? ` Status: ${status}.` : ''}` });
}

const commerce = html.match(/<section class="commerce wrap">([\s\S]*?)<\/section>/)?.[1];
if (!commerce) throw new Error('Commerce section not found');
const commerceBrands = [...commerce.matchAll(/<span class="brand-name"><strong>([\s\S]*?)<\/strong>/g)].map((match) => plain(match[1]));
records.push({ id: 'commerce', title: 'Commerce brands', url: '/#work', text: [...paragraphs(commerce), `Brands shown: ${commerceBrands.join(', ')}.`].join(' ') });

const directory = html.match(/<section id="claude-listings"[\s\S]*?<\/section>/)?.[0];
if (!directory) throw new Error('Connector directory section not found');
records.push({ id: 'connectors', title: 'Claude connectors', url: '/#claude-listings', text: paragraphs(directory).join(' ') });

const shiplog = html.match(/<section class="shiplog wrap"[\s\S]*?<\/section>/)?.[0];
if (!shiplog) throw new Error('Ship log section not found');
const chapters = [...shiplog.matchAll(/<div class="log-row">([\s\S]*?)<\/div>/g)].map((match) => plain(match[1]));
const workshop = [...shiplog.matchAll(/<a class="log-row"[\s\S]*?<\/a>/g)].map((match) => {
  const name = first(match[0], 'strong');
  const description = first(match[0], 'small');
  return `${name}: ${description}`;
});
const publicRepos = [...html.matchAll(/<a href="https:\/\/github\.com\/ankurmans\/[^"]+"[^>]*><span><b>([\s\S]*?)<\/b><small>([\s\S]*?)<\/small>/g)]
  .map((match) => `${plain(match[1])}: ${plain(match[2])}`);
records.push({ id: 'previous-chapters', title: 'Previous chapters', url: '/#shiplog-title', text: chapters.join('. ') });
records.push({ id: 'public-code', title: 'Public code and workshop', url: '/#shiplog-title', text: [...workshop, ...publicRepos].join('. ') });

const story = html.match(/<section id="story"[\s\S]*?<\/section>/)?.[0];
if (!story) throw new Error('Story section not found');
records.push({ id: 'story', title: 'How Ankur works', url: '/#story', text: paragraphs(story).join(' ') });

const contact = html.match(/<section id="contact" class="contact wrap">([\s\S]*?)<\/section>/)?.[1];
const email = html.match(/href="mailto:([^"]+)"/)?.[1];
if (!contact || !email) throw new Error('Contact section or email not found');
records.push({ id: 'contact', title: 'Contact Ankur', url: '/#contact', text: `${paragraphs(contact).join(' ')} Contact Ankur at ${email}.` });

// Offer-page copy becomes available as soon as the separately built static
// pages are present in this checkout. The site page remains the citation.
records.push(...loadOfferRecords(resolve(dirname(fileURLToPath(import.meta.url)), '..')));

const searchLedGtm = readFileSync(new URL('../knowledge/SEARCH-LED-GTM-RAG.md', import.meta.url), 'utf8').trim();
if (!searchLedGtm.includes("Ankur Shrestha's commercial framing") || !searchLedGtm.includes('not a universally established industry category'))
  throw new Error('Search-Led GTM knowledge must identify the framework and its ownership');
const [, searchLedGtmPositioning, ...searchLedGtmLimits] = searchLedGtm.split('\n\n');
records.push({ id: 'search-led-gtm-framework', title: 'What Search-Led GTM means',
  url: '/seo-ai-search/', page: '/seo-ai-search/', text: searchLedGtmPositioning,
  topics: ['Search-Led GTM', 'search led GTM', 'SEO and AI search', 'go-to-market search'],
  evidence_type: 'FRAMEWORK', provenance: 'Ankur-approved offer framing, 2026-10-01' });
records.push({ id: 'search-led-gtm-boundaries', title: 'Search-Led GTM scope and evidence limits',
  url: '/seo-ai-search/', page: '/seo-ai-search/', text: searchLedGtmLimits.join(' '),
  topics: ['Search-Led GTM proof', 'Search-Led GTM results', 'Search-Led GTM vs product development'],
  evidence_type: 'FRAMEWORK', provenance: 'Ankur-approved offer framing, 2026-10-01' });

// These are Ankur-provided public frameworks, not measured outcomes. Behaviour
// and example files shape the prompts separately; the extraction spec is
// engineering guidance and must never be presented as a completed analysis.
const searchPack = [
  ['01-AI-SEARCH-OPERATING-MODEL.md', 'search-ai-operating-model', 'AI search operating model', ['AI search', 'GEO', 'AEO', 'ChatGPT ranking', 'retrieval', 'citations']],
  ['02-SERP-CONTENT-ENTITY-LINKS.md', 'search-seo-operating-knowledge', 'SEO, content, entities and links', ['SEO', 'SERP', 'content', 'entities', 'links', 'technical SEO']],
  ['03-AI-SOURCE-PASSAGE-STRATEGY.md', 'search-source-passage-strategy', 'AI search sources and passages', ['AI search', 'sources', 'passages', 'citations', 'corroboration']],
  ['04-GSC-ANALYSIS-KNOWLEDGE.md', 'search-gsc-analysis', 'Search Console measurement', ['GSC', 'Search Console', 'clicks', 'impressions', 'measurement']],
];
for (const [filename, id, title, topics] of searchPack) {
  const text = readFileSync(new URL(`../knowledge/seo-ai-search-pack/${filename}`, import.meta.url), 'utf8').trim();
  if (!text.startsWith('# ') || text.length < 100) throw new Error(`Search knowledge ${filename} is incomplete`);
  records.push({ id, title, url: null, page: '/seo-ai-search/', text, topics,
    evidence_type: 'FRAMEWORK', provenance: 'Ankur-provided SEO and AI Search RAG pack' });
}

if (!Array.isArray(searchObservations.observations)) throw new Error('Search observations must be an array');
for (const item of searchObservations.observations) {
  if (!/^[-a-z0-9]+$/.test(item.id || '') || records.some((record) => record.id === item.id)
    || item.approved_for_chatbot !== true || item.public_safe !== true || item.evidence_type !== 'OBSERVED'
    || !item.title || !item.text || !item.source_url?.startsWith('https://us.posthog.com/project/')
    || !/^\d{4}-\d{2}-\d{2}$/.test(item.last_verified || '') || !Array.isArray(item.topics) || !item.topics.length)
    throw new Error(`Invalid search observation ${item?.id || '(missing id)'}`);
  records.push({ ...item, url: null, page: '/seo-ai-search/', provenance: 'Pepys PostHog; inspected 2026-10-01' });
}

if (!Array.isArray(personalStories.stories)) throw new Error('Personal stories must be an array');
const storyIds = new Set();
for (const story of personalStories.stories) {
  if (!story || story.approved !== true || story.visibility !== 'chatbot' || typeof story.id !== 'string' || !/^personal-[a-z0-9-]+$/.test(story.id)
    || storyIds.has(story.id) || typeof story.title !== 'string' || !story.title.trim()
    || typeof story.text !== 'string' || !story.text.trim() || typeof story.provenance !== 'string' || !story.provenance.trim()
    || !Array.isArray(story.topics) || !story.topics.length || !story.topics.every((topic) => typeof topic === 'string' && topic.trim()))
    throw new Error(`Invalid or unapproved personal story ${story?.id || '(missing id)'}`);
  storyIds.add(story.id);
  records.push({ id: story.id, title: story.title, url: null, text: story.text, topics: story.topics, provenance: story.provenance });
}

if (!Array.isArray(approvedClaims.claims)) throw new Error('Approved claims must be an array');
const claimIds = new Set();
for (const claim of approvedClaims.claims) {
  const record = records.find((item) => item.id === claim.source_id);
  if (!claim.id || claimIds.has(claim.id) || !record || typeof claim.excerpt !== 'string' || !record.text.includes(claim.excerpt)
    || typeof claim.value !== 'string' || !/\d/.test(claim.value) || !claim.excerpt.includes(claim.value)
    || !Array.isArray(claim.aliases) || !claim.aliases.length || !claim.aliases.every((value) => typeof value === 'string' && value.trim())
    || !Array.isArray(claim.intents) || !claim.intents.length || !claim.intents.every((value) => typeof value === 'string' && value.trim())
    || typeof claim.scope !== 'string' || !claim.scope.trim() || typeof claim.provenance !== 'string' || !claim.provenance.trim()
    || !Array.isArray(claim.do_not_infer) || !claim.do_not_infer.every((value) => typeof value === 'string' && value.trim())
    || !Array.isArray(claim.required_answer_terms) || !claim.required_answer_terms.length
    || !claim.required_answer_terms.every((value) => typeof value === 'string' && value.trim() && claim.excerpt.toLowerCase().includes(value.toLowerCase()))
    || !Array.isArray(claim.excluded_query_terms) || !claim.excluded_query_terms.every((value) => typeof value === 'string' && value.trim())) {
    throw new Error(`Approved claim ${claim.id || '(missing id)'} is invalid or its excerpt is missing from the cited page section`);
  }
  claimIds.add(claim.id);
  record.claims ||= [];
  record.claims.push(claim);
}

writeFileSync(output, `${JSON.stringify(records, null, 2)}\n`);
console.log(`Generated ${records.length} assistant knowledge records from the portfolio and available offer pages`);
