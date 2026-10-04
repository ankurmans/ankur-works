# Launch baseline · 4 October 2026

## Source claims

| Claim | Source and exact rule | Readback | Use |
| --- | --- | --- | --- |
| QuoteSweep Google clicks, April–August 2026 | Search Console API, `sc-domain:quotesweep.com`, web search, complete UTC calendar dates, daily rows summed by month | Apr 96; May 130; Jun 368; Jul 716; Aug 988. April→August +929.2%, or 10.3×. | Safe to describe as Google click growth. No causal or sales attribution. |
| QuoteSweep Google impressions, April–August 2026 | Same Search Console query | Apr 44,149; May 44,889; Jun 100,786; Jul 193,688; Aug 244,510. April→August 5.54×. | Keep separate from clicks and AI-feature appearances. |
| Pepys ChatGPT-referred sessions, July–September 2026 | PostHog project Pepys (472190), `sessions` table; `$entry_hostname = 'pepys.co'`, `$entry_referring_domain IN ('chatgpt.com','chat.openai.com')`, `$pageview_count > 0`; complete UTC calendar months by `$start_timestamp` | Jul 190; Aug 948; Sep 1,637. September/July 8.62×. | Safe to describe as *referred sessions*. Not citations, answers, signups, or conversions. |

PostHog's broader session count without the pageview condition is higher: 233, 1,208 and 2,125. The graphic and case file use the narrower rule above. Do not silently mix the two series.

## Search access and index status

The four indexable URLs returned HTTP 200 to a Googlebot user agent, with self-referencing `www` canonicals in raw HTML. HTTP and apex hosts redirect to `https://www.ankur.works/`; slashless offer paths redirect to slash paths. `robots.txt` and `sitemap.xml` returned HTTP 200. The Build Log index and articles returned 200 but deliberately include `noindex,nofollow` pending editorial review.

| Canonical URL | GSC URL Inspection, 4 Oct | Current live access | Next action |
| --- | --- | --- | --- |
| `/` | Alternate page with proper canonical, last crawl 25 Aug; Google selected the apex canonical at that time | `www` now canonical; homepage recrawl already requested | Reinspect after recrawl; do not count as indexed on `www` yet. |
| `/product-development/` | Discovered, currently not indexed in the GSC UI | 200, self canonical | Indexing requested in GSC on 4 Oct; monitor crawl/index state. |
| `/seo-ai-search/` | Unknown to Google in the GSC UI | 200, self canonical | Indexing requested in GSC on 4 Oct; monitor crawl/index state. |
| `/mascot-branding/` | Discovered, currently not indexed in the GSC UI | 200, self canonical | Indexing requested in GSC on 4 Oct; monitor crawl/index state. |

The sitemap was submitted in GSC at 10:52 UTC on 4 Oct and downloaded with zero errors and four URLs. Its initial sitemap report showed zero indexed; that is a point-in-time report, not evidence of rejection. GSC showed “Indexing requested” for all three offer pages after checking each live URL. The URL Inspection API and UI briefly disagreed about which pages were already discovered, so the table records the later UI snapshot. No article was submitted because publication is gated on Ankur's source and copy review.

Bing Webmaster Tools already had the apex sitemap, last crawled 2 Oct, with three discovered URLs and no errors. On 4 Oct the current `https://www.ankur.works/sitemap.xml` was submitted and showed **Processing**; check its later status rather than treating submission as discovery. Bing reported both apex and current `www` homepages **Indexed successfully**. The `www` mascot page was also **Indexed successfully**. The `www` product and search URLs were **Discovered but not crawled**, and Bing confirmed indexing requests for both. Bing's last-90-day dashboard showed one impression and zero clicks for the property. These are Bing's own point-in-time states; they do not establish search visibility or an indexed state for the two uncrawled offers.

Bing flagged the mascot page's old meta description as too long or short. The current description was 168 characters; it is now shortened to 150 in the next site build. Bing also listed missing alt attributes on the indexed pages, but the current markup uses empty `alt` on decorative mascot images. That notice alone is not reason to replace decorative empty alt text with redundant labels.

Bing AI Performance for the property reported **0 citations and 0 average cited pages** in its three-month sampled view (4 July–3 October 2026). This is a Bing/Copilot-and-partners sample, not a global AI visibility measure. It is a baseline to revisit after the published source material is indexed.

## Pilot measurement

Use `utm_source=linkedin&utm_medium=organic_social&utm_campaign=receipt_01&utm_content=chart` for the first native graphic. Change the receipt number and content value for later editions. PostHog `$pageview` records the landing URL and acquisition fields. Build Log instrumentation adds `build_log_draft_opened`, `build_log_share_menu_opened`, `build_log_share_intent`, `build_log_end_seen`, and `build_log_offer_clicked`. Each includes a slug and `content_status=draft`; offer navigation carries the UTM fields through to the existing inquiry form.

`build_log_share_intent` means the visitor selected a Whooshly share channel. `build_log_end_seen` means the bottom CTA entered the viewport. Neither proves a completed share or a full read. `build_log_offer_clicked` is navigation intent; `offer_lead` is the accepted inquiry event. A Cal.com click is not a completed booking.

For the weekly review, record LinkedIn post reach/reposts from the native dashboard, PostHog landing sessions with UTMs, the above intent events, accepted `offer_lead` events, and qualified conversations separately. Preserve each denominator and link to the source view. Do not publish empty metrics as results.

## AI observation register

The initial fixed buyer questions are: “How do I scope an MVP for a first product?”, “How do I measure AI search referrals and citations?”, “What can a product mascot do beyond a logo?”, “Who helps a founder build and launch a product?”, and “How can a B2B product grow through search before public launch?” For each repeated capture, record engine/model, exact prompt, date, country/account context, whether ankur.works is mentioned, linked URL, and screenshot. No baseline answer capture has been recorded yet, so there is no AI visibility rate to report.
