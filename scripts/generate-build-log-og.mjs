import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = join(root, 'public/og/build-log');
const fontDir = join(root, 'scripts/og-fonts');
const font = readFileSync(join(root, 'public/fonts/space-grotesk-latin.woff2')).toString('base64');
const fontStyle = `<style><![CDATA[@font-face{font-family:'Space Grotesk Light';src:url(data:font/woff2;base64,${font});font-weight:100 900}]]></style>`;
const wrap = (body) => `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">${fontStyle}${body}</svg>`;
const text = (x, y, value, size, color, weight = 700, extra = '') => `<text x="${x}" y="${y}" fill="${color}" font-family="Space Grotesk Light,Arial,sans-serif" font-size="${size}" font-weight="${weight}" ${extra}>${value.replaceAll('&', '&amp;').replaceAll('<', '&lt;')}</text>`;
const logo = (ink = false) => `<g transform="translate(62 52)"><rect width="64" height="64" rx="15" fill="${ink ? '#171715' : '#ffbd46'}"/><text x="31" y="46" text-anchor="middle" fill="${ink ? '#fffaf2' : '#171715'}" font-family="Arial,sans-serif" font-size="42" font-weight="700" letter-spacing="-4">An</text></g>`;

const posts = [
  {
    slug: 'quotesweep-seo-case-study', mode: 'ink',
    lines: ['QuoteSweep’s', 'Google clicks grew', '929% from April', 'to August'],
    kicker: 'SEARCH / CASE FILE', footer: 'BUILT, MEASURED, WRITTEN DOWN',
    chart: { values: [96, 130, 368, 716, 988], labels: ['APR  96', 'AUG  988'] },
  },
  {
    slug: 'how-to-measure-ai-search', mode: 'paper',
    lines: ['How I measured', 'Pepys’s 8.6×', 'ChatGPT referral', 'growth'], highlight: 1,
    kicker: 'SEARCH / MEASUREMENT', footer: 'IMPRESSIONS  ·  REFERRALS  ·  PRODUCT ACTIONS',
  },
  {
    slug: 'mvp-development-cost', mode: 'paper',
    lines: ['What does an', 'MVP cost?', 'First decide what', 'it will not do.'], highlight: 1,
    kicker: 'BUILD / SCOPE', footer: 'PROTOTYPE  ·  WORKING MVP  ·  PRODUCTION RELEASE',
  },
];

function sharedHead(dark) {
  const foreground = dark ? '#fffaf2' : '#171715';
  const rule = dark ? '#5b5851' : '#171715';
  return `${logo(!dark)}${text(144, 98, 'ankur.works', 31, foreground)}${text(982, 91, 'THE BUILD LOG', 15, dark ? '#ffc451' : '#665e55', 700, 'letter-spacing="2.5"')}<line x1="62" y1="146" x2="1138" y2="146" stroke="${rule}"/>`;
}

function ink({ lines, kicker, footer, chart }) {
  const points = chart.values.map((value, index) => [850 + index * 69, Math.round(500 - 250 * value / Math.max(...chart.values))]);
  const path = points.map(([x, y], index) => `${index ? 'L' : 'M'}${x} ${y}`).join(' ');
  return wrap(`
    <rect width="1200" height="630" fill="#171715"/>
    ${sharedHead(true)}
    ${text(64, 201, kicker, 16, '#ffc451', 700, 'letter-spacing="2.5"')}
    ${lines.map((line, index) => text(62, 278 + index * 74, line, 62, index === 2 ? '#ffc451' : '#fffaf2')).join('')}
    <g opacity=".28" stroke="#938e84"><line x1="838" y1="250" x2="1138" y2="250"/><line x1="838" y1="338" x2="1138" y2="338"/><line x1="838" y1="426" x2="1138" y2="426"/><line x1="838" y1="514" x2="1138" y2="514"/></g>
    <path d="${path}" fill="none" stroke="#ffc451" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="${points[0][0]}" cy="${points[0][1]}" r="11" fill="#ef6a45"/><circle cx="${points.at(-1)[0]}" cy="${points.at(-1)[1]}" r="13" fill="#ffc451"/>
    ${text(834, 554, chart.labels[0], 18, '#bfbab0')}${text(1029, 554, chart.labels[1], 18, '#ffc451')}
    <line x1="62" y1="577" x2="1138" y2="577" stroke="#5b5851"/>
    ${text(63, 608, footer, 13, '#c4bfb6', 700, 'letter-spacing="2"')}
  `);
}

function paper({ lines, highlight, kicker, footer }) {
  const lineHeight = lines.length <= 2 ? 108 : 76;
  const fontSize = lines.length <= 2 ? 91 : 67;
  const start = lines.length <= 2 ? 316 : 272;
  const title = lines.map((line, index) => {
    const y = start + index * lineHeight;
    const bar = index === highlight ? `<rect x="56" y="${y - fontSize * .91}" width="${Math.min(1080, Math.round(line.length * fontSize * .57 + 34))}" height="${Math.round(fontSize * 1.17)}" rx="9" fill="#ffc451"/>` : '';
    return `${bar}${text(60, y, line, fontSize, '#171715')}`;
  }).join('');
  return wrap(`
    <rect width="1200" height="630" fill="#f3efe6"/>
    <rect width="1200" height="14" fill="#ef6a45"/>
    ${sharedHead(false)}
    ${text(62, 202, kicker, 16, '#a5472d', 700, 'letter-spacing="2.5"')}
    ${title}
    <line x1="62" y1="530" x2="1138" y2="530" stroke="#171715" stroke-width="2"/>
    ${text(62, 584, footer, 15, '#665e55', 700, 'letter-spacing="2"')}
  `);
}

mkdirSync(output, { recursive: true });
const temp = mkdtempSync(join(tmpdir(), 'ankur-blog-og-'));
const config = join(temp, 'fonts.conf');
writeFileSync(config, `<?xml version="1.0"?><!DOCTYPE fontconfig SYSTEM "fonts.dtd"><fontconfig><include ignore_missing="yes">/opt/homebrew/etc/fonts/fonts.conf</include><dir>${fontDir}</dir></fontconfig>`);
try {
  for (const post of posts) {
    const mdx = readFileSync(join(root, 'content/build-log', `${post.slug}.mdx`), 'utf8');
    const title = mdx.match(/^  title: '([^']+)',?$/m)?.[1];
    if (!title || post.lines.join(' ') !== title) throw new Error(`OG title is out of sync with ${post.slug}.mdx`);
    const source = join(temp, `${post.slug}.svg`);
    const destination = join(output, `${post.slug}.png`);
    writeFileSync(source, post.mode === 'ink' ? ink(post) : paper(post));
    execFileSync('rsvg-convert', ['-o', destination, source], { env: { ...process.env, FONTCONFIG_FILE: config } });
    console.log(destination);
  }
} finally {
  rmSync(temp, { recursive: true, force: true });
}
