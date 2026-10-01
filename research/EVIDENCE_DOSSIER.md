# Outlever / State of Brand — Phase 1 evidence dossier

**Captured:** 2026-10-01, 05:03–05:05 UTC. **Scope:** public pages and qualitative web-search samples. **Status:** research, not publication copy. The attached prompt pack supplied questions to test; its proposed thesis was not accepted as evidence.

**Governing public thesis, updated after Phase 1:** “Outlever built the newsroom first. The search layer is emerging next — and there is an opportunity to turn it into a deliberate, reusable system.” The [Phase 1 correction](PHASE_1_CORRECTION.md) overrides conflicting thesis language in the archived prompt pack.

## 1. Executive finding

Outlever has a real public newsroom operation and a visible human distribution footprint. Its own commercial site, however, exposes only a homepage in the links and endpoints inspected. State of Brand has also begun publishing evergreen owned-media guides, which weakens the pack's premise that search capture is absent. The strongest current opportunity is to connect the commercial site, publication, and newer evergreen material more deliberately. **We cannot establish an organic-traffic deficit or AI-citation deficit from public data.** Sources: [Outlever homepage](https://www.outlever.com/), [State of Brand homepage](https://www.thestateofbrand.com/), [State of Brand sitemap](https://www.thestateofbrand.com/sitemap.xml), [new B2B owned-media guide](https://www.thestateofbrand.com/news/what-is-owned-media-b2b).

### Five findings that passed the public-evidence gate

| ID | Finding | Status and boundary | Direct sources |
| --- | --- | --- | --- |
| F1 | State of Brand is an active publication: the captured sitemap lists 216 news URLs, and 20 more news URLs linked from its homepage were live with HTTP 200. | **Observed** in our 2026-10-01 crawl. The 236-page union is a *minimum observed inventory*, not all historical content or readership. | [Sitemap](https://www.thestateofbrand.com/sitemap.xml), [homepage](https://www.thestateofbrand.com/), [example recent article](https://www.thestateofbrand.com/news/ai-generated-ads-trust-quality-waymark-cinematic) |
| F2 | The publicly linked Outlever site is a one-page commercial presentation: homepage links point to itself, a `#contact` anchor, LinkedIn, and third-party biography/proof pages. No linked service, case-study, About, or State of Brand destination was found. | **Observed** in raw homepage HTML. This does not prove no unlinked page exists. | [Outlever homepage](https://www.outlever.com/), [robots.txt](https://www.outlever.com/robots.txt), [standard sitemap path](https://www.outlever.com/sitemap.xml) |
| F3 | Twenty live articles linked from the State of Brand homepage were absent from its XML sitemap, including both September 25 owned-media guides. | **Observed** by URL-set comparison. This is a sitemap coverage defect, **not** proof that Google or any AI engine failed to index them. | [Sitemap](https://www.thestateofbrand.com/sitemap.xml), [homepage](https://www.thestateofbrand.com/), [guide 1](https://www.thestateofbrand.com/news/what-is-owned-media-b2b), [guide 2](https://www.thestateofbrand.com/news/b2b-owned-media-guide) |
| F4 | At least three self-canonical articles answer the broad “what is owned media” intent, and a fourth newer guide covers how B2B firms build it. | **Observed** titles, headings, dates, and canonicals. **Overlap risk is inferred**; search competition, survivor choice, and redirects require GSC and URL-level backlink data. | [May definition](https://www.thestateofbrand.com/news/what-is-owned-media), [July definition](https://www.thestateofbrand.com/news/what-is-owned-media-949f4), [September definition](https://www.thestateofbrand.com/news/what-is-owned-media-b2b), [September how-to](https://www.thestateofbrand.com/news/b2b-owned-media-guide) |
| F5 | Melissa Rosenthal's public LinkedIn profile displayed about 53K followers in the search result captured, while Outlever's company profile displayed 1,659. | **Observed public profile displays**, not independently verified impressions, unique readers, pipeline, or campaign lift. The larger performance numbers below remain reported claims. | [Melissa LinkedIn](https://www.linkedin.com/in/melissarosenthal5), [Outlever LinkedIn](https://www.linkedin.com/company/outlever) |

Reproduce F1–F4 with `python3 research/capture.py`. The [inventory](state_of_brand_inventory.csv), [endpoint checks](endpoint_checks.csv), [sitemap snapshot](state_of_brand_sitemap.xml), and [capture summary](capture_summary.json) preserve URLs, capture times, HTTP status, page hashes, titles, canonicals, dates, and extracted links. The crawl requested 240 unique State of Brand URLs from the sitemap/homepage union; all returned HTTP 200 at capture time. Source: [State of Brand sitemap](https://www.thestateofbrand.com/sitemap.xml), [homepage](https://www.thestateofbrand.com/).

## 2. What appears to be working

- **A functioning editorial operation, not merely a claim of one.** The 236 live news URLs observed span May through September 2026; the newest captured article had a September 30 publication timestamp. Outlever describes State of Brand as its operating test bed and says the same infrastructure powers customer newsrooms. The latter is **documented by Outlever**, not independently audited software architecture. Sources: [sitemap](https://www.thestateofbrand.com/sitemap.xml), [recent article](https://www.thestateofbrand.com/news/ai-generated-ads-trust-quality-waymark-cinematic), [Outlever's explanation](https://www.thestateofbrand.com/news/Outlever-Owned-Media-Newsroom).
- **Explicit product and category language.** Outlever's homepage describes an owned newsroom, ICP-led editorial machine, executive/SME perspectives, and human distribution. That is a clear offer, even without dedicated detail pages. Source: [Outlever homepage](https://www.outlever.com/).
- **Existing evergreen work.** State of Brand now has a [definition guide](https://www.thestateofbrand.com/news/what-is-owned-media-b2b) and a [build guide](https://www.thestateofbrand.com/news/b2b-owned-media-guide) published September 25. The former appeared in a qualitative web-search sample for “what is owned media B2B.” This **falsifies** a blanket claim that the publication has no search-oriented content; it does not establish ranking position or traffic. Sources: the two guides and their live pages.
- **Cross-property entity signals exist.** Outlever's homepage includes Organization JSON-LD with Melissa Rosenthal as founder; State of Brand pages include WebSite JSON-LD naming Outlever as publisher. This is an observed technical link, so the entity relationship is not wholly missing. Sources: [Outlever homepage](https://www.outlever.com/), [State of Brand guide](https://www.thestateofbrand.com/news/what-is-owned-media-b2b).

## 3. Outlever gaps and commercial intent map

The inspected homepage has a contact anchor but no internally linked service or case-study page, no link to State of Brand, and no reference to State of Brand in the fetched HTML. `robots.txt` returned HTTP 200 with an empty body; `/sitemap.xml` returned HTTP 404. These are **observations of those endpoints**, not an indexability verdict. Source: [homepage](https://www.outlever.com/), [robots.txt](https://www.outlever.com/robots.txt), [sitemap path](https://www.outlever.com/sitemap.xml).

| Query / intent to validate | Current Outlever destination observed | Public-page status | Candidate destination (hypothesis) | Why commercially useful |
| --- | --- | --- | --- | --- |
| B2B owned-media company / brand newsroom | [Homepage](https://www.outlever.com/) | Offer present, detail thin | One category/solution page explaining the newsroom model | Makes the offer evaluable beyond the hero |
| Newsroom as a service / managed newsroom | [Homepage](https://www.outlever.com/) | No linked scope/process page | Delivery-model page with roles, workflow, and ownership | Answers procurement questions |
| Executive thought leadership / ICP interview engine | [Homepage](https://www.outlever.com/) | Mentioned, not unpacked | Use-case page only if demand and offer fit are confirmed | Connects executive outcomes to the newsroom |
| Proof / examples / case studies | [Homepage](https://www.outlever.com/) | External career proof, no linked customer proof page observed | Named, permissioned customer examples and the State of Brand operating example | Lets a buyer evaluate performance and fit |
| State of Brand as live demonstration | [Outlever's own article](https://www.thestateofbrand.com/news/Outlever-Owned-Media-Newsroom) | Exists on publication but no link from commercial homepage | Explicit proof route from Outlever homepage | Connects commercial offer to the live system |

These are information-architecture hypotheses, **not validated keyword-volume recommendations**. No search volume, rankings, GSC, or conversion data was available. Sources for current positioning: [Outlever homepage](https://www.outlever.com/), [State of Brand operating example](https://www.thestateofbrand.com/news/Outlever-Owned-Media-Newsroom).

## 4. State of Brand gaps

- **Sitemap freshness:** the 20 homepage-linked articles missing from the sitemap were dated September 21–30. The latest `lastmod` value among listed sitemap entries was September 21. Fixing the generation feed deserves validation, but these missing URLs may already be found through links or other discovery. Sources: [sitemap](https://www.thestateofbrand.com/sitemap.xml), [homepage](https://www.thestateofbrand.com/), [September guide](https://www.thestateofbrand.com/news/what-is-owned-media-b2b).
- **Broad definition overlap:** May, July, and September pages all define owned media and compare it with content marketing. Each has its own canonical URL. No consolidation decision is justified without GSC and link data. Sources: [May](https://www.thestateofbrand.com/news/what-is-owned-media), [July](https://www.thestateofbrand.com/news/what-is-owned-media-949f4), [September](https://www.thestateofbrand.com/news/what-is-owned-media-b2b).
- **New guide integration:** the September build guide had no incoming links from the article bodies in this 236-article capture, though it was linked from the homepage. This is a limited internal-link observation, not proof of orphaning. Source: [build guide](https://www.thestateofbrand.com/news/b2b-owned-media-guide), [homepage](https://www.thestateofbrand.com/).
- **Author metadata:** all 236 captured news URLs emitted NewsArticle JSON-LD and self-referencing canonicals, but none of those NewsArticle objects included an `author` property. This is a structured-data observation; it does **not** prove lower rankings or fewer AI citations. Sources: [representative guide](https://www.thestateofbrand.com/news/what-is-owned-media-b2b), [representative news story](https://www.thestateofbrand.com/news/Outlever-Owned-Media-Newsroom), [sitemap](https://www.thestateofbrand.com/sitemap.xml).

## 5. Content cluster map

| Cluster / URL | Date | Primary / secondary intent | Overlap risk | Links / authority observed | Recommended role |
| --- | --- | --- | --- | --- | --- |
| Owned-media definition — [May](https://www.thestateofbrand.com/news/what-is-owned-media) | May 5 on page | Definition / argument for publishing | High with July and September definitions | 8 article-body incoming links in sampled inventory; external backlinks unknown | Supporting editorial pending GSC |
| Owned-media definition — [July](https://www.thestateofbrand.com/news/what-is-owned-media-949f4) | July 23 on page | Definition / replacing the B2B blog | High with May and September definitions | 0 article-body incoming links in sampled inventory; backlinks unknown | Supporting editorial pending GSC |
| Owned media in B2B — [September](https://www.thestateofbrand.com/news/what-is-owned-media-b2b) | September 25 | Explicit B2B definition / guide | High with two earlier definitions | Homepage link and 1 article-body incoming link observed; backlinks unknown | Candidate canonical evergreen **only after** GSC validation |
| How to build owned media — [September](https://www.thestateofbrand.com/news/b2b-owned-media-guide) | September 25 | Implementation / measurement | Medium with definition guide's “how to build” section | Homepage link; 0 article-body incoming links observed; backlinks unknown | Candidate supporting evergreen |
| Newsletter vs operating model — [August](https://www.thestateofbrand.com/news/owned-media-strategy-not-newsletter) | August 10 | Differentiation / newsletter objection | Low to medium | 6 article-body incoming links observed; backlinks unknown | Supporting editorial |
| Why Outlever runs State of Brand — [May](https://www.thestateofbrand.com/news/Outlever-Owned-Media-Newsroom) | May 13 | First-party proof / product operation | Low | Linked from newer definition guide; backlinks unknown | Supporting editorial and proof |

The “incoming links” numbers count `<a>` links inside captured article elements only. They are **not** backlinks, all-site link counts, or Search Console data. **Need GSC / URL-level backlink validation before selecting survivor.** Sources: each linked URL and the [sitemap](https://www.thestateofbrand.com/sitemap.xml).

## 6. Search opportunity map

This was a **qualitative web-search sample**, not a Google rank tracker. Search results varied in intent: a definition query surfaced State of Brand's [September B2B guide](https://www.thestateofbrand.com/news/what-is-owned-media-b2b) alongside glossary/guide pages such as [ActiveCampaign](https://www.activecampaign.com/glossary/owned-media); “brand newsroom” surfaced a [Sprout Social how-to](https://sproutsocial.com/insights/brand-newsroom/); “newsroom as a service” surfaced [Stacker's service page](https://stacker.com/brands/newsroom-as-a-service); “B2B content engine” surfaced [Breaker](https://joinbreaker.ai/blog-posts/b2b-content-engine) and [ContentGrow's service page](https://www.contentgrow.com/b2b-content-engine); branded-newsroom agency research surfaced a [ContentGrip comparison naming Outlever](https://www.contentgrip.com/agencies-branded-newsrooms-b2b/). These examples show different page types, not a measured ranking gap.

| Intent family | Observed page type in sample | Outlever / State of Brand reading | Next validation |
| --- | --- | --- | --- |
| “what is owned media B2B” | Definitions and guides | State of Brand's new guide surfaced; blanket absence claim rejected | GSC query/page impressions and position |
| “brand newsroom” | How-to guide | Outlever homepage describes offer; no detailed destination observed | Live Google SERP by location and buyer intent |
| “newsroom as a service” | Service landing page | Outlever has no linked equivalent page observed | SERP and buyer-language check |
| “B2B content engine” | Guides and service page | Outlever's title uses this phrase | Query-to-page mapping in GSC |
| “best B2B owned media companies” | Directories/comparisons, noisy results | No absence conclusion from one search sample | Repeatable, location-pinned SERP capture |
| Executive thought leadership / content | Agency and platform pages | Distinct buyer journey from newsroom category | Validate if Outlever sells this independently |

SERP features, exact positions, traffic, keyword volume, and whether Outlever is absent across all variants were **not measured**. Sources: linked examples above.

## 7. Live AI visibility panel pending

**No direct ChatGPT Search, Google AI Overview/Mode, or Perplexity result was captured.** Web search results are not AI-answer tests. Therefore “absent,” “cited,” “recommended,” citation share, and competing-source claims remain **unverified**.

Prompt panel prepared for a future controlled run: (1) best B2B owned-media companies; (2) companies that build B2B owned media; (3) who builds brand newsrooms; (4) how to build a B2B newsroom; (5) alternatives to traditional B2B content marketing; (6) how to build an owned audience; (7) companies that turn executive expertise into media; (8) newsroom as a service; (9) best B2B thought-leadership companies; (10) best executive-content companies; (11) Outlever; (12) Outlever reviews; (13) is Outlever legitimate; (14) Outlever alternatives; (15) Outlever versus a named, validated competitor. Run each with engine, date, location/account context, answer, URLs, and repeated-run variance. No results are imputed here. Context for the brand's public offer: [Outlever homepage](https://www.outlever.com/).

## 8. Entity findings

Outlever's homepage uses “B2B content machine,” “owned newsroom,” and “#1 news source” language. Its [LinkedIn company profile](https://www.linkedin.com/company/outlever) describes it as an “enterprise intelligence company” that builds owned-media machines. The [State of Brand about-the-system article](https://www.thestateofbrand.com/news/Outlever-Owned-Media-Newsroom) foregrounds newsroom infrastructure. This is **layered positioning**, not proven contradiction: the enterprise-intelligence phrase may describe the data/technology layer, while owned media describes the buyer outcome. A common buyer-facing descriptor could be tested, but should not overwrite Outlever's terminology without a conversation. Sources: [homepage](https://www.outlever.com/), [LinkedIn](https://www.linkedin.com/company/outlever), [publication article](https://www.thestateofbrand.com/news/Outlever-Owned-Media-Newsroom).

## 9. Technical / retrieval findings

| Check | Observed result | Limit |
| --- | --- | --- |
| Outlever robots | [HTTP 200, empty body](https://www.outlever.com/robots.txt) | No observed explicit bot rule; crawl access and indexing outcomes not measured |
| Outlever sitemap standard path | [HTTP 404](https://www.outlever.com/sitemap.xml) | A different sitemap location might exist |
| State of Brand robots | [Sitemap directive only](https://www.thestateofbrand.com/robots.txt) | No explicit GPTBot, ClaudeBot, PerplexityBot, Googlebot, or Google-Extended rule in that file; bot access not tested |
| State of Brand sitemap | [220 URLs](https://www.thestateofbrand.com/sitemap.xml): homepage, 3 category URLs, 216 news URLs | 20 further homepage-linked news URLs were absent at capture |
| State news templates | 236/236 captured news pages returned 200, self-canonicalized, and contained NewsArticle JSON-LD; 0/236 NewsArticle objects included `author` | No causal SEO/AEO claim follows from markup alone |
| Rendering | Sampled titles, article bodies, metadata, and links were present in raw HTML | Browser rendering and search-engine fetches not compared |

No schema recommendation is presented as a citation guarantee. Sources: [Outlever homepage](https://www.outlever.com/), [Outlever robots](https://www.outlever.com/robots.txt), [Outlever sitemap path](https://www.outlever.com/sitemap.xml), [State robots](https://www.thestateofbrand.com/robots.txt), [State sitemap](https://www.thestateofbrand.com/sitemap.xml), [representative article](https://www.thestateofbrand.com/news/what-is-owned-media-b2b).

## 10. Information-gain opportunities

| Asset | Currently used publicly? | Potential search / AI / PR role | Effort to productize |
| --- | --- | --- | --- |
| Interview corpus | Outlever says its models are trained on “thousands of hours” of executive interviews; corpus not inspected | Aggregate, permissioned insights could support original research and citations | High: rights, methodology, privacy, sampling |
| Customer-newsroom operating data | Outlever says the platform powers more than 50 brand newsrooms; underlying metrics not inspected | An anonymized benchmark could answer real buyer questions | High: data access, consent, comparability |
| State of Brand's own editorial workflow | The publication describes itself as a live test bed; public output is observable | A documented operating case could substantiate the delivery model | Medium: disclose process and outcomes with context |
| Existing owned-media explainers | Multiple live guides already exist | A deliberate canonical/supporting map could improve clarity for readers and crawlers | Medium: GSC and link review first |

Sources: [Outlever homepage](https://www.outlever.com/), [how State of Brand runs](https://www.thestateofbrand.com/news/Outlever-Owned-Media-Newsroom), [September definition guide](https://www.thestateofbrand.com/news/what-is-owned-media-b2b), [September build guide](https://www.thestateofbrand.com/news/b2b-owned-media-guide). Search value, AI citation value, and PR value are **potential**, not measured outcomes.

## 11. Productisation thesis

A **Search & AI Capture Layer** could be a repeatable *addition* to Outlever's newsroom infrastructure: map durable buyer questions; assign one maintained answer page per intent; link timely reporting back to those pages; route category/proof pages to a buyer conversation; preserve authorship and source trails; monitor search queries and AI answers with a controlled panel. This is a **proposal**, not a claim that Outlever lacks any internal capability. It should sit beneath the editorial beat and use its reporting as the source material. Current public basis: [Outlever's newsroom offer](https://www.outlever.com/), [its operating-model article](https://www.thestateofbrand.com/news/Outlever-Owned-Media-Newsroom), [existing new evergreen guide](https://www.thestateofbrand.com/news/what-is-owned-media-b2b).

The first pilot should be Outlever's own category page plus a maintained State of Brand owned-media hub, measured in GSC and a fixed AI-answer prompt panel. Customer rollout would require proof of repeatability, rights, and conversion fit. Sources for current surfaces: [Outlever homepage](https://www.outlever.com/), [State of Brand homepage](https://www.thestateofbrand.com/).

## 12. Top five findings worth a public story

1. A real newsroom exists: at least 236 live news URLs in the sampled inventory. [Sitemap](https://www.thestateofbrand.com/sitemap.xml), [homepage](https://www.thestateofbrand.com/).
2. Outlever's commercial homepage does not visibly route buyers into that proof asset. [Outlever homepage](https://www.outlever.com/), [State of Brand operating article](https://www.thestateofbrand.com/news/Outlever-Owned-Media-Newsroom).
3. The search layer is **already emerging** through new guides, which makes a “missing second layer” story too blunt. [Definition guide](https://www.thestateofbrand.com/news/what-is-owned-media-b2b), [build guide](https://www.thestateofbrand.com/news/b2b-owned-media-guide).
4. The current sitemap omits 20 live homepage-linked articles, a narrow and fixable discovery inconsistency. [Sitemap](https://www.thestateofbrand.com/sitemap.xml), [homepage](https://www.thestateofbrand.com/).
5. Three broad owned-media definition pages create a genuine editorial-role question; whether they compete in search remains unknown. [May](https://www.thestateofbrand.com/news/what-is-owned-media), [July](https://www.thestateofbrand.com/news/what-is-owned-media-949f4), [September](https://www.thestateofbrand.com/news/what-is-owned-media-b2b).

## 13. Claims we cannot prove yet

- **“Organic search is disproportionately weak”**: no GSC, analytics, or reliable third-party organic series was obtained. The new [B2B guide](https://www.thestateofbrand.com/news/what-is-owned-media-b2b) appeared in a qualitative web-search sample, so absence is already too strong.
- **“AI citation value is leaking”**: no direct AI-answer run or referral/citation data. Source pages exist, but citation outcome is unknown. [State of Brand guide](https://www.thestateofbrand.com/news/what-is-owned-media-b2b).
- **“1.5M monthly uniques,” “4M LinkedIn impressions per week,” “300–500 subscribers/day”**: Outlever/Melissa and a third party report these, but no analytics export was reviewed. Label as **documented by Outlever** or **third-party reported**, never independently verified. Sources: [Melissa's Superpath AMA](https://www.superpath.co/blog/ama-with-melissa-rosenthal-co-founder-at-outlever), [Finn Thormeier's LinkedIn report](https://www.linkedin.com/posts/finnthormeier_this-is-the-most-bonkers-linkedin-strategy-activity-7475871766310150144-fnB-).
- **“Customer newsrooms number 50+”**: first-party claim only; no customer list or platform audit. Source: [State of Brand operating article](https://www.thestateofbrand.com/news/Outlever-Owned-Media-Newsroom).
- **Search competition between similar pages or a redirect target**: no GSC query/page series or URL-level backlink evidence. Sources for suspected overlap: [May](https://www.thestateofbrand.com/news/what-is-owned-media), [July](https://www.thestateofbrand.com/news/what-is-owned-media-949f4), [September](https://www.thestateofbrand.com/news/what-is-owned-media-b2b).
- **Commercial conversion leakage**: homepage architecture is observable, conversion behavior is not. Source: [Outlever homepage](https://www.outlever.com/).

## 14. Data that would materially improve confidence

1. Outlever and State of Brand GSC access: 6–12 months of query/page impressions, clicks, index coverage, and sitemap submissions, especially the three owned-media definition pages. Current public pages: [Outlever](https://www.outlever.com/), [State of Brand](https://www.thestateofbrand.com/).
2. GA4/referral exports separating direct, LinkedIn, search, AI referrals, newsletters, and repeat readers. The public [Superpath AMA](https://www.superpath.co/blog/ama-with-melissa-rosenthal-co-founder-at-outlever) reports a mix but does not expose source analytics.
3. URL-level backlink exports before any merge/redirect decision for [May](https://www.thestateofbrand.com/news/what-is-owned-media), [July](https://www.thestateofbrand.com/news/what-is-owned-media-949f4), and [September](https://www.thestateofbrand.com/news/what-is-owned-media-b2b).
4. A location-pinned, dated Google SERP sample and repeated direct runs of the AI prompt panel. No current ranking/citation metrics were captured.
5. Customer-proof permissions and operating data for the first-party claims in [Outlever's operating article](https://www.thestateofbrand.com/news/Outlever-Owned-Media-Newsroom).

**Phase gate:** Phase 1 supports a specific architecture/integration story. It does **not** support a public claim about deficient traffic, rankings, or AI citations. Phases 2–3 must use the updated thesis unless new direct evidence changes it.
