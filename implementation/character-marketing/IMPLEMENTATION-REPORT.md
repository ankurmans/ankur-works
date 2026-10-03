# Character-led marketing implementation

Date: 2026-10-03. Branch: `codex/character-marketing`. This worktree was cut from `origin/main`; the separate dirty root checkout was not changed.

## Built

- `/mascot-branding/`: a visual service page with the real Whooshly cast, a 32-second click-to-play character film, Pepys illustrations, the create/codify/activate/compound system, three ways to work, and a direct inquiry form.
- Homepage: a third path in “Work with me”, using owned character art. No new top-level navigation item.
- SEO: canonical URL, title, description, social image, Service-to-Person schema, sitemap entry, descriptive alt text, and cross-links from the two existing offer pages.
- Measurement hooks: page view with source, offer-intent click, film play, accepted inquiry. The offer is accepted by client and server form validation and listed in the existing chat inquiry chooser.
- Optimized assets: WebP character art, a 1.75 MB click-to-play MP4 with a poster, and a 1200×630 PNG social image.
- AI Twin knowledge extraction includes the new public offer page and excludes the unapproved prospect concept.

## Category decision

Positioning: **Character-led marketing**. Plain-English description: **Brand mascots, launch films and recurring product content**. SEO family: **mascot branding**, supported naturally by **brand mascot**. See [CATEGORY-DECISION](../../research/character-marketing/CATEGORY-DECISION.md) for the demand and intent evidence. The offer is a product marketing and reusable content system; the page does not claim mascot-driven growth or a commissioned client result.

## Release boundary

The local build and tests pass, and the visual page is ready for review at `http://127.0.0.1:5178/mascot-branding/` while the dev server runs. This task did not deploy or establish that the production URL is live. The optional `dataLayer`/Plausible hooks are emitted in the browser, but this repository has no configured collector for persisting them; measurement ingestion must be connected and checked after release. The unapproved prospect remains `PUBLIC_SHARING_PERMISSION_PENDING` and is absent from public assets and copy.

Source is the `utm_source` value when present, otherwise the referrer hostname or `direct`; UTM medium and campaign accompany an inquiry. The source film remains in the Whooshly repository. Booked calls, proposals, closed work and selected package require an offline booking/CRM workflow; they are not represented as tracked site events.

See [QA-REPORT](QA-REPORT.md) for the release decision.
