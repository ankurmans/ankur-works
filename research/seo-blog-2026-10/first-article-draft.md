# Earlier outline draft: how to measure AI search

The review draft now lives in [`content/build-log/how-to-measure-ai-search.mdx`](../../content/build-log/how-to-measure-ai-search.mdx). Use that MDX file as the source of truth; this outline remains for editorial history.

**Publication status:** Draft only. Recheck source exports and add actual screenshots before publishing.
**Suggested URL:** `/build-log/how-to-measure-ai-search/`
**Suggested title tag:** How to Measure AI Search: GSC, Referrals and Citations | ankur.works
**Suggested description:** A practical AI search scorecard from products I build: Google AI impressions, ChatGPT-referred sessions, captured citations and the limits of each.

If someone asks, “Is AI search working for us?”, I don't start with a single visibility score. I start by asking what “working” means.

Was a page shown in a Google AI answer? Did an assistant cite the brand? Did someone click through from ChatGPT? Did that person try the product? Those are four different events. Treating them as one number makes a neat chart and a bad decision.

I build and measure my own products, including Pepys and QuoteSweep. The useful approach has been a short evidence ledger: **where the brand appeared, what the source actually measured, and what happened after the visit**.

## 1. Count appearances in Google's AI features

Search Console now has a [Generative AI performance report](https://support.google.com/webmasters/answer/16984139?hl=en-GB). Google says it covers impressions in AI Overviews and AI Mode on Google Search. It can break those impressions down by page, country, date and device. The help page says the rollout began for all sites worldwide on 31 August 2026, while access can still vary when a property lacks enough data.

This matters because the old claim that “Search Console doesn't show AI search” is no longer accurate for Google. But the report answers a narrower question: **was a link to your site shown in a supported Google AI feature?** It does not tell you whether a buyer remembered your name, asked ChatGPT next, or bought because of that impression. It also does not measure appearances in non-Google assistants.

I would watch:

- Generative AI impressions by page and month.
- Which commercial pages are earning the impressions.
- Whether the pages are also getting relevant search clicks in the standard performance report.
- Whether those pages lead to an inquiry, signup or meaningful product action.

An impression is a discovery signal. It is not a lead.

## 2. Count visits from assistants separately

For visits, look in web analytics. PostHog's [web analytics documentation](https://posthog.com/docs/web-analytics/dashboard) shows sessions by entry referrer and UTM. That lets you isolate an observed source, such as sessions whose entry referring domain is `chatgpt.com` or `chat.openai.com`.

This is not a complete measure of AI influence. Some visitors may arrive without a usable referrer. Other assistants use other domains. A referred session also does not tell you which answer prompted the visit, or whether the product was cited. But a consistent definition makes a useful trend.

On the current [ankur.works search case file](https://www.ankur.works/seo-ai-search/), Pepys is reported as having **8.6× as many ChatGPT-referred sessions in September 2026 as in July**, measured as pageview sessions with those entry referrers in PostHog. That is a referral observation. It is not a citation count and should not be presented as one.

**Before publishing this article:** re-export the complete-month PostHog data, confirm the domains, date timezone and session definition, and replace this note with a dated chart.

## 3. Record answer context with a repeatable sample

Citations and mentions require another method. Choose a fixed set of real buyer questions, record the exact prompt, assistant, location/account context if relevant, date and visible answer, and capture the source links. Repeat the same sample over time.

For QuoteSweep, the public case file reports repeated Google AI Overview captures for commercial-rater comparisons, EZLynx alternatives and Bold Penguin alternatives. That supports the narrower statement that QuoteSweep pages were **observed in those answer contexts** on the recorded dates. It does not justify a universal “citation rate” unless there is a defined sample and denominator.

This is why a capture log matters. It prevents one exciting screenshot from becoming a sweeping performance claim.

**Before publishing this article:** attach a redacted example capture with date and prompt, and spell out the fixed sample size. Do not imply a live citation is permanent.

## 4. Follow the visitor into the product

The final question is commercial: did any of this help a buyer do something useful? Measure article-to-offer clicks, qualified inquiries, product signups and activation. Keep the attribution honest. A product signup in the same month as a rise in ChatGPT referrals is not automatically a ChatGPT-sourced signup.

For Pepys, the search case file separately reports more people completing transcriptions as the product grew. The PostHog referral and product-use metrics were measured in different ways, so I would show them on separate lines. Then, if event-level attribution supports it, analyze the cohort of sessions that arrived from AI sources and actually activated.

## A scorecard I would use each month

| Signal | Instrument | What it proves | What it does not prove |
| --- | --- | --- | --- |
| Google AI impressions | Search Console Generative AI report | A site link appeared in supported Google AI features | Visits, citations elsewhere, or sales |
| Search clicks | Search Console performance report | Someone clicked a Google Search result under the report's definitions | All subsequent product outcomes |
| ChatGPT-referred sessions | PostHog entry referrer | Observed visits with a known entry source | Every AI-influenced visit or a citation |
| Answer captures | Fixed prompt sample and dated screenshots | A mention or citation was observed for sampled questions | A global citation rate |
| Signup, inquiry or activation | Product/CRM analytics | A defined action happened | Causal credit without a joined journey |

That is enough to make a useful next decision. If Google AI impressions rise but visits do not, inspect the pages and query context. If referred visits rise but nobody activates, fix the landing experience or product fit. If the brand appears in comparison answers but not on the buyer questions that matter, work on the underlying pages and source evidence.

I would rather show four honest signals than one impressive but undefined “AI visibility” score.

**Want to see what this scorecard would show for your site?** Send me the URL and the buyer question you care about via [SEO + AI Search](https://www.ankur.works/seo-ai-search/). I'll tell you where I would look first.

---

## Editor's publication checklist

- [ ] Recheck Google help page and update date-sensitive feature details.
- [ ] Export Pepys PostHog source data for complete July–September 2026 months; verify definition and obtain permission for the screenshot.
- [ ] Retrieve the QuoteSweep answer-capture log, date and exact prompts.
- [ ] Confirm the offer page's current figures and avoid duplicating any stale metrics.
- [ ] Add an original three-signal diagram and alt text.
- [ ] Add byline, publication date, canonical, article schema where applicable, sitemap entry, and links from the blog index and SEO offer page.
- [ ] Test mobile layout and inquiry CTA before making it live.
