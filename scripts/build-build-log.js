import { evaluate } from '@mdx-js/mdx';
import remarkGfm from 'remark-gfm';
import * as runtime from 'react/jsx-runtime';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const sourceDir = join(root, 'content', 'build-log');
const outputDir = join(root, 'build-log');
const site = 'https://www.ankur.works';

const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[character]));

function SignalMap() {
  const signals = [
    ['Google AI', 'Appearances', '#ffc451'],
    ['ChatGPT', 'Referred visits', '#d7c5f0'],
    ['Your product', 'Useful actions', '#cce4dc'],
  ];
  return React.createElement('figure', { className: 'log-visual log-signal-map' },
    React.createElement('div', { className: 'signal-grid' }, signals.map(([name, label, color]) =>
      React.createElement('div', { key: name, style: { '--signal': color } },
        React.createElement('span', null, name),
        React.createElement('strong', null, label)
      )
    )),
    React.createElement('figcaption', null, 'Three signals. Three instruments. Each answers a different question.')
  );
}

function ScopeMap() {
  const rows = [
    ['Clickable prototype', 'Can someone understand and react to the idea?', 1],
    ['Narrow working MVP', 'Can a user finish the core job?', 2],
    ['Production release', 'Can the product be supported and improved?', 3],
  ];
  return React.createElement('figure', { className: 'log-visual log-scope-map' },
    React.createElement('div', { className: 'scope-rows' }, rows.map(([name, question, width]) =>
      React.createElement('div', { key: name, className: 'scope-row' },
        React.createElement('div', null, React.createElement('strong', null, name), React.createElement('span', null, question)),
        React.createElement('i', { style: { '--steps': width }, 'aria-hidden': 'true' })
      )
    )),
    React.createElement('figcaption', null, 'Illustrative scope ladder, not a price chart or an estimate for a specific project.')
  );
}

function EvidenceBars({ values, labels, title, source }) {
  if (!Array.isArray(values) || !Array.isArray(labels) || values.length !== labels.length || values.length < 2) {
    throw new Error('EvidenceBars requires matching values and labels');
  }
  const max = Math.max(...values);
  const summary = labels.map((label, index) => `${label}: ${values[index].toLocaleString()}`).join(', ');
  return React.createElement('figure', { className: 'log-visual log-evidence-bars', role: 'img', 'aria-label': `${title}. ${summary}. ${source}` },
    React.createElement('div', { className: 'bars-heading' }, React.createElement('strong', null, title), React.createElement('span', null, source)),
    React.createElement('div', { className: 'bars-plot', 'aria-hidden': 'true' }, values.map((value, index) =>
      React.createElement('div', { key: labels[index], className: 'bar-column' },
        React.createElement('strong', null, value.toLocaleString()),
        React.createElement('i', { style: { height: `${Math.max(8, 100 * value / max)}%` } }),
        React.createElement('span', null, labels[index])
      )
    )),
    React.createElement('figcaption', null, 'Complete calendar months. Bar height is proportional to the reported click count.')
  );
}

function SourceNote({ children }) {
  return React.createElement('aside', { className: 'log-source-note' }, children);
}

function References({ entries, noteTitle, notes }) {
  if (!Array.isArray(entries) || !entries.length) throw new Error('References needs at least one source');
  return React.createElement('section', { className: 'log-references', 'aria-label': 'Sources and checks' },
    React.createElement('div', { className: 'log-references-head' },
      React.createElement('span', null, 'SOURCE RECORD')
    ),
    React.createElement('ol', null, entries.map(({ author, title, url, type, use }, index) =>
      React.createElement('li', { key: `${author}-${title}` },
        React.createElement('span', { className: 'log-reference-number', 'aria-hidden': 'true' }, String(index + 1).padStart(2, '0')),
        React.createElement('div', null,
          React.createElement('p', { className: 'log-reference-citation' },
            React.createElement('strong', null, author), '. ',
            url ? React.createElement('a', { href: url }, title) : title, '.'
          ),
          React.createElement('p', { className: 'log-reference-meta' },
            React.createElement('span', null, type), ' · ', use
          )
        )
      )
    )),
    Array.isArray(notes) && notes.length ? React.createElement('aside', { className: 'log-reference-checks' },
      React.createElement('h3', null, noteTitle || 'Editorial checks'),
      React.createElement('ul', null, notes.map((note) => React.createElement('li', { key: note }, note)))
    ) : null
  );
}

const components = { SignalMap, ScopeMap, EvidenceBars, SourceNote, References };

function postActions(meta) {
  const bullets = meta.summaryBullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join('');
  return `<div class="log-post-actions">
    <details class="log-summary" open>
      <summary><span class="log-summary-spark" aria-hidden="true">✳</span><span>Quick take</span><span class="log-chevron" aria-hidden="true"></span></summary>
      <div class="log-summary-card">
        <div class="log-summary-tabs" role="tablist" aria-label="Summary format">
          <button type="button" role="tab" id="summary-general-tab" aria-controls="summary-general" aria-selected="true" tabindex="0">General summary</button>
          <button type="button" role="tab" id="summary-bullets-tab" aria-controls="summary-bullets" aria-selected="false" tabindex="-1">Bullet points</button>
        </div>
        <div id="summary-general" role="tabpanel" aria-labelledby="summary-general-tab" class="log-summary-panel"><p>${escapeHtml(meta.summaryGeneral)}</p></div>
        <div id="summary-bullets" role="tabpanel" aria-labelledby="summary-bullets-tab" class="log-summary-panel" hidden><ul>${bullets}</ul></div>
      </div>
    </details>
    <details class="log-share">
      <summary><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/></svg><span>Share</span></summary>
      <div class="log-share-menu"><whooshly-share networks="x,facebook,linkedin,email,copy" badge="on" badge-color="brand"></whooshly-share><a href="https://whooshly.co/share-kit/" target="_blank" rel="noopener noreferrer">Share links by Whooshly</a></div>
    </details>
  </div>`;
}

function pageShell(meta, content, { index = false } = {}) {
  const title = index ? 'The Build Log | ankur.works' : `${meta.seoTitle || meta.title} | ankur.works`;
  const description = index
    ? 'Notes from the products I build and the work of getting them found.'
    : meta.description;
  const url = index ? `${site}/build-log/` : `${site}/build-log/${meta.slug}/`;
  const socialTitle = index ? 'The Build Log | ankur.works' : meta.title;
  const socialImage = index ? `${site}/og-builder-brain.png` : `${site}/og/build-log/${meta.slug}.png`;
  const socialImageAlt = index ? 'The Build Log by ankur.works' : `Cover art for ${meta.title} by ankur.works`;
  const badge = index ? 'THE BUILD LOG' : meta.category.toUpperCase();
  const body = index
    ? content
    : `<article class="log-article"><div class="log-article-head"><p class="eyebrow">${escapeHtml(badge)} · DRAFT FOR REVIEW</p><h1>${escapeHtml(meta.title)}</h1><p class="log-deck">${escapeHtml(meta.description)}</p><div class="log-byline"><img src="/ankur-headshot-grey.webp" width="42" height="42" alt=""><span>By Ankur Shrestha · Drafted ${escapeHtml(meta.date)}</span></div></div>${postActions(meta)}<div class="log-prose">${content}</div><div class="log-end"><p>What would this look like for your product?</p><a href="${escapeHtml(meta.offer)}">See how I can help</a></div></article>`;
  return `<!doctype html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#f3efe6">
<meta name="robots" content="noindex,nofollow"><title>${escapeHtml(title)}</title><meta name="description" content="${escapeHtml(description)}">
<meta property="og:type" content="${index ? 'website' : 'article'}"><meta property="og:site_name" content="ankur.works"><meta property="og:title" content="${escapeHtml(socialTitle)}"><meta property="og:description" content="${escapeHtml(description)}"><meta property="og:url" content="${escapeHtml(url)}"><meta property="og:image" content="${escapeHtml(socialImage)}"><meta property="og:image:type" content="image/png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="${escapeHtml(socialImageAlt)}">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${escapeHtml(socialTitle)}"><meta name="twitter:description" content="${escapeHtml(description)}"><meta name="twitter:image" content="${escapeHtml(socialImage)}">
<link rel="canonical" href="${escapeHtml(url)}"><link rel="icon" type="image/png" sizes="256x256" href="/favicon-headshot.png"><link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="preload" href="/fonts/space-grotesk-latin.woff2" as="font" type="font/woff2" crossorigin><link rel="preload" href="/fonts/dm-sans-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/styles/build-log.css"></head><body class="build-log-page">
<a class="skip" href="#main">Skip to content</a>
<header class="header wrap"><a class="logo" href="/"><span class="logo-mark" aria-hidden="true"></span>ankur<i>.</i>works</a><nav class="desktop-nav" aria-label="Main navigation"><a href="/#work">The work</a><a href="/product-development/">Build</a><a href="/seo-ai-search/">Search</a><a href="/mascot-branding/">Mascot</a><a href="/build-log/" aria-current="page">Build Log</a></nav><details class="site-menu"><summary><span class="site-menu-icon" aria-hidden="true"></span><span class="site-menu-label">Navigation</span></summary><div class="site-menu-links" role="navigation" aria-label="Mobile navigation"><a href="/#work">The work</a><a href="/product-development/">Build</a><a href="/seo-ai-search/">Search</a><a href="/mascot-branding/">Mascot</a><a href="/build-log/" aria-current="page">Build Log</a><a class="site-menu-cta" href="mailto:ankur@kmfv.cc">Let's talk</a></div></details><a class="nav-cta" href="mailto:ankur@kmfv.cc">Let's talk</a></header>
<main id="main" class="log-main wrap">${body}</main>
<footer class="footer wrap"><a class="logo" href="/">ankur<i>.</i>works</a><span>Made with curiosity. © 2026 Ankur Shrestha.</span><div><a href="/product-development/">Build</a><a href="/seo-ai-search/">Search</a><a href="/mascot-branding/">Mascot</a></div></footer>
<script type="module" src="/scripts/build-log-analytics.js"></script><script defer src="/site-nav.js"></script>
${index ? '' : '<script defer src="/scripts/build-log-actions.js"></script>'}
</body></html>`;
}

const files = (await readdir(sourceDir)).filter((name) => name.endsWith('.mdx')).sort();
const posts = [];
for (const file of files) {
  const source = await readFile(join(sourceDir, file), 'utf8');
  const module = await evaluate(source, { ...runtime, baseUrl: import.meta.url, remarkPlugins: [remarkGfm] });
  const { meta } = module;
  if (!meta || !/^[a-z0-9-]+$/.test(meta.slug) || !meta.title || !meta.description || !meta.date || !meta.category || !meta.offer || !meta.summaryGeneral || !Array.isArray(meta.summaryBullets) || !meta.summaryBullets.length) {
    throw new Error(`Invalid metadata in ${file}`);
  }
  if (file !== `${meta.slug}.mdx`) throw new Error(`Filename and slug disagree: ${file}`);
  const content = renderToStaticMarkup(React.createElement(module.default, { components }));
  const destination = join(outputDir, meta.slug);
  await mkdir(destination, { recursive: true });
  await writeFile(join(destination, 'index.html'), pageShell(meta, content));
  posts.push(meta);
}
posts.sort((a, b) => b.date.localeCompare(a.date));
const cards = posts.map((post, index) => `<a class="log-card log-card-${index + 1}" href="/build-log/${post.slug}/"><span>${escapeHtml(post.category.toUpperCase())} · DRAFT</span><h2>${escapeHtml(post.title)}</h2><p>${escapeHtml(post.description)}</p><b>Read the draft <span aria-hidden="true">↗</span></b></a>`).join('');
const index = `<section class="log-hero"><p class="eyebrow">BUILT, MEASURED, WRITTEN DOWN</p><h1>The Build Log</h1><p>What happens after the idea leaves the whiteboard. Notes on building products, getting them found and figuring out what the numbers actually say.</p><div class="log-hero-stamp">THREE DRAFTS · READY FOR YOUR RED PEN</div></section><section class="log-index-grid" aria-label="Draft articles">${cards}</section>`;
await mkdir(outputDir, { recursive: true });
await writeFile(join(outputDir, 'index.html'), pageShell(null, index, { index: true }));
console.log(`Built The Build Log preview: ${posts.length} MDX drafts`);
