# Outlever field note — local editorial microsite

Independent analysis by Ankur. The app is isolated in `outlever-site/` so it does not replace the root `ankur.works` portfolio. The central visual follows the corrected Phase 1 brief: newsroom built → search layer emerging → commercial layer underconnected → proposed opportunity.

The review design references Outlever's public theme as seen on 2026-10-01: near-black background, bright green accent, heavy Inter typography, and fine outlines. The hero uses Outlever's [official SVG wordmark](https://cdn.prod.website-files.com/699f91700f9888b0609f12f4/69a0085d51ced642a1a28f3e_Out%20Lever%20Logo.svg), saved unchanged at `public/outlever-logo.svg`. The Ankur masthead and independence disclosure remain visible. The theme overrides live in `app/outlever-theme.css`; the Inter font is self-hosted under its SIL Open Font License.

## Run

```sh
cd outlever-site
npm ci
npm run dev
```

Open `http://localhost:3000`. Build and preview the Next.js server:

```sh
npm run build
npm run preview
```

The page is pre-rendered, while `/api/research` runs as a server route for the research assistant. `npm run lint` and `npm run typecheck` are the focused code checks.

## Publication state

The site is deployed to a separate Vercel project, `outlever-ankur-works`, at `https://outlever.ankur.works/`. Cloudflare has a DNS-only CNAME for `outlever` pointing to the Vercel target for this project. The production environment sets `SITE_PUBLISHED=1`, which enables indexing and the one-page sitemap. The default local build remains **not indexable**: metadata emits `noindex,nofollow` and `robots.txt` disallows crawling.

The share button copies `https://outlever.ankur.works/`, including in local preview. The page uses the contact address already present on the `ankur.works` portfolio. No analytics provider or credentials are configured. The client component emits `ankur:analytics` browser events for page view, scroll depth, source clicks, share clicks, and CTA clicks; connect a provider only after deciding what to collect.

## Content and evidence

- `EDITORIAL_SPEC.md`: final page copy, visual plan, and source map.
- `PURPLE_COW_PASS.md`: design, UX, and copy review with the specific changes made.
- `app/page.tsx`: rendered analysis and proposed pilot.
- `app/data.ts`: public source URLs and the pending 15-prompt AI panel.
- `../research/EVIDENCE_DOSSIER.md`: Phase 1 research and limits.
- `../research/PHASE_1_CORRECTION.md`: governing thesis and evidence language.
- `knowledge/research-corpus.jsonl`: typed, dated research record; `knowledge/build_corpus.py` regenerates it. The live assistant does not query it.
- `lib/research-brief.ts`: the short, fixed evidence brief and source allowlist for the live assistant.
- `lib/research-prompt.ts`: the research assistant's operating rules.

The 236-page inventory is the union of 216 sitemap news URLs and 20 additional live homepage-linked news URLs captured on 2026-10-01. It is not a traffic or readership metric. The page treats the Search + AI Capture Layer as a hypothesis, leaves the AI panel pending, and does not choose redirects or canonical survivors.

The research assistant sends a visitor's question and the fixed evidence brief to Vercel AI Gateway using the server-side OIDC token supplied in Vercel functions, or `AI_GATEWAY_API_KEY`. Pull an OIDC token into the gitignored `.env.local` for local testing; never use a `NEXT_PUBLIC_` secret. The browser receives the answer and allowlisted public source links, not the credential or research record. The endpoint limits question length, rejects cross-origin browser requests, caches answers, and uses per-instance hourly/daily request caps. A shared budget or rate store is still advisable before significant public traffic. Questions seeking unmeasured traffic, AI citations, cannibalisation, redirects, conversions, or revenue results return an explicit unknown answer and the next data needed.

## Review checklist

1. Desktop: hero, four-stage system, cluster, hub draft, commercial concept, AI pending state, source appendix.
2. Mobile: no horizontal overflow; readable evidence labels; all source links, the prompt disclosure, and the share button usable.
3. Accessibility: keyboard navigation, visible focus, heading order, contrast, semantic lists, reduced-motion preference.
4. Print: source URLs visible and core diagrams intact across page breaks.
5. Evidence: every published factual assertion resolves to a linked source and retains its observed / reported / inferred / hypothesis label.

## Deployment notes

1. The Vercel project's framework preset is Next.js. Run CLI deployments from `outlever-site/`; its production environment has `SITE_PUBLISHED=1`.
2. Recheck current source pages, the 236/20 counts, and the publication date before future releases if time has passed.
3. Deploy from this folder with `vercel --prod --yes`; the project is linked locally in ignored `.vercel/` settings. The root portfolio Vercel project is separate.
4. Verify the served page at desktop and mobile widths, source links, share action, print view, contact route, `robots.txt`, `sitemap.xml`, canonical, and social preview. Publication does not authorize outreach.
