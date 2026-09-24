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

Stack: HTML, CSS, Vite. Live URL: [ankur.works](https://ankur.works/).
