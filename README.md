# ankur.works

Ankur Shrestha's one-page portfolio: full-stack software, developer tools, commerce brands, and experiments.

## Site copy rule

Use an en dash (U+2013) for parenthetical breaks throughout site copy, including page titles, metadata, and UI text. Do not use an em dash (U+2014).

## Featured work

- **Software:** Pepys, Whooshly, QuoteSweep, Twinsona, Linnet
- **Commerce:** Tough Trucks For Kids, Amped Rides
- **Previous chapters:** Luxury Ride On Toys, Girl Powered Ride On Toys, Vynci.ai (shut down), MateCaps (exited)
- **Workshop and public code:** GTM Commit, Grantflow, Answers Hub Kit, Podcast Kit, Pepys MCP, Whooshly MCP
- **Claude Connectors Directory:** [Pepys](https://claude.ai/directory/pepys-co) and [Whooshly](https://claude.ai/directory/whooshly)

Featured products link to public product sites when available. QuoteSweep and Twinsona are labeled closed beta; Twinsona links to its product site, while Linnet has no public CTA. Public code links to public GitHub repositories. No revenue or usage metrics are shown without verified, current evidence.

## GitHub contribution graph

The graph fetches `/api/contributions` first. That route uses GitHub GraphQL and requires a server-side `GITHUB_TOKEN` with `read:user` access. It compares GitHub's per-repository daily commit contributions with the reported commit total. When the token exposes every repository, the squares are exact daily GitHub-counted commits. When GitHub withholds private repository details, the squares come from GitHub's authenticated contribution calendar and are labeled **contributions**; the verified commit total appears separately. It never returns private repository names or code.

Production visitors see a browser-stored snapshot immediately. The browser requests a fresh authenticated snapshot after one hour and refreshes automatically while the page is open; Vercel also caches successful API responses at the edge for one hour. A temporary API failure keeps the last verified private-and-public snapshot, labeled as saved, for up to seven days and retries every 15 minutes. Local development skips the browser snapshot so an expired token remains visible during testing.

If the authenticated route is unavailable on the deployed site, the browser fetches a public contribution feed and labels it **public activity**. That fallback includes commits and other GitHub activity; the UI never calls it a commit-only chart. Local development instead shows a connection message, so an expired token cannot be mistaken for a working private graph.

## Run locally

```sh
npm ci
npm run dev
```

For the private and public graph, create a gitignored `.env.local` file containing `GITHUB_TOKEN=...` with a valid GitHub token authorized for `read:user`. An existing gitignored `.env` also works. Vite serves the same `/api/contributions` handler locally; restart the dev server after changing the token. Never put the token in client code or commit it. The deployed Vercel function reads `GITHUB_TOKEN` from the project environment.

Build with `npm run build`. The older build-time contribution snapshot is no longer part of the build or the redesigned page.

## Portfolio AI Twin

The slim, fully rounded composer at the bottom center opens Ankur's AI Twin. Visitors can type there or use the microphone. It slips out of view while the visitor scrolls and returns when scrolling stops. The expanded chat speaks in first person, identifies itself as AI, changes starter questions with the section in view, cites this page for factual answers, and keeps the booking link inside the chat panel. The site's existing mailto buttons stay as they are. Chat history stays in this browser's local storage, holds at most 12 chats and 30 messages per chat, and can be cleared in the panel. New chat starts a separate conversation; Minimize returns to the composer. Completed chat and voice transcripts are also logged privately in Cloudflare D1; generated answers may be cached for 24 hours.

Voice is optional. The microphone transcribes one question with ElevenLabs Scribe v2 into the adjacent text field, where the visitor can edit it before pressing send. The phone icon opens a dedicated AI Twin call screen with a live state, timer, recent exchange, and End call control. The session listens until a natural pause or a 20-second limit, follows the same grounded chat path, speaks the reply in the Ankur DJI voice using `eleven_v4_turbo`, and then listens again. Ending the call returns to the saved text conversation; closing chat or leaving the tab also stops it. This is turn-based conversation rather than a streaming ElevenLabs Agent call. Text replies have a play button for five minutes; signed reply tokens stop the public endpoint from synthesizing arbitrary text. Set `ELEVENLABS_API_KEY` in the gitignored `.env.local` for local use and in Vercel project environment variables for deployment. `ELEVENLABS_VOICE_ID` defaults to the Ankur DJI clone, `5VWjaX9CdWaweC8OO0dw`; set it explicitly if needed. Restart Vite after changing `.env.local`, and redeploy after changing Vercel variables. The key is never sent to the browser. `ASSISTANT_VOICE_DAILY_CAP` defaults to 200 requests per action and `ASSISTANT_VOICE_HOURLY_CAP` defaults to 60 per IP per action; configure shared Redis counters and a restricted ElevenLabs key with a credit quota before production use. If voice is unconfigured or unavailable, text chat still works.

The commerce proof line is Ankur's first-party claim: he founded and operated Tough Trucks For Kids and Amped Rides, and the two brands grew from launch to $3.76M in combined USD revenue over two years. The exact dates and supporting case study are still to be added. Do not reinterpret the figure as annual revenue, profit, GMV, or the result for either brand alone.

`npm run dev`, `npm test`, and `npm run build` regenerate `api/assistant-knowledge.json` from `index.html` and any offer pages present at `/product-development/` and `/seo-ai-search/`. The Vite build mounts the shared AI Twin widget on those static offer pages. Scoped claims live in `knowledge/approved-claims.json`; generation fails unless each claim's exact wording appears in its cited page section. See `knowledge/README.md` before adding Pepys or QuoteSweep metrics, and `docs/assistant-sites.md` for offer and prospect-site routing. Ordinary work, project, and service-fit questions go through Vercel AI Gateway with recent conversation and retrieved page records. Booking, identity, unsafe requests, and tightly scoped approved claims still have direct guard responses. Generated answers must cite retrieved records, preserve the required scope of numeric claims, and use only numbers present in their citations. Vercel deployments can use their OIDC token automatically; local development can use a current `VERCEL_OIDC_TOKEN` or a gitignored `AI_GATEWAY_API_KEY`. No credential belongs in source files.

Completed AI Twin turns can be stored privately in Cloudflare D1, including voice-call transcripts and submitted dictation without raw audio. See `docs/conversation-logging.md` for the data fields, retention, deployment, and queries.

`knowledge/personality.json` defines the AI Twin's first-person tone and humor boundaries. Personal stories and the Ryan Reynolds work require Ankur's approved details before they become answerable facts. User questions and retrieved text are treated as untrusted input; attempts to reveal instructions or secrets receive a brief redirect.

The AI Twin uses short input limits, an origin check, per-instance rate and daily request backstops, source validation, and a 24-hour answer cache. Set `ASSISTANT_REDIS_REST_URL` and `ASSISTANT_REDIS_REST_TOKEN` to make the counters and cache shared across Vercel instances. Without Redis, they are per instance. The `ankur-works` Vercel AI Gateway project has a $1 daily spend budget as a cross-instance cost guardrail; it is not a hard limit. Keep that budget in place before a live release. Each model-generated response records its provider-reported input and output tokens in server logs and the API response; localhost chat displays the counts. Direct answers and cache hits make no new model call, so they have no new model-token count. The AI Twin does not publish rates or availability and sends personal inquiries to the booking or email links in its panel.

Stack: HTML, CSS, Vite. Live URL: [ankur.works](https://ankur.works/).
