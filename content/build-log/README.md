# The Build Log

The three `.mdx` files are review drafts. Run `npm run dev -- --port 5181` and open `/build-log/` to read them. `npm run build` renders them to static HTML through `scripts/build-build-log.js`; no React is sent to readers.

The MDX files can use `<SignalMap />`, `<ScopeMap />`, `<EvidenceBars values={[...]} labels={[...]} title="..." source="..." />`, and `<SourceNote>...</SourceNote>`. `EvidenceBars` validates matching arrays and renders a text alternative for the data. Add a new `slug.mdx` with the required `meta` export; the index and Vite inputs pick it up automatically.

For case studies, lead the title, deck, summary and OG cover with the most meaningful verified change: percent or multiplier, metric, and period. Put the starting and ending counts beside the chart or in the body so readers can check it. State what the measure actually counts; never turn traffic, impressions or signups into revenue, citations or causal proof. For a guide without comparable data, lead with the decision or outcome instead of forcing a growth percentage. Prices and standalone counts keep their units and context. Refresh the evidence before publication.

All current pages have a `noindex,nofollow` meta tag, are absent from `public/sitemap.xml`, and have no homepage link. Before publication, confirm the source exports and rights to screenshots, replace draft labels/dates, enable indexing for approved posts, add the sitemap and navigation links, then verify the built and live pages. The currently published offer-page metrics are leads for editorial verification, not a substitute for the underlying exports.
