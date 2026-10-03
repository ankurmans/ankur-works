import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { offerRecords, offerPages } from '../scripts/offer-knowledge.js';
import { mountAssistantOnOfferPage } from '../scripts/assistant-mount-html.js';

const fixture = `<!doctype html><html><head></head><body class="offer-page"><main>
  <section><h1>Build the useful thing</h1><p>I design and ship software.</p></section>
  <section id="proof"><h2>The proof</h2><p>One shipped product is live.</p></section>
  <section><h2>Start here</h2><p>We agree on price after scoping.</p><p>We define the first version.</p></section>
</main></body></html>`;

test('offer copy becomes page-cited knowledge without pricing language', () => {
  const records = offerRecords(fixture, offerPages[0]);
  assert.equal(records.length, 3);
  assert.equal(records[1].url, '/product-development/#proof');
  assert.match(records[0].text, /design and ship software/);
  assert.doesNotMatch(records[2].text, /price/i);
});

test('only explicitly approved offer pricing enters the knowledge corpus', () => {
  const html = fixture.replace('<p>We agree on price after scoping.</p>', '<p data-approved-offer-price>Starts at $6,000/month. 90-day minimum.</p><p>We agree on price after scoping.</p>');
  const records = offerRecords(html, offerPages[0]);
  assert.match(records[2].text, /Starts at \$6,000\/month/);
  assert.doesNotMatch(records[2].text, /agree on price after scoping/);
});

test('the shared AI Twin mounts once on a static offer page', () => {
  const portfolio = '<div class="ask-ankur" id="ask-ankur"></div><dialog id="ask-ankur-dialog"></dialog>';
  const mounted = mountAssistantOnOfferPage(fixture, portfolio);
  assert.doesNotMatch(mounted, /href="\/styles\/assistant\.css"/);
  assert.match(mounted, /scripts\/assistant-widget\.js/);
  assert.match(mounted, /id="ask-ankur"/);
  assert.equal(mountAssistantOnOfferPage(mounted, portfolio), mounted);
  for (const path of ['product-development/index.html', 'seo-ai-search/index.html']) {
    const source = readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
    assert.match(source, /<script type="module" src="\/scripts\/assistant-widget\.js"><\/script>/);
    const withWidget = mountAssistantOnOfferPage(source, portfolio);
    assert.equal((withWidget.match(/src="\/scripts\/assistant-widget\.js"/g) || []).length, 1);
  }
});

test('character offer enters the approved page knowledge with its own route', () => {
  const page = offerPages.find((offer) => offer.path === '/mascot-branding/');
  assert.ok(page);
  const html = readFileSync(new URL('../mascot-branding/index.html', import.meta.url), 'utf8');
  const records = offerRecords(html, page);
  assert.ok(records.length >= 5);
  assert.equal(records[0].url, '/mascot-branding/');
  assert.match(records[0].text, /brand mascots/i);
  assert.doesNotMatch(records.map((record) => record.text).join(' '), /unapproved prospect/i);
});

test('portfolio and chat controls use stable icons instead of emoji-prone glyphs', () => {
  for (const path of ['index.html', 'product-development/index.html', 'mascot-branding/index.html', 'scripts/assistant-widget.js', 'styles/assistant.css']) {
    const source = readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
    assert.doesNotMatch(source, /[↘↗▶▸▾✳〰]/u, path);
  }
  const widget = readFileSync(new URL('../scripts/assistant-widget.js', import.meta.url), 'utf8');
  assert.match(widget, /Play voice reply/);
  assert.match(widget, /Play this answer aloud/);
});

test('voice call shows a booking link and tells the agent not to narrate its URL', () => {
  const page = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const prompt = readFileSync(new URL('../knowledge/realtime-agent-prompt.txt', import.meta.url), 'utf8');
  assert.match(page, /ask-ankur__call-after[^>]*><a href="https:\/\/cal\.com\/ankur-kmf\/30min"/);
  assert.match(prompt, /Never speak, spell, or dictate the booking URL/);
  assert.match(prompt, /Click the booking link below/);
});

test('end call stays on one line without a redundant icon', () => {
  const css = readFileSync(new URL('../styles/assistant.css', import.meta.url), 'utf8');
  const page = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  assert.match(css, /\.ask-ankur__end-call\{[^}]*display:inline-flex;align-items:center;[^}]*white-space:nowrap/);
  assert.match(page, /id="ask-ankur-end-call">End call<\/button>/);
});
