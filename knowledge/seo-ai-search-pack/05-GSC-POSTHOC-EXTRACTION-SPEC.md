# GSC Post-Hoc Extraction Spec

Goal: find the strongest credible growth proof across Ankur's properties without tiny-base bullshit.

## Raw grain
Pull daily:
date, property, query, page, clicks, impressions, position, country, device, search appearance where useful.
Minimum useful grain: date × query × page.

## Windows
Compute:
- latest 28 vs previous 28
- latest 28 vs YoY
- latest 90 vs previous 90
- latest 90 vs YoY
- earliest comparable 28 vs strongest current 28
- intervention-specific matched windows
- rolling 7/28/90-day charts

## Derived query fields
is_brand, intent_class, topic_cluster, product/service, geo_modifier, comparison_query, commercial_query.

## Derived page fields
page_type, product, commercial_or_content, launch_date, intervention_date, canonical_group.

## Candidate-proof fields
before/after clicks, absolute gain, growth %, multiple, impressions, CTR, position, distinct queries, non-brand clicks, commercial clicks, confidence, confounders, approved public wording.

## Winner views
- top absolute click winners
- top credible multiples
- top non-brand winners
- top commercial-intent winners
- top page breakouts
- top new-query expansion
- top YoY winners
- fastest post-intervention growth

## Guardrails
Do not headline a multiple if baseline clicks <20, after clicks <50, growth is mostly branded, one query dominates, periods are unequal/incomplete, or known GSC anomalies materially affect the window.

## Best RAG object
Store each approved proof as a small self-contained YAML/JSON object with:
proof_id, property, claim_type, headline, before, after, multiple, growth_pct, segment, source, confidence, caveats, allowed_phrasing, forbidden_phrasing.

Do not feed giant raw CSVs directly to the twin.
