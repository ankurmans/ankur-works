# Portfolio card copy concepts

Drafts for review, not live site copy. Each card should carry one punchline, one clear product description, and at most one proof line.

| Product | Punchline | Search-friendly description | Proof / status |
| --- | --- | --- | --- |
| Pepys | The good bit is buried at 47:12. Find it. | AI transcription, captions, and summaries for audio and video. | Signups from 130+ countries in the past year, based on GeoIP where available. Claude directory listing. |
| Whooshly | $35 once. Your links can stop paying rent. | Short links, dynamic QR codes, UTMs, and link-in-bio pages. | Core is $35 one time. Optional paid features remain separate. Claude directory listing. |
| QuoteSweep | Quotes shouldn't need detective work. | A clearer commercial insurance quoting workflow. | Closed beta; no invented traction metric. |
| Twinsona | Your audience asks. Your content answers. | An AI twin grounded in your own content. | Closed beta; no invented traction metric. |
| Linnet | Send the email. Skip the email plumbing. | Product email delivery and operations. | Building; no public link yet. |

## Evidence notes (2026-09-24)

- Whooshly `shared/constants.ts` sets Core to 3,500 cents. Its public website also says Core is $35 once. Optional Pro and usage-related costs are separate, so the card should say **Core** rather than imply every feature is forever free of recurring charges.
- Pepys `lib/auth.ts` sets `signed_up_at` on a `signed_up` event after account creation. In the connected Pepys PostHog project, a query of production `signed_up` events over the past 365 days found 3,894 distinct people. Joining that cohort to current person properties found initial GeoIP country on 3,069 people across **132 countries**. This is a noncanonical analytics aggregate and a signup geography claim, not an active-customer claim; 825 of the people lacked a country value. `130+` is a stable public-facing rounding as of 2026-09-24, but refresh it before publication.
- The personal portfolio should use search terms to explain each product. Put competitor terms such as `Bitly alternative` on the Whooshly product site or comparison pages where the feature boundaries can be explained.
