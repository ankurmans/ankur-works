# Outlever research assistant corpus

`research-corpus.jsonl` is a dated, source-bound research record. Regenerate with `python3 build_corpus.py`. The generator validates IDs, cross-references, required fields, type counts, and the 300-word limit. It does not call an LLM. The live assistant does not load or search this corpus.

## Provenance

- Phase 1 observations: `../../research/EVIDENCE_DOSSIER.md`, `../../research/capture_summary.json`, `../../research/state_of_brand_inventory.csv`, `../../research/outlever_inventory.csv`, and `../../research/endpoint_checks.csv`, captured on 2026-10-01.
- Governing interpretation: `../../research/PHASE_1_CORRECTION.md`.
- Site proposal and page-copy snapshot: `../EDITORIAL_SPEC.md`. A dated scrape of the public page is saved in `live-page-copy-2026-10-01.txt` with the fetch time and HTML hash. The separate Outlever task is changing the rendered page, so compare the final deployment again before the assistant claims to reflect the revised UX or copy.
- Primary public source URLs are retained in `source_url` or `supporting_source_urls`; first-party claims remain `REPORTED_CLAIM`. A public page can support the fact that a claim was made without proving the claim itself.

## Evidence rules

1. Preserve each object's type, caveat, and provenance when using this record for future research.
2. For any claim about traffic, AI citations, search cannibalisation, redirects, conversions, or backlinks, consult the corresponding `UNKNOWN` object. No GSC, GA4, direct AI-answer panel, or URL-level backlink export was available in Phase 1.
3. Treat `INFERENCE`, `HYPOTHESIS`, and `RECOMMENDATION` as Ankur Research interpretations or proposals. Never rewrite them as observed deficiencies or guaranteed outcomes.
4. The FAQ and question objects are bounded answer examples. Their `supporting_object_ids` lead to the evidence objects; they are not independent proof.
5. Do not publish or change an Outlever or State of Brand page based solely on this corpus. Check the current live page and ask Outlever to approve any company-facing claim or concept copy.

The live server route at `app/api/research/route.ts` uses a short, fixed evidence brief in `lib/research-brief.ts` plus the operating rules in `lib/research-prompt.ts`. The assistant is a question-answering view of dated evidence, not a live audit of Outlever or an AI-visibility measurement.
