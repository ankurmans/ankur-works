import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '../../..');
const font = readFileSync(join(root, 'public/fonts/space-grotesk-latin.woff2')).toString('base64');
const bodyFont = readFileSync(join(root, 'public/fonts/dm-sans-latin.woff2')).toString('base64');
const fontStyle = `<style><![CDATA[
@font-face{font-family:'Space Grotesk Light';src:url(data:font/woff2;base64,${font});font-weight:100 900}
@font-face{font-family:'DM Sans';src:url(data:font/woff2;base64,${bodyFont});font-weight:100 900}
]]></style>`;
const svg = (body) => `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">${fontStyle}${body}</svg>`;
const logo = (x, y, light = false) => `<g transform="translate(${x} ${y})"><rect width="64" height="64" rx="15" fill="${light ? '#171715' : '#ffbd46'}"/><text x="31" y="46" text-anchor="middle" fill="${light ? '#fffaf2' : '#171715'}" font-family="Arial,sans-serif" font-size="42" font-weight="700" letter-spacing="-4">An</text></g>`;
const text = (x, y, value, size, color, weight = 700, extra = '') => `<text x="${x}" y="${y}" fill="${color}" font-family="Space Grotesk Light,Arial,sans-serif" font-size="${size}" font-weight="${weight}" ${extra}>${value}</text>`;

const designs = {
  '01-ink-evidence': svg(`
    <rect width="1200" height="630" fill="#171715"/>
    ${logo(62, 51)}
    ${text(144, 96, 'ankur.works', 31, '#fffaf2')}
    ${text(1000, 91, 'THE BUILD LOG', 15, '#ffc451', 700, 'letter-spacing="3"')}
    <line x1="63" y1="145" x2="1137" y2="145" stroke="#5b5851"/>
    ${text(65, 202, 'SEARCH / CASE FILE', 17, '#ffc451', 700, 'letter-spacing="3"')}
    ${text(62, 278, 'QuoteSweep went', 64, '#fffaf2')}
    ${text(62, 353, 'from 96 to 988', 64, '#fffaf2')}
    ${text(62, 428, 'Google clicks', 64, '#fffaf2')}
    ${text(62, 503, 'a month', 64, '#fffaf2')}
    <g opacity=".33" stroke="#938e84" stroke-width="1"><line x1="838" y1="252" x2="1138" y2="252"/><line x1="838" y1="340" x2="1138" y2="340"/><line x1="838" y1="428" x2="1138" y2="428"/><line x1="838" y1="516" x2="1138" y2="516"/></g>
    <path d="M850 476 L915 467 L974 407 L1034 319 L1127 250" fill="none" stroke="#ffc451" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="850" cy="476" r="11" fill="#f07552"/><circle cx="1127" cy="250" r="13" fill="#ffc451"/>
    ${text(835, 553, 'APR  96', 18, '#bfbab0')}${text(1030, 553, 'AUG  988', 18, '#ffc451')}
    <line x1="63" y1="576" x2="1137" y2="576" stroke="#5b5851"/>
    ${text(65, 607, 'BUILT, MEASURED, WRITTEN DOWN', 13, '#c4bfb6', 700, 'letter-spacing="2"')}
  `),
  '02-marigold-poster': svg(`
    <rect width="1200" height="630" fill="#ffc451"/>
    ${logo(62, 53, true)}
    ${text(144, 98, 'ankur.works', 31, '#171715')}
    ${text(987, 92, 'THE BUILD LOG', 15, '#171715', 700, 'letter-spacing="3"')}
    <line x1="62" y1="146" x2="1137" y2="146" stroke="#171715" stroke-opacity=".5"/>
    ${text(62, 199, 'QUOTESWEEP  /  SEARCH', 17, '#674019', 700, 'letter-spacing="2.5"')}
    ${text(58, 286, 'QuoteSweep went', 61, '#171715')}
    ${text(58, 362, 'from 96 to 988', 61, '#171715')}
    ${text(58, 438, 'Google clicks', 61, '#171715')}
    ${text(58, 514, 'a month', 61, '#171715')}
    <g transform="rotate(6 990 364)">
      <rect x="779" y="214" width="360" height="314" rx="25" fill="#171715"/>
      <rect x="795" y="229" width="328" height="282" rx="13" fill="#fffaf2"/>
      ${text(822, 298, '96 → 988', 55, '#171715')}
      ${text(823, 334, 'GOOGLE CLICKS / APR–AUG 2026', 11, '#726b5f', 700, 'letter-spacing="1.3"')}
      <g fill="#302b68"><rect x="824" y="473" width="38" height="14" rx="5"/><rect x="875" y="469" width="38" height="18" rx="5"/><rect x="926" y="435" width="38" height="52" rx="5"/><rect x="977" y="386" width="38" height="101" rx="5"/></g>
      <rect x="1028" y="348" width="58" height="139" rx="5" fill="#ef6a45"/>
    </g>
    <line x1="62" y1="575" x2="1137" y2="575" stroke="#171715" stroke-opacity=".5"/>
    ${text(62, 607, 'NOTES FROM THE PRODUCTS I BUILD', 13, '#171715', 700, 'letter-spacing="2"')}
  `),
  '03-editorial-paper': svg(`
    <rect width="1200" height="630" fill="#f3efe6"/>
    <rect x="0" y="0" width="1200" height="14" fill="#ef6a45"/>
    ${logo(62, 55, true)}
    ${text(145, 99, 'ankur.works', 31, '#171715')}
    ${text(821, 91, 'THE BUILD LOG / FIELD NOTES', 14, '#665e55', 700, 'letter-spacing="2"')}
    <line x1="62" y1="148" x2="1138" y2="148" stroke="#171715" stroke-width="2"/>
    ${text(63, 206, 'SEARCH  /  QUOTESWEEP', 15, '#a5472d', 700, 'letter-spacing="2.5"')}
    ${text(57, 291, 'QuoteSweep went from', 68, '#171715')}
    <rect x="56" y="314" width="737" height="91" rx="10" fill="#ffc451"/>
    ${text(66, 383, '96 to 988 Google clicks', 64, '#171715')}
    ${text(57, 474, 'a month', 68, '#171715')}
    <line x1="62" y1="521" x2="1138" y2="521" stroke="#171715" stroke-width="2"/>
    ${text(62, 568, 'A closed-beta product. A 10.3× change in Google clicks.', 24, '#49443e', 500)}
    ${text(62, 605, 'SEARCH CONSOLE  ·  COMPLETE MONTHS  ·  2026', 13, '#736c62', 700, 'letter-spacing="2"')}
  `),
};

for (const [name, source] of Object.entries(designs)) {
  const sourcePath = join(here, `${name}.svg`);
  const imagePath = join(here, `${name}.png`);
  writeFileSync(sourcePath, source);
  execFileSync('rsvg-convert', ['-o', imagePath, sourcePath], {
    env: { ...process.env, FONTCONFIG_FILE: '/tmp/ankur-og-fonts/fonts.conf' },
  });
  console.log(imagePath);
}
