import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const dist = join(process.cwd(), 'dist');
const htmlPath = join(dist, 'index.html');
const html = readFileSync(htmlPath, 'utf8');
const stylesheet = /<link rel="stylesheet" crossorigin href="(\/assets\/[^\"]+\.css)">/g;
const matches = [...html.matchAll(stylesheet)];

if (matches.length !== 1) throw new Error(`Expected one bundled stylesheet, found ${matches.length}`);

const css = readFileSync(join(dist, matches[0][1].slice(1)), 'utf8');
if (css.includes('</style')) throw new Error('Cannot safely inline a stylesheet containing a closing style tag');

writeFileSync(htmlPath, html.replace(matches[0][0], `<style>${css}</style>`));
