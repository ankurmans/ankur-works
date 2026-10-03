# Independent QA — 2026-10-03

## Checks

| Area | Result | Evidence / limit |
| --- | --- | --- |
| Positioning | PASS | Hero explains brand mascots and product content in one glance; owned product art is visible in the first viewport. Costume/team ambiguity is narrowed by “for product brands”. |
| Differentiation | PASS | Shows Whooshly cast/film and Pepys feature executions, then the create/codify/activate/compound system. Does not claim the category is unique. |
| Proof permission | PASS | Only owned Whooshly/Pepys assets shown. The unapproved prospect is `PUBLIC_SHARING_PERMISSION_PENDING`; source and built page have no identifying name, logo, reaction or video. No fabricated client outcomes. |
| Mobile and desktop | PASS | Captured 320, 390, 768 and 1440-pixel renders; no horizontal overflow. Inspected hero, proof cases, homepage card, offers and form. |
| Navigation and CTAs | PASS | Homepage card, related-offer footer links, page anchors, email link and direct form route are present. Character form enum passes the existing server validator test. |
| Accessibility basics | PASS | One H1; H2 section structure; form labels; descriptive image alt text; skip link; video controls; no autoplay; reduced-motion rule. Formal screen-reader audit not run. |
| SEO basics | PASS | Canonical, title, description, 1200×630 OG image, Service/Person JSON-LD, sitemap entry and internal links in source/build. Search ranking/indexation not inferred. |
| Automated checks | PASS | `npm test`: 79/79. `npm run build`: passed. `git diff --check`: passed. |
| Page/CTA analytics | PARTIAL | Browser events and source attribution are instrumented. No installed analytics collector or production ingestion was verified. |
| Live release | NOT TESTED | No deployment requested or executed in this task; public route and email delivery require post-deploy QA. |

## Decision

**REVISE_AND_RETEST** before claiming the whole brief is live and measured. The page is locally complete and visually reviewable; configure and verify a durable analytics destination, then deploy and test the public route, social preview and a real inquiry. These limits do not imply a flaw in the local build.
