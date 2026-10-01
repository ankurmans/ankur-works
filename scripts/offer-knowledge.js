import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export const offerPages = [
  { path: '/product-development/', file: 'product-development/index.html', id: 'offer-product' },
  { path: '/seo-ai-search/', file: 'seo-ai-search/index.html', id: 'offer-search' },
];

function plain(value) {
  return value.replace(/<(?:script|style|svg)\b[\s\S]*?<\/(?:script|style|svg)>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&(?:nbsp|amp|quot|apos|#39|rsquo|ldquo|rdquo);/gi, (entity) => ({
      '&nbsp;': ' ', '&amp;': '&', '&quot;': '"', '&apos;': "'", '&#39;': "'",
      '&rsquo;': '’', '&ldquo;': '“', '&rdquo;': '”',
    })[entity.toLowerCase()] || ' ')
    .replace(/\s+/g, ' ').trim();
}

export function offerRecords(html, page) {
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1];
  if (!main) throw new Error(`Offer page ${page.file} has no main content`);
  const sections = [...main.matchAll(/<section\b([^>]*)>([\s\S]*?)<\/section>/gi)];
  if (sections.length < 3) throw new Error(`Offer page ${page.file} has too few sections`);
  return sections.map((match, index) => {
    const id = match[1].match(/\bid="([a-z][a-z0-9-]*)"/i)?.[1];
    const headings = [...match[2].matchAll(/<h[1-4]\b[^>]*>([\s\S]*?)<\/h[1-4]>/gi)].map((item) => plain(item[1]));
    const paragraphs = [...match[2].matchAll(/<(?:p|li)\b[^>]*>([\s\S]*?)<\/(?:p|li)>/gi)]
      .map((item) => plain(item[1]))
      .filter((text) => text && !/\b(?:price|pricing|rates?|budget)\b/i.test(text));
    const text = [...new Set([...headings, ...paragraphs])].join(' ').slice(0, 3400);
    if (!text) throw new Error(`Offer page ${page.file} has an empty section ${index + 1}`);
    return {
      id: `${page.id}-${id || index + 1}`,
      title: headings[0] || `${page.id} section ${index + 1}`,
      url: `${page.path}${id ? `#${id}` : ''}`,
      page: page.path,
      text,
      provenance: `Published copy from ${page.file}; verify live publication separately`,
    };
  });
}

export function loadOfferRecords(root) {
  return offerPages.flatMap((page) => {
    const path = resolve(root, page.file);
    return existsSync(path) ? offerRecords(readFileSync(path, 'utf8'), page) : [];
  });
}
