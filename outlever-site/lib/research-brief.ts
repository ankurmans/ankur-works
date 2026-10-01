import { sourceMap } from "../app/data";

export const sources = {
  OUTLEVER: { title: sourceMap["01"].title, url: sourceMap["01"].url },
  STATE: { title: sourceMap["02"].title, url: sourceMap["02"].url },
  DEFINITION: { title: sourceMap["03"].title, url: sourceMap["03"].url },
  BUILD_GUIDE: { title: sourceMap["04"].title, url: sourceMap["04"].url },
  SUPERPATH: { title: sourceMap["05"].title, url: sourceMap["05"].url },
  MAY: { title: sourceMap["06"].title, url: sourceMap["06"].url },
  JULY: { title: sourceMap["07"].title, url: sourceMap["07"].url },
  SITEMAP: { title: sourceMap["08"].title, url: sourceMap["08"].url },
  OPERATION: { title: sourceMap["09"].title, url: sourceMap["09"].url },
  FIELD_NOTE: { title: "Ankur Research field note", url: "https://outlever.ankur.works/" },
} as const;

export type BriefSourceId = keyof typeof sources;

export function sourceLinks(ids: string[]) {
  const unique = new Map<string, { title: string; url: string }>();
  for (const id of ids) {
    const source = sources[id as BriefSourceId];
    if (source) unique.set(source.url, source);
  }
  return [...unique.values()].slice(0, 4);
}

export const RESEARCH_BRIEF = `Dated evidence brief, captured by Ankur Research on 2026-10-01. This is independent public-surface research, not a private audit or an Outlever statement.

OBSERVED:
- Ankur Research's sitemap/homepage union contained at least 236 live State of Brand news URLs: 216 in the XML sitemap plus 20 additional live homepage-linked news URLs. All 236 returned HTTP 200 at capture. This is publishing output, not readership, traffic, or indexation. [STATE, SITEMAP]
- The 20 live homepage-linked news URLs were absent from the captured State of Brand XML sitemap, including two September 25, 2026 owned-media guides. This does not prove non-indexing. [STATE, SITEMAP, DEFINITION, BUILD_GUIDE]
- State of Brand had May, July, and September owned-media definition articles and a separate September implementation guide. Titles and sections cover related ground; search competition was not measured. [MAY, JULY, DEFINITION, BUILD_GUIDE]
- The inspected Outlever commercial homepage presented its offer in one publicly linked page and did not visibly link to State of Brand or to internally linked service/case-study destinations. Unlinked pages or private sales routes may exist. Conversion behavior was not measured. [OUTLEVER, OPERATION]
- A State of Brand article explains that Outlever runs State of Brand as its own operating example. The page is live; claims about shared customer infrastructure are first-party statements. [OPERATION]

REPORTED, NOT INDEPENDENTLY VERIFIED:
- Outlever describes an ICP-focused editorial/newsroom engine, executive and SME perspectives, and human-first distribution. [OUTLEVER]
- Melissa Rosenthal described practitioner interviews and person-to-person distribution in a Superpath AMA. In that AMA she reported State of Brand reaching 1.5 million monthly unique visitors within three months; Ankur Research did not review analytics or a metric definition. [SUPERPATH]
- State of Brand says Outlever's system powers more than 50 customer brand newsrooms. Ankur Research did not inspect customer records or the underlying platform. [OPERATION]

INFERRED, NOT MEASURED:
- The related owned-media articles present an editorial-role question. This is not proven search cannibalisation. [MAY, JULY, DEFINITION, BUILD_GUIDE, FIELD_NOTE]
- A clearer visible route from Outlever's homepage to State of Brand could help a buyer understand the offer, but there is no evidence of conversion leakage. [OUTLEVER, OPERATION, FIELD_NOTE]

HYPOTHESIS / PROPOSAL BY ANKUR RESEARCH:
- A maintained evergreen definition hub, a distinct implementation-guide role, supporting editorial, and an Outlever buyer/proof destination could make the public system easier to navigate. No canonical survivor or redirect target has been chosen. [FIELD_NOTE]
- The Search + AI Capture Layer is a proposed system that maps durable buyer questions, assigns maintained answer pages, links timely reporting to them, connects State of Brand proof to a commercial destination, and measures search and direct AI answers. Outlever may already do parts of this internally. Value and repeatability have not been demonstrated. [FIELD_NOTE]
- The proposed four-week implementation pilot begins with GSC query/page and URL-level backlink baselines, then defines editorial roles, prototypes one approved proof route, and runs a fixed 15-prompt direct AI-answer panel. Measurement should continue beyond four weeks; no revenue outcome is guaranteed. [FIELD_NOTE]

UNKNOWN / MISSING IN PHASE 1:
- No Outlever or State of Brand GSC, GA4, CRM/conversion export, or URL-level backlink export was available. No direct ChatGPT Search, Google AI, or Perplexity visibility test was completed. [FIELD_NOTE]
- Organic traffic weakness, AI citation weakness, search cannibalisation, redirect targets, conversion leakage, URL-level backlink strength, and future revenue impact are unproven. To settle them, obtain the corresponding dated private data or run the fixed direct AI panel. [FIELD_NOTE]`;
