# Make ankur.works worth passing on

**Working plan · 4 October 2026 · local draft**

## The bet

Build one repeatable loop around **visible receipts from products Ankur actually ships**:

`real product decision or result → useful visual artifact → founder-led post → conversation/share → Build Log case file → relevant offer or reply → next question to investigate`

The audience is founders and small product teams who need to build something useful and get it found. Their reason to share is a practical lesson or a sharp artifact that makes them look informed. The reason to remember Ankur is that he built the product, measured the result, and can show the work. A viral post that sends no relevant people to the site is not the goal.

Use Ankur's personal LinkedIn account as the first distribution surface, with the company Page amplifying selected posts. LinkedIn's current guidance encourages leaders to publish original insights through personal accounts while Pages boost that work; its own guidance also recommends concise, captioned native video for professional audiences. [LinkedIn on articles and expert voices](https://www.linkedin.com/business/marketing/blog/content-marketing/linkedin-articles) · [LinkedIn on B2B video](https://www.linkedin.com/business/marketing/blog/content-marketing/13-top-tips-for-compelling-b2b-video-content-on-linkedin)

## What exists now

- The homepage and offer pages already have distinctive product visuals and measured proof: Pepys signups, QuoteSweep Google clicks, and Pepys ChatGPT referrals.
- Three Build Log posts have article pages, branded OG covers, source notes, screenshots, and Whooshly Share Kit. They are live URLs but remain `noindex,nofollow`, absent from the sitemap, and absent from homepage navigation while they are review drafts.
- The Build Log pages do not currently load the site's PostHog instrumentation. Share opens, share selections, article-to-offer clicks, and downstream inquiries therefore need a measurement pass before judging this loop.
- The mascots and product UI can make short videos visually distinct, but the content must still teach a product or growth lesson.

**Qualitative STEPPS score: 5/10.** Practical value, real stories, and memorable visuals are present. The missing pieces are a recurring trigger, visible reader-made outputs, and a reason to bring another founder into the experience. A 10/10 design would add all three without fabricating scarcity or metrics; it would not guarantee virality.

## The flagship format: The Receipt

Each edition contains four parts:

1. **Surprise:** one outcome, decision, or counterintuitive observation in a single line.
2. **Receipt:** a legible chart, product screen, or before/after artifact with dates and source.
3. **Lesson:** what changed, what the evidence does and does not prove, and the next decision.
4. **Takeaway:** a template, checklist, question, or example another builder can use today.

Keep the company visible but quiet: small ankur.works mark on the artifact, canonical case file on the site, and one relevant next action. Lead with a verified change and period when a comparable series exists. Keep starting and ending counts alongside it. Do not imply that traffic caused signups or that observed citations are a global citation rate.

### First three editions

| Edition | Native hook | Visual | Useful takeaway | Destination |
| --- | --- | --- | --- | --- |
| QuoteSweep | “Google clicks grew 929% while QuoteSweep was still in closed beta. Here is the chart, and what it cannot tell me.” | Ink chart, April–August complete months | Four checks for a search case file | `/build-log/quotesweep-seo-case-study/` |
| Pepys | “ChatGPT-referred sessions grew 8.6×. That is not the same as an AI citation.” | PostHog trend plus a simple signal map | AI search scorecard: appearance, referral, citation, product action | `/build-log/how-to-measure-ai-search/` |
| MVP scope | “The expensive MVP question is usually the one nobody cut.” | A real, annotated Pepys or Whooshly first-job scope | One-sentence first-release worksheet | `/build-log/mvp-development-cost/` |

The numbers above are from the existing case files and must be refreshed against the source exports before external promotion. The MVP example needs Ankur's actual first-release decisions, not a reconstructed origin story.

## SEO/AEO foundation before promotion

This is a short launch lane, not a separate content factory. The four currently indexable pages already have unique titles, descriptions, canonicals, OG images and a sitemap; the homepage and offer pages also have visible-copy-aligned structured data. The live homepage, robots file, sitemap and one Build Log article returned HTTP 200 on October 4. The live `robots.txt` allows crawling and points to the sitemap. That confirms access from this client, not actual indexation or access from every search/AI crawler.

| Priority | Work | Done when |
| --- | --- | --- |
| 1. Crawl and index baseline | Verify `www`/non-`www`, HTTP/HTTPS and slash redirects; inspect each canonical URL in Google Search Console and Bing Webmaster Tools; check sitemap processing, page indexing, snippet eligibility, and any host/WAF blocks. Fetch raw HTML with relevant crawler user agents and confirm the actual offer copy, article body, links and JSON-LD are present. | A saved URL-by-URL table separates reachable, discovered, indexed and eligible; any block has an owner and fix. |
| 2. Publish approved Build Log posts | After Ankur's source/copy review, remove `noindex,nofollow` and draft labels for each approved article; link it from the homepage, related offer, Build Log index and relevant sibling post; add the canonical URL to the sitemap; verify live HTML and request indexing through the appropriate webmaster tools. Leave unapproved posts excluded. | Approved articles are crawlable, internally linked, submitted and checked live. Submission is not proof of indexing. |
| 3. Make case files answerable | Give each article a direct answer near the top, descriptive H2s, dated chart captions, methodology, limits, source links and the relevant offer CTA. Add accurate `Article`/`BlogPosting` JSON-LD with author, date and image only when the article is published; keep the homepage's Ankur identity and same-as links consistent. | A human can find the answer and audit the claim in the visible HTML; markup says only what the page shows. |
| 4. Map commercial intent | Keep distinct landing pages for product development, SEO/AI search and character-led marketing. Connect each case file to one offer and one useful comparison/decision query. Start with three small clusters: MVP scope and cost, measuring AI search, and mascot systems for product brands. Check real GSC/Bing queries before expanding. | No two pages compete for the same primary job; each approved article has a clear next step. |
| 5. Measure AI visibility honestly | Define a small, fixed set of buyer questions, record engine, prompt, date, answer and cited URL, then repeat captures before comparing. Separate Google AI-feature impressions, AI-referred sessions, observed mentions/citations, and completed leads. | A baseline exists with raw observations and caveats; no single “AI rank” or inferred citation count. |

Google says a page must be indexed and snippet-eligible to appear as a supporting link in its generative search features. It also says sitemap submission is a discovery hint, not an indexing guarantee. Structured data can help Google understand content and qualify for supported search features; do not claim that schema alone produces AI citations. [Google AI features](https://developers.google.com/search/docs/appearance/ai-features) · [Google sitemaps](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap) · [Google structured data](https://developers.google.com/search/docs/appearance)

Do not spend the first sprint on `llms.txt`, mass FAQ schema, or speculative crawler rules. Verify the access and index gates, publish the real case files, and measure actual referrals and citations first.

## Six-week test

| When | Ship | Distribution | Decision |
| --- | --- | --- | --- |
| Week 1 | Approve source exports and screenshots; instrument the Build Log; run the SEO/AEO crawl and index baseline; define the audience and baseline. | Publish one proof-led personal LinkedIn post as a native image. Keep draft case-file URLs out of public promotion until approved. | Can we attribute visits and actions to the post without counting CTA clicks as leads? |
| Week 2 | Finish QuoteSweep case file, then publish it only after editorial approval. Create one chart carousel and one 20–40 second narrated screen clip from the same evidence. | Personal LinkedIn first; company Page reshares the strongest version. Adapt, rather than paste, for X. | Which format brings qualified case-file readers and replies from founders or search buyers? |
| Week 3 | Publish the AI measurement case file after approval. Release a one-page, downloadable four-signal scorecard. | Ask 5 relevant operators to critique or use the scorecard; share their feedback with permission. Contribute useful answers in relevant communities without drive-by links. | Is the scorecard forwarded, saved, or requested independently of the post? |
| Week 4 | Publish the MVP scope piece after approval. Share an annotated first-job worksheet, not a generic feature list. | One founder-led text post, one visual walkthrough, one product clip. | Are product-build buyers arriving, or only other marketers? |
| Week 5 | Test the most requested artifact as a lightweight, on-site generator: a founder fills in the first user, core job, success signal, and what is deliberately out. Output a branded card that is useful to share with a cofounder or team. | Show two real examples with permission. No fake leaderboard or forced “share to unlock.” | Do people complete and voluntarily share cards? |
| Week 6 | Repeat the strongest format and cut the weakest. Decide whether a monthly Build Log email has enough demand to justify setup. | Continue one primary channel; use the Page, X, and partners as supporting distribution. | Keep the loop only if it produces useful shares, qualified visits, and conversations, not just impressions. |

**Cadence hypothesis:** three native posts a week from one strong case file, one short visual/video, and one direct conversation with a relevant creator/operator. Keep this manageable for six weeks; adjust to actual production capacity rather than posting filler.

## Measurement and guardrails

Use one UTM pattern per placement, for example `utm_source=linkedin&utm_medium=organic_social&utm_campaign=receipt_01&utm_content=chart`. PostHog documents UTM, referrer, entry path, and goal reporting for this job. [PostHog web analytics](https://posthog.com/docs/web-analytics/dashboard)

Track the path in separate steps: post reach and reshares on the native platform; UTM sessions and engaged readers on ankur.works; share/copy-link actions; article-to-offer navigation; completed inquiry or booking; and qualified conversations. Record the weekly source and denominator. A share-button open is not a share, a CTA click is not a lead, and an inquiry is not revenue.

Weeks 1–2 establish the baseline. Thereafter, compare each format with the median of this account's own recent posts and with qualified site actions, not with a generic “viral engagement rate.” Keep or kill a format after at least three distinct posts, unless the audience feedback is clearly negative. If reach grows while qualified actions do not, sharpen audience and destination before posting more.

## What not to launch yet

- No Beehiiv archive or newsletter signup promise until at least four approved articles and a defined subscriber benefit. Keep the full article canonical on ankur.works.
- No automated SEO article factory. Google recommends original, first-hand, people-first material and warns against scaled content made chiefly to manipulate rankings. [Google Search Central](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)
- No blanket “Built by Ankur” badges injected into Pepys or Whooshly user flows. Put a subtle credit where it genuinely helps someone understand the product's maker.
- No product metric, customer testimonial, AI-citation rate, or causal growth story without a named source and measurement boundary.

## Immediate next decisions

1. Ankur reviews the three Build Log drafts and source screenshots for publication. This plan does not change their `noindex` status.
2. Select the first audience for the six-week pilot: founders building a first product is the recommended default; search buyers are the next segment to test.
3. Instrument the blog, run the crawl/index baseline, and prepare the first three native artifacts from the existing drafts. Publish articles only after the source and copy review.
