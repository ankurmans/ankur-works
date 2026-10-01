import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { loadOfferRecords } from './offer-knowledge.js';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const output = new URL('../api/assistant-knowledge.json', import.meta.url);
const approvedClaims = JSON.parse(readFileSync(new URL('../knowledge/approved-claims.json', import.meta.url), 'utf8'));
const personalStories = JSON.parse(readFileSync(new URL('../knowledge/personal-stories.json', import.meta.url), 'utf8'));

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
records.push({ id: 'about', title: 'About Ankur', url: '/#top', text: [first(hero, 'h1'), first(hero, 'p', 'lede')].filter(Boolean).join('. ') });

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
