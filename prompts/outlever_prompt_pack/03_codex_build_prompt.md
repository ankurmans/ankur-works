# Prompt 3 — Codex Master Build Prompt

**Current brief:** Read [the Phase 1 correction](../../research/PHASE_1_CORRECTION.md), [the evidence dossier](../../research/EVIDENCE_DOSSIER.md), and the revised editorial prompt before building. Those documents override conflicting language below. Do not start implementation until the editorial copy and evidence map are ready.

You are a senior frontend engineer and editorial product designer.

## BUILD

A polished single-page editorial microsite for:

https://outlever.ankur.works/

## PURPOSE

This is an unsolicited independent strategic analysis of:

- Outlever
- State of Brand
- their distribution model
- emerging evergreen search architecture
- a proposed, unproven AI retrieval/citation measurement and product hypothesis

It should visually feel native to the world of a premium modern business publication.

STATE OF BRAND is the stylistic reference, but DO NOT clone the website pixel-for-pixel and DO NOT create anything that could be mistaken for an official State of Brand page.

The design should communicate:

> “Someone studied their publication closely.”

not:

> “Someone impersonated their website.”

## MANDATORY DISCLOSURE ABOVE THE FOLD

> Independent analysis by Ankur. Not affiliated with Outlever or State of Brand.

## INPUTS

FINAL COPY:  
[PASTE PROMPT 2 OUTPUT]

RESEARCH / EVIDENCE:  
[PASTE PROMPT 1 OUTPUT]

ASSET SCREENSHOTS:  
[LIST LOCAL PATHS OR FILES]

## TECH STACK

Use:

- Next.js
- TypeScript
- Tailwind
- static-first rendering
- minimal JS
- responsive
- deployable on Vercel / Cloudflare Pages equivalent

If an existing repo is supplied:

inspect it first and work within the existing conventions.

## DESIGN DIRECTION

Think:

- premium B2B publication
- strong editorial typography
- mostly monochrome
- generous white space
- precise borders
- restrained accent colour
- large article headlines
- slim metadata lines
- editorial pull quotes
- evidence cards
- native-feeling charts
- no SaaS-gradient nonsense
- no glassmorphism
- no fake dashboards
- no giant rounded cards everywhere
- no over-animation

Reference State of Brand’s general editorial cadence:

- strong headline
- clear metadata
- short editorial sections
- visual evidence
- high information density

But create a distinct Ankur research identity.

## PAGE ARCHITECTURE

1. Sticky minimal header
   - ANKUR RESEARCH
   - “Independent Analysis”
   - share button
   - optional progress indicator

2. Hero
   - category: RESEARCH
   - headline
   - deck
   - author/date
   - independence disclosure
   - hero visual with Outlever / State of Brand relationship

3. Central system visual: Newsroom Built → Search Layer Emerging → Commercial Layer Underconnected → Opportunity

4. Newsroom and public distribution evidence section

5. Emerging search layer section

6. Cluster overlap visual

7. Proposed cluster pilot section

8. Outlever commercial architecture section

9. “Live AI visibility panel pending” section, unless direct tests have been run

10. Supporting human/machine distribution diagram

11. Search + AI Capture Layer product/module visual

12. 30-day experiment

13. Restrained CTA

14. Sources / methodology

## VISUAL COMPONENTS TO BUILD

### A. CENTRAL SYSTEM VISUAL

Make this the page's primary visual, not a Distribution-vs-Search scorecard. Use a responsive vertical flow, with clear evidence labels and source links:

**NEWSROOM BUILT / HUMAN DISTRIBUTION**  
At least 236 live State of Brand news pages observed in the sitemap/homepage union; owned-media publishing; Melissa's public LinkedIn audience. Label any impressions or readership figures as first-party claim or third-party reported.

↓

**SEARCH LAYER EMERGING**  
New owned-media guides; overlapping topic roles as an inference; 20 live homepage-linked articles absent from the sitemap at capture time. Do not imply non-indexing or poor organic performance.

↓

**COMMERCIAL LAYER UNDERCONNECTED**  
Outlever's publicly linked one-page site; no linked dedicated service/case-study destinations observed; no visible route from its homepage into State of Brand as proof. Do not imply measured conversion loss.

↓

**OPPORTUNITY — SEARCH + AI CAPTURE LAYER (HYPOTHESIS)**  
A proposed repeatable system connecting evergreen answers, newsroom stories, commercial proof, and a pending direct AI visibility panel. Show what a bounded pilot would test, not an outcome already achieved.

The first three stages describe public evidence and inference; the final stage is a proposal. Use compact source links in each stage. The flow should read clearly on mobile and in a shared screenshot.

### B. CLUSTER MAP

Create a responsive graph-like visual showing:

CURRENT  
multiple owned-media URLs  
→ overlapping intent

PROPOSED  
candidate evergreen hub  
← supporting editorial stories  
→ contextual Outlever commercial bridge

Mark canonical survivor selection, merges, and redirects as pending GSC query/page and URL-level backlink data.

Use semantic HTML/CSS/SVG.

No heavy graph library unless necessary.

### C. BEFORE / AFTER CONTENT BLOCK

Show:

Observed current page roles and overlap  
vs  
Proposed pilot content and routing

Use syntax-like editorial styling.

### D. AI QUERY TABLE

Columns:

- Prompt
- Outlever
- State of Brand
- Competitor / cited source

Status chips only after direct tests:

- Absent
- Named
- Cited
- Recommended

If tests are pending, replace the entire result table with **“Live AI visibility panel pending”** and a short method note covering engines, prompts, run context, cited URLs, and repeated-run variance. Only populate tested data.

Never invent placeholders that look like results.

### E. TWO DISTRIBUTION SYSTEMS

Human Distribution:

- LinkedIn
- newsletter
- contributors
- executives
- partnerships

Machine Distribution:

- Google
- AI retrieval
- citations
- entity/category association
- evergreen search

Show how the two systems could reinforce discovery and buyer understanding. Revenue, pipeline, and category outcomes require measurement.

### F. PROPOSED PRODUCT LAYER

Diagram:

NEWSROOM  
↓  
EDITORIAL OUTPUT  
↓  
SEARCH + AI CAPTURE LAYER (HYPOTHESIS)  
↓  
CANONICAL ASSETS  
↓  
GOOGLE + AI RETRIEVAL  
↓  
COMMERCIAL ROUTING

### G. EXPERIMENT TIMELINE

Four-week horizontal timeline.

Week 1:
Baseline

Week 2:
Rebuild cluster

Week 3:
Commercial destination

Week 4:
Re-measure

## SHAREABILITY

The page must screenshot beautifully.

Build at least 5 visual “share moments” sized roughly for:

- LinkedIn landscape screenshot
- mobile screenshot

Candidate share moments:

1. The four-stage central system visual
2. cluster diagram
3. machine vs human distribution
4. search + AI capture product layer
5. 30-day experiment

## SOCIAL METADATA

Create:

- OG title
- OG description
- Twitter card
- canonical
- favicon placeholder
- generated OG image if feasible

Suggested OG title:

> Outlever Built the Newsroom First. What Comes Next for Search?

## ANALYTICS

Add simple analytics hooks/events for:

- page view
- 25 / 50 / 75 / 100% scroll
- source clicks
- CTA click
- share click

Do not add third-party analytics credentials.

Leave environment-variable placeholders.

## SEO / TECHNICAL

Implement:

- semantic HTML
- proper H1/H2/H3
- metadata
- canonical
- OpenGraph
- Twitter metadata
- Article structured data
- Organization structured data for Ankur only
- breadcrumbs only if structurally appropriate
- accessible contrast
- keyboard support
- responsive images
- lazy loading
- print stylesheet

Do NOT mark this up as Outlever’s own Organization.

Do NOT imply affiliation.

## SOURCES

End with a clean methodology/source appendix.

Each factual claim should link to its evidence.

Use:

- direct web links
- source titles
- date accessed where relevant

Do not expose internal research notes.

## COPY

Do not rewrite final copy substantially unless:

- grammar issue
- evidence mismatch
- layout requires shortening

If evidence and copy conflict:

preserve evidence and flag the conflict in code comments / TODO.

## PERFORMANCE

Target:

- fast first render
- no unnecessary dependencies
- Lighthouse-friendly implementation
- no huge client-side bundle

## ACCESSIBILITY

- useful alt text
- no keyword-stuffed alt
- proper landmarks
- headings in correct order
- tables accessible
- respect reduced motion

## PRINT / PDF

Create print CSS so the page prints cleanly as a PDF:

- remove sticky nav
- preserve sources
- avoid broken visual blocks
- sensible page breaks
- visible URLs where useful

## FINAL DELIVERABLE

Implement the actual site.

Then return:

1. File tree
2. Build/run instructions
3. Environment variables
4. Anything still needing manual evidence
5. Screenshot checklist
6. Deployment checklist

Do not stop at a wireframe.

Do not give me pseudo-code.

Build it.
