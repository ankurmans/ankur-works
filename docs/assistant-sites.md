# AI Twin across pages

The portfolio and the two offer pages use one `/api/assistant` endpoint and one chat history per browser. The offer pages are `/product-development/` and `/seo-ai-search/`. When their HTML files are present in this checkout, the Vite build includes them, mounts the same AI Twin widget on both pages, and generates section-level knowledge from their published main content. Answers can cite the exact offer page or its anchored section. The generator omits pricing language from chat context; ordinary page CTAs remain mailto, while Cal.com appears inside the chat.

The offer pages are present in this checkout as a copied snapshot of commit `edaf1e3` from the separate `codex/ankur-works-offers` worktree. The Vite development server serves them locally; production availability requires a deployment of this checkout. Reconcile any later changes from the offer worktree before publishing.

## Prospect subdomains

Each prospect site needs two separate context layers:

1. **Site context:** what the prospect page actually presents, including each section's thesis, proposal, and navigation. This is page copy, not proof of an external outcome.
2. **Company context:** dated, attributed evidence about the prospect company, plus explicit unknowns and disconfirming tests. Reported claims stay labeled as claims.

Outlever implements these layers in `outlever-site/lib/site-context.ts`, `research-brief.ts`, and the source-linked research corpus. Its local `/api/research` handles Outlever and State of Brand questions. The page routes general questions about Ankur's projects or services to the shared `/api/assistant` endpoint. The root endpoint accepts HTTPS origins under `ankur.works`, but it never accepts browser-supplied company facts as trusted context.

For another prospect, create that site's own page map and dated company brief, then use the same split: local evidence assistant for the prospect; central AI Twin for Ankur's general work and the two offers. Add the prospect's public source URLs and test both routes. Keep the site-specific brief versioned with the prospect page; do not add prospect claims to the global portfolio corpus.
