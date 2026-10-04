# Build Log cover system

Use the same 1200 × 630 canvas, An mark, wordmark, Build Log label, category, and footer on every post. Put the post's outcome or useful idea in the title. The cover art is for link previews; it does not appear in the article body.

- **Ink evidence:** measured case studies with a source backed time series. Lead with the relative change and period; use exact counts as chart labels or article proof. Never plot estimated or cherry picked points as if they were a complete series.
- **Editorial paper:** explainers and decision guides. Lead with the question or useful thesis. Use the marigold highlight sparingly; avoid a full marigold background.

For a new post, add its `.mdx` file and a matching entry in `scripts/generate-build-log-og.mjs`. The cover text must match the article title. Generate the committed PNG with `node scripts/generate-build-log-og.mjs` (requires `rsvg-convert` and the included Space Grotesk font), then run `npm run build`. The Build Log page builder derives the OG image URL from the post slug.

Before publishing a measured cover, check the baseline, end value, date range, arithmetic, chart points, and source screenshot or export. The QuoteSweep cover uses complete month Google Search Console clicks from April to August 2026: 96 → 988, or 929% growth. It does not claim sales growth or that a specific tactic caused the increase.
