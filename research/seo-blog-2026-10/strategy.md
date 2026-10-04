# ankur.works search-first publishing plan

**Working date:** 3 October 2026
**Status:** Editorial plan and three MDX drafts in a noindex local preview. No newsletter or public release.
**Market measured:** United States, English. Adapt the plan if the first client market is elsewhere.

## What the research says

The [keyword universe](./keyword-universe.csv) contains **174 curated queries with measured search-volume estimates**: 87 product development, 59 SEO/AI Search, and 28 mascot/character marketing. The [editorial hypotheses](./editorial-hypotheses.csv) add **42 first-hand angles** whose demand has **not** been measured. These are topics and variants, not 216 articles. The measured queries are mapped to 19 candidate URLs, including the three existing offer pages.

The numbers in the CSV are DataForSEO's **estimated US monthly search volume and keyword difficulty**, checked 3 October 2026. Some difficulty cells are unavailable. A reported KD of 0 is not a guarantee that a query is easy to rank for, especially where data is sparse. These are directional estimates, not ankur.works traffic, rankings, leads, or forecast. Vendor intent classifications can be wrong. A live SERP check is required before assigning a page or final title. The source task ID is recorded for every measured row.

| Query | US monthly searches, estimated | KD, estimated | Owner |
| --- | ---: | ---: | --- |
| product development agency | 720 | 5 | Existing product development offer |
| mvp development | 880 | 21 | Existing offer, with supporting MVP article |
| saas development services | 480 | 18 | Existing offer |
| mvp development cost | 140 | 0 | Cost and scope article |
| saas seo | 590 | 12 | Existing SEO + AI Search offer |
| ai search optimization | 1,300 | 33 | Existing offer and measurement article |
| answer engine optimization | 2,400 | 43 | Explainer, linked to offer |
| generative engine optimization | 4,400 | 54 | Explainer and measurement article, not a volume-first priority |
| brand mascot | 1,600 | 0 | Mixed intent; verify SERP before targeting |
| brand character | 480 | 6 | Mascot strategy article |

**Interpretation:** The product and search lanes have commercial demand and strong owned-product evidence. Mascot work is visually distinctive, but its search volume is smaller or ambiguous. Keep mascot content selective and visual.

## Positioning and audience

Write for founders, product leads, and growth leads who need one of two things: a working product, or a search system that creates qualified demand. The distinctive evidence is not a generic agency process. It is Pepys, Whooshly, and QuoteSweep: products Ankur actually builds and measures.

Editorial promise: **What I learned building and growing real products, with the screens, decisions, and measurement to back it up.**

- **Product development:** scope, build, launch, activation, and product decisions.
- **SEO + AI Search:** discovery, citations/answer context, referrals, and conversion. Define each metric precisely.
- **Mascot and character marketing:** character systems and motion demonstrated with Pepys and Quincy.
- **Build notes:** occasional founder voice and experiments, but only when they serve one of the three lanes.

## Architecture: one intent, one primary page

The existing [product development](../../product-development/index.html), [SEO + AI Search](../../seo-ai-search/index.html), and [mascot branding](../../mascot-branding/index.html) pages own buyer-ready service terms. Articles should answer specific questions and link to the appropriate offer. Do not launch thin near-duplicates for every phrase in the CSV.

The chosen editorial name is **The Build Log**. The MDX preview now uses these routes:

- `/build-log/`: editorial index, bylined Ankur.
- `/build-log/how-to-measure-ai-search/`: a measurement system and original visual.
- `/build-log/mvp-development-cost/`: price/scope decision.
- `/build-log/quotesweep-seo-case-study/`: the measured click-growth chart.

The MDX sources are in [`content/build-log/`](../../content/build-log/). The preview remains `noindex` and is absent from the sitemap while Ankur reviews the drafts. Future topics should follow the same route family, including `/build-log/saas-seo-strategy/` and `/build-log/mascot-marketing-strategy/`.

Before launch, remove the preview's `noindex`, add approved pages to the sitemap and site navigation, replace draft labels with publication dates, confirm source exports, and add screenshots with permission and alt text. Keep full articles on ankur.works so search visitors land on the offer-bearing site. Avoid duplicate full-text archives on a newsletter domain.

## First 12 publishing slots

A realistic cadence is **one substantial article per week**. Each one needs a first-party artifact: an annotated screen, anonymized PostHog/GSC view, source export, product teardown, design sheet, or before/after decision. The title is provisional until the live SERP and evidence checks.

| Week | Working title and primary cluster | The original thing to show | Next step |
| --- | --- | --- | --- |
| 1 | **What Google Search Console does and doesn't show about AI search** — AI search visibility measurement | Google generative AI report + PostHog ChatGPT-referrer view + metric definitions | SEO + AI Search |
| 2 | **What does an MVP cost? A scope-first answer from products I've shipped** — MVP development cost | A real, anonymized scope matrix; separate known project examples from hypothetical ranges | Product development |
| 3 | **How QuoteSweep grew Google clicks 10.3× in four months** — SaaS SEO case study | GSC complete-month export and dated page/technical change log | SEO + AI Search |
| 4 | **The first 90 days of a SaaS product build** — SaaS product development | Milestone map from Pepys/Whooshly, with what changed after launch | Product development |
| 5 | **How to measure ChatGPT referrals without calling them citations** — AI referrals | PostHog entry-referrer definition, exclusions, and July–September Pepys chart | SEO + AI Search |
| 6 | **SaaS SEO strategy built around buyer questions** — SaaS SEO strategies | A real query-to-page map from an owned product, redacted where needed | SEO + AI Search |
| 7 | **What belongs in the first release of a SaaS MVP?** — MVP development process | Cut/keep decision table and product screens | Product development |
| 8 | **Why we gave Pepys and Whooshly characters** — brand mascot/character | Pepys and Quincy model sheets, placements, and motion clips | Mascot branding |
| 9 | **Technical SEO for SaaS: the checks that changed our product pages** — technical SEO for SaaS | Specific crawls, before/after fixes, and their observable effect or lack of one | SEO + AI Search |
| 10 | **How Whooshly connects short links, QR codes, bio pages and landing pages** — SaaS product development | Flow diagram and working screens | Product development |
| 11 | **AEO vs GEO vs SEO: what changes in practice?** — answer engine optimization | A buyer question, source pages, observed answers, and measurement caveats | SEO + AI Search |
| 12 | **How to turn a mascot into a usable brand system** — mascot marketing | Character rules, expressions, placements, and animation examples | Mascot branding |

**Priority rule:** Publish weeks 1–6 first. Adjust later slots using actual qualified search impressions, inquiry quality, and evidence availability. Do not chase a high-volume generic definition merely because the vendor shows a large number.

## Three ready-to-write briefs

### 1. What Google Search Console does and doesn't show about AI search

- **Reader:** SaaS founder or growth lead asking whether AI search has begun creating meaningful demand.
- **Primary cluster:** AI search visibility / how to measure generative engine optimization. Treat `generative engine optimization` as a secondary term, not a promise of rank.
- **Core answer:** Use a measurement stack. Search Console now has a **generative AI performance report** for Google AI Overviews and AI Mode impressions. It does not cover ChatGPT and other non-Google assistants. PostHog can measure sessions with observed AI referrers. A separate, repeatable answer-capture sample can document citations/context. These measures must not be summed as one “AI traffic” number.
- **Outline:** Define the question → what GSC's report includes and its limits → what PostHog entry referrers show → how to run a fixed prompt/capture sample → what each signal cannot prove → weekly scorecard → Pepys/QuoteSweep examples with source notes → invitation to assess the reader's own site.
- **Original visual:** three-column evidence ledger: Google AI impressions; observed ChatGPT referrals; captured answer citations. Show source, date range, and limitations under each.
- **Required evidence:** current Google help page, access to Pepys PostHog view and QuoteSweep capture log, screenshots/export with redaction as appropriate. Reconfirm published figures before shipping.
- **CTA:** “Send me your site and the buyer question you care about.”
- **Links:** SEO + AI Search offer; QuoteSweep case file; future ChatGPT referrals article.

### 2. What does an MVP cost? A scope-first answer from products I've shipped

- **Reader:** founder pricing a first release and trying to compare a solo builder with an agency.
- **Primary cluster:** MVP development cost / cost to build an MVP.
- **Core answer:** A meaningful estimate starts with user journey, workflow, integrations, quality bar, and who owns decisions. Avoid a universal price promise. Explain the difference between a clickable prototype, narrow working MVP, and production-ready release.
- **Outline:** Define the release → cost drivers → examples of features to defer → a scope worksheet → what a 90-day build includes → real product lessons from Pepys/Whooshly → how to get a scoped estimate.
- **Original visual:** one-page “keep, defer, cut” scope worksheet with a concrete fictional scenario clearly labeled as illustrative, plus owned-product screenshots.
- **Required evidence:** confirm current offer pricing on site and any published project details; do not disclose client economics or claim actual cost without records.
- **CTA:** “Send the messy brief and we'll scope the first release.”
- **Links:** Product development offer; 90-day build article; product proof.

### 3. How QuoteSweep grew Google clicks 10.3× in four months

- **Reader:** B2B SaaS or vertical-software lead deciding whether SEO can create product demand.
- **Primary cluster:** SaaS SEO case study / B2B SaaS SEO case study.
- **Core answer:** Show the sequence of decisions and measured outcome, with attribution limits. Existing site copy reports 96 April to 988 August 2026 Google clicks and 44,149 to 244,510 impressions. Verify raw Search Console exports before publication. Distinguish Google clicks from leads, signups, citations, and revenue.
- **Outline:** Product context → baseline → pages and technical moves by date → GSC complete-month chart → buyer questions where AI answer appearances were observed → what cannot be attributed → what would be done next.
- **Original visual:** dated timeline over the actual monthly GSC chart; link to representative public pages.
- **Required evidence:** fresh GSC export, change log, canonical/URL checks, captured answer evidence with dates. Do not imply all growth was caused by one tactic.
- **CTA:** “What would your search case file show?”
- **Links:** SEO + AI Search offer; AI measurement guide; related QuoteSweep product page.

## Measurement and editorial gates

1. **Before drafting:** inspect current US SERP for intent and competing formats, verify that a single existing or planned URL should own the query, and confirm a first-hand contribution.
2. **Before publishing:** fact-check metrics against source exports, record date ranges and definitions, label observations vs inferences, then copy edit for Ankur's voice.
3. **At launch:** indexable canonical article, included in sitemap, links from /build-log/ and a relevant offer/product page, working mobile layout, working CTA and analytics.
4. **At 30/60/90 days:** GSC page/query impressions and clicks, generative AI report if the property has access, qualified PostHog sessions, article-to-offer navigation, inquiry submissions, and newsletter subscriptions if active. No rank/lead forecast from search volume.
5. **Pruning:** if two posts serve the same reader question, improve one and merge rather than keep both as weak pages.

## Beehiiv: useful, but second

Start with the **ankur.works blog as the canonical library**. Beehiiv is useful later as a distribution and relationship layer: a short, monthly “what I shipped / what I learned” note linking back to the original full articles. That format fits the builder voice better than a generic weekly SEO roundup.

Pilot after **four published articles** and a clear sign-up promise. One possible name: **The Build Log**. Promise: “One useful build or growth lesson from the products I'm shipping, once a month.” Add a simple on-site signup only after deciding where subscriber data goes and what readers will receive. Beehiiv's current plan and custom-domain documentation should be checked at setup because plan availability can change. A second full-text Beehiiv archive would create duplicate-URL/canonical decisions without helping the first SEO goal.

## Source notes

- Google, [people-first content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content) and [AI Search guidance](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide): original experience and non-commodity content matter more than mass-producing near-identical pages.
- Google, [Generative AI performance report](https://support.google.com/webmasters/answer/16984139?hl=en-GB): rolled out from 31 August 2026; shows Google AI Overviews and AI Mode impressions, with stated report limits. Property access and data sufficiency still vary.
- Google, [canonicalization](https://developers.google.com/search/docs/crawling-indexing/canonicalization): prevent unnecessary duplicate page versions.
- Beehiiv, [SEO settings](https://www.beehiiv.com/support/article/37100791400727-seo-settings-for-your-website) and [pricing](https://www.beehiiv.com/pricing): vendor docs; reconfirm when deciding to launch.
- Existing ankur.works offer pages are the source for the product metrics quoted in these briefs. Their raw analytics were **not re-exported during this keyword research**.
