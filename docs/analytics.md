# ankur.works analytics

PostHog project: [ankur.works in KMF-Part-2](https://us.posthog.com/project/289223/). The browser token comes from Vercel's `VITE_POSTHOG_TOKEN` build variable. PostHog runs on the three portfolio pages; the separate Outlever site is outside this setup.

## What counts

| Event | Trigger | Useful properties |
| --- | --- | --- |
| `$pageview` | A portfolio page loads | PostHog URL, referrer, and campaign fields |
| `offer_intent` | A service CTA is clicked | `intent`, `placement` |
| `offer_form_opened` | The AI Twin opens its inquiry form | `intent`, `source` |
| `offer_form_started` | A visitor interacts with an inquiry form | `intent`, `source` |
| `offer_lead` | The inquiry API accepts a submission | `intent`, `source`, `placement` |
| `booking_link_clicked` | A visitor leaves for a Cal.com booking page | `source` |
| `booking_calendar_opened` | The AI Twin opens its inline calendar | `source` |
| `booking_completed` | Cal.com's inline embed reports a successful booking | `source` |
| `contact_click` | A visitor clicks an email link | `method`, `source` |
| `outbound_link_clicked` | A visitor clicks an external product, proof, or social link | `destination_host`, `category` |
| `ai_twin_opened` | The chat dialog opens | `page` |
| `ai_twin_question_submitted` | A text, dictated, or real-time voice question is submitted | `channel`, `entry` when applicable |
| `ai_twin_answer_received` | The assistant produces an answer | `channel`, `action`, `has_sources` when applicable |
| `ai_twin_answer_failed` | A text or dictated question fails | `channel` |
| `ai_twin_call_started` / `ai_twin_call_ended` / `ai_twin_call_failed` | A real-time voice call connects, ends, or fails | `duration_seconds`, `question_count` on end |

`offer_lead` is the main on-site conversion. It is emitted only after the server accepts the inquiry, whether the visitor used a service page or the AI Twin. `offer_intent`, form starts, email clicks, and booking link clicks are interest signals, not leads or booked meetings.

`booking_completed` covers only the inline Cal.com embed in the AI Twin. A visitor who leaves for cal.com may book there, but this site cannot confirm that from a link click. Use Cal.com booking records or a webhook for a complete booking count.

Custom events do not include form fields, email addresses, AI questions or answers, transcripts, booking details, or raw outbound URLs. They use fixed event names and short categorical properties. PostHog's standard pageview properties are separate from these custom events.

For portfolio-only reporting, filter `$host` to `www.ankur.works` or `ankur.works`; the project still contains historical XEO data. Exclude marked QA visits such as `tracking_verify` when reporting real visitor outcomes.

Recommended funnel: `$pageview` → `offer_intent` → `offer_form_started` → `offer_lead`, broken down by `intent`. Inspect booking and AI Twin events separately so a calendar open or assistant answer is never counted as a lead.
