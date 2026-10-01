import test from 'node:test';
import assert from 'node:assert/strict';
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

test('the shared AI Twin mounts once on a static offer page', () => {
  const portfolio = '<div class="ask-ankur" id="ask-ankur"></div><dialog id="ask-ankur-dialog"></dialog>';
  const mounted = mountAssistantOnOfferPage(fixture, portfolio);
  assert.match(mounted, /styles\/assistant\.css/);
  assert.match(mounted, /scripts\/assistant-widget\.js/);
  assert.match(mounted, /id="ask-ankur"/);
  assert.equal(mountAssistantOnOfferPage(mounted, portfolio), mounted);
});
