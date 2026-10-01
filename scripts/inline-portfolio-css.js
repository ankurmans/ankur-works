import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const dist = join(process.cwd(), 'dist');
const stylesheet = /<link rel="stylesheet" crossorigin href="(\/assets\/[^\"]+\.css)">/g;
for (const path of ['index.html', 'product-development/index.html', 'seo-ai-search/index.html']) {
  const htmlPath = join(dist, path);
  let html = readFileSync(htmlPath, 'utf8');
  const matches = [...html.matchAll(stylesheet)];
  for (const match of matches) {
    const css = readFileSync(join(dist, match[1].slice(1)), 'utf8');
    if (css.includes('</style')) throw new Error('Cannot safely inline a stylesheet containing a closing style tag');
    html = html.replace(match[0], `<style>${css}</style>`);
  }
  writeFileSync(htmlPath, html);
}
