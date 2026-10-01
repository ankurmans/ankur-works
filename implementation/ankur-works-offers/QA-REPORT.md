# Search-Led GTM QA report

Date: 2026-10-01. Review method: fresh read of the built page, desktop browser inspection, narrow mobile viewport/overflow check, generated AI Twin corpus inspection, static metadata/schema validation, full test suite and build. This was a second pass by the implementing agent; it was not a separate human review.

| Question | Finding |
| --- | --- |
| 1. Does Search-Led GTM differentiate the offer? | Yes. The page leads with the commercial system and four connected jobs rather than a list of SEO tasks. |
| 2. Can a normal buyer immediately understand SEO + AI Search? | Yes. The eyebrow, first sentence, title, meta description and Service schema say it plainly. |
| 3. Is the page commercially focused? | Yes. Buyer journeys connect to a CTA; method and fit are short. The page retains the price and 90-day minimum. |
| 4. Does it feel like Ankur? | Yes. First-person copy and the owned-product case-file visual remain. No fabricated dashboard was added. |
| 5. Are SEO terms natural? | Yes. SEO, AI Search, commercial SEO, technical SEO, entity clarity and landing pages appear in their actual work context. Acronym lists are absent. |
| 6. Is Caldrin distinct? | Yes. The existing PE-backed home-services sentence and contextual link remain. |
| 7. Does the AI Twin explain the framing? | Yes. The generated framework record is retrieved first for “What is Search-Led GTM?” and contains the SEO + AI Search descriptor. The realtime prompt was updated in source. |
| 8. Is an established industry category implied? | No. The AI Twin record explicitly calls it Ankur Shrestha's framing and says it is not universally established. The page presents it as this offer. |
| 9. Is homepage proof-of-work primary? | Yes. The builder hero and project proof remain unchanged; only the Search offer card copy and CTA changed. |
| 10. Does architecture support future authority/book work? | Yes. A page map, keyword candidates, four content clusters and evidence-gated book roadmap were added. |

## Engineering checks

- Full test suite: 73 passed, 0 failed.
- Vite production build: passed. Existing bundle-size warning remains; it is not introduced by this copy/layout update.
- HTML: one H1 on Search page; canonical unchanged; homepage and Search JSON-LD parse with Person/WebSite/WebPage/Service types.
- Responsive: narrow viewport had no horizontal document overflow; journey and system visuals stack. Desktop hero and journey strip inspected in-browser.
- Proof: QuoteSweep and Pepys figures and their caveats stayed intact. No new attribution claim was added.
- Keyword data: qualitative SERP wording only. Search volume, difficulty, paid SERP metrics and prospect GSC/CRM data were not retrieved.
- Voice agent sync: source prompt and corpus are ready; the private ElevenLabs agent must be synced after this page deploys.

**Final state: RELEASE_READY** for the positioning page and AI Twin source. The separate SES form PR remains draft. A separate human/editorial reviewer may still review the PR before future copy iterations; this report does not claim one did.
