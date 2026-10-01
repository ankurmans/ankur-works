"""Build the dated, evidence-labelled Outlever research corpus as JSONL."""

import json
import csv
from pathlib import Path

HERE = Path(__file__).parent
CAPTURED = "2026-10-01"
U = {
    "outlever": "https://www.outlever.com/",
    "state": "https://www.thestateofbrand.com/",
    "sitemap": "https://www.thestateofbrand.com/sitemap.xml",
    "definition_may": "https://www.thestateofbrand.com/news/what-is-owned-media",
    "definition_july": "https://www.thestateofbrand.com/news/what-is-owned-media-949f4",
    "definition_sep": "https://www.thestateofbrand.com/news/what-is-owned-media-b2b",
    "build_guide": "https://www.thestateofbrand.com/news/b2b-owned-media-guide",
    "operation": "https://www.thestateofbrand.com/news/Outlever-Owned-Media-Newsroom",
    "superpath": "https://www.superpath.co/blog/ama-with-melissa-rosenthal-co-founder-at-outlever",
    "robots_outlever": "https://www.outlever.com/robots.txt",
    "sitemap_outlever": "https://www.outlever.com/sitemap.xml",
    "robots_state": "https://www.thestateofbrand.com/robots.txt",
    "linkedin_outlever": "https://www.linkedin.com/company/outlever",
    "linkedin_melissa": "https://www.linkedin.com/in/melissarosenthal5",
}
objects = []


def add(kind, id, **fields):
    objects.append({"id": id, "type": kind, **fields})


def fact(id, statement, entity, source, caveat, **extra):
    add("FACT", id, statement=statement, entity=entity, source_url=U[source],
        captured_date=CAPTURED, confidence="HIGH", caveat=caveat, **extra)


def claim(id, statement, claimant, source, caveat):
    add("REPORTED_CLAIM", id, statement=statement, claimant=claimant,
        source_url=U[source], independently_verified=False, caveat=caveat)


def inference(id, statement, supports, confidence, disconfirming, caveat):
    add("INFERENCE", id, statement=statement, supporting_fact_ids=supports,
        confidence=confidence, disconfirming_evidence=disconfirming, caveat=caveat)


def hypothesis(id, statement, rationale, supports, test, success, failure):
    add("HYPOTHESIS", id, statement=statement, rationale=rationale,
        supporting_fact_ids=supports, test_required=test,
        success_signal=success, failure_signal=failure)


def unknown(id, question, why, data):
    add("UNKNOWN", id, question=question, why_it_matters=why, required_data=data)


def recommendation(id, action, rationale, supports, dependencies, risk, signal):
    add("RECOMMENDATION", id, action=action, rationale=rationale,
        supporting_fact_ids=supports, dependencies=dependencies,
        risk=risk, expected_signal=signal, not_guaranteed=True)


# Facts describe the dated capture or the content of a public page, never a measured outcome.
fact("F01", "Ankur Research's 2026-10-01 capture found 216 State of Brand news URLs in its XML sitemap and 20 additional homepage-linked news URLs that returned HTTP 200, for a minimum observed union of 236 live news URLs.", "State of Brand", "sitemap", "The union is a dated URL inventory, not readership, traffic, all historical output, or proof of indexing.", supporting_source_urls=[U["state"]], evidence_file="../../research/state_of_brand_inventory.csv")
fact("F02", "The State of Brand XML sitemap contained 220 URLs in the 2026-10-01 capture: the homepage, three category URLs, and 216 news URLs.", "State of Brand", "sitemap", "The sitemap may change; the number is a capture-time count, not a current live total.")
fact("F03", "Twenty State of Brand news URLs linked from the homepage and returning HTTP 200 were absent from the XML sitemap in the 2026-10-01 comparison, including two September 25 owned-media guides.", "State of Brand", "sitemap", "Absence from this sitemap does not establish non-indexing or absence from other discovery paths.", supporting_source_urls=[U["state"], U["definition_sep"], U["build_guide"]])
fact("F04", "State of Brand published 'What Is Owned Media in B2B? A Complete Guide' on September 25, 2026.", "State of Brand", "definition_sep", "A live guide proves that search-oriented evergreen content exists; it does not measure rankings, clicks, or AI citations.")
fact("F05", "State of Brand published 'How B2B Companies Build Owned Media That Buyers Actually Read' on September 25, 2026.", "State of Brand", "build_guide", "A live implementation guide does not establish its reach or business contribution.")
fact("F06", "The inspected Outlever commercial homepage linked to itself, a contact anchor, LinkedIn, and external biography or proof pages, but exposed no internally linked service, case-study, or State of Brand destination in the 2026-10-01 raw HTML capture.", "Outlever", "outlever", "This is a homepage-link observation; unlinked pages may exist, and user conversion was not measured.")
fact("F07", "The Outlever homepage described an owned newsroom, an ICP-led editorial engine, executive or subject-matter perspectives, and human-first distribution in the 2026-10-01 capture.", "Outlever", "outlever", "This records public offer language, not verified delivery quality or customer outcomes.")
fact("F08", "State of Brand had three self-canonical owned-media definition articles at the May, July, and September URLs inspected by Ankur Research.", "State of Brand", "definition_sep", "Related editorial subjects do not prove query cannibalisation or justify selecting a canonical survivor.", supporting_source_urls=[U["definition_may"], U["definition_july"]])
fact("F09", "The September State of Brand owned-media build guide was linked from the homepage but received no article-body incoming links within the 236-news-URL capture.", "State of Brand", "build_guide", "The count excludes other link locations, external backlinks, and pages outside the captured set; the guide is not proven orphaned.", supporting_source_urls=[U["state"]])
fact("F10", "All 236 captured State of Brand news URLs returned HTTP 200, used self-referencing canonicals, and contained NewsArticle JSON-LD; none of the captured NewsArticle objects contained an author property.", "State of Brand", "definition_sep", "This is a template observation and does not prove any ranking or AI-citation effect.", evidence_file="../../research/state_of_brand_inventory.csv")
fact("F11", "Outlever's /robots.txt returned HTTP 200 with an empty body, while its standard /sitemap.xml path returned HTTP 404 in the 2026-10-01 capture.", "Outlever", "robots_outlever", "Other sitemap locations may exist; bot access, crawling, and indexing outcomes were not measured.", supporting_source_urls=[U["sitemap_outlever"]])
fact("F12", "State of Brand's /robots.txt contained a sitemap directive and no explicit named rule for GPTBot, ClaudeBot, PerplexityBot, Googlebot, or Google-Extended in the captured file.", "State of Brand", "robots_state", "A robots file alone does not establish actual bot access or search or AI visibility.")
fact("F13", "The State of Brand owned-media definition guide appeared in one qualitative web-search sample for 'what is owned media B2B' recorded by Ankur Research.", "State of Brand", "definition_sep", "This was not a location-controlled rank tracker; rank, frequency, traffic, and visibility across variants were not measured.")
fact("F14", "Outlever's commercial homepage exposed a contact anchor in its inspected link structure.", "Outlever", "outlever", "A visible contact path does not prove conversion rate or conversion leakage.")
fact("F15", "Outlever's homepage contained Organization structured data identifying Melissa Rosenthal as a founder, while sampled State of Brand pages contained WebSite structured data naming Outlever as publisher.", "Outlever", "outlever", "This is a public entity-link observation, not a guarantee of search-engine entity understanding.", supporting_source_urls=[U["definition_sep"]])
fact("F16", "The State of Brand page about its operating model was live and publicly described State of Brand as an Outlever-run publication.", "State of Brand", "operation", "The page's operational claims about shared infrastructure and customer deployments remain first-party claims.")

claim("C01", "Outlever says its team builds and runs an ICP-focused owned content machine and applies a human-first approach to distribution.", "Outlever", "outlever", "This is Outlever's description of its offer; customer results were not independently verified.")
claim("C02", "Outlever says its AI models were trained on thousands of hours of proprietary executive interviews.", "Outlever", "outlever", "Ankur Research did not inspect the interview corpus, permissions, methodology, or training pipeline.")
claim("C03", "State of Brand says its publication runs on the same editorial engine, content technology stack, and distribution infrastructure that Outlever deploys for customers.", "State of Brand", "operation", "Ankur Research observed the public publication, not the underlying platform architecture.")
claim("C04", "State of Brand says the shared Outlever system powers more than 50 customer brand newsrooms.", "State of Brand", "operation", "No customer list, contract record, or platform audit was reviewed.")
claim("C05", "Melissa Rosenthal described person-to-person distribution and practitioner interviews as parts of Outlever's newsroom model in a public Superpath AMA.", "Melissa Rosenthal", "superpath", "This is Melissa Rosenthal's account; distribution performance was not independently measured.")
claim("C06", "Outlever's LinkedIn company profile describes Outlever as an enterprise intelligence company that builds owned-media machines.", "Outlever", "linkedin_outlever", "A company profile is positioning language; the relationship between technology and buyer-facing offer requires confirmation with Outlever.")
claim("C07", "Melissa Rosenthal said State of Brand reached 1.5 million monthly unique visitors within three months in a June 2026 Superpath AMA.", "Melissa Rosenthal", "superpath", "Ankur Research did not receive an analytics export, metric definition, date range, or independent validation; this is a first-party reported audience claim, not an audit finding.")

inference("I01", "Ankur Research infers that Outlever's commercial homepage could connect more explicitly to State of Brand as a public proof asset.", ["F06", "F16"], "MEDIUM", "Outlever may use private sales routes, direct outreach, or unlinked pages that were outside the public-page inspection.", "The missing visible homepage route does not demonstrate conversion leakage.")
inference("I02", "Ankur Research infers an editorial-role overlap among State of Brand's May, July, and September owned-media definition articles.", ["F08"], "MEDIUM", "Distinct search intents or audiences could justify all three pages; GSC query/page data was unavailable.", "Editorial overlap is not proven search cannibalisation.")
inference("I03", "Ankur Research infers that State of Brand's search-oriented evergreen layer is emerging rather than absent.", ["F04", "F05", "F13"], "HIGH", "Additional unpublished plans or existing pages could change the maturity assessment.", "The guides' measured traffic and AI citation value remain unknown.")
inference("I04", "Ankur Research infers that the 20-URL sitemap discrepancy is a publishing-feed or sitemap-coverage issue worth checking.", ["F02", "F03"], "MEDIUM", "The sitemap may have updated after capture, or the omitted pages may be intentionally excluded.", "The discrepancy is not proof of deindexing or lost traffic.")
inference("I05", "Ankur Research interprets Outlever's enterprise-intelligence language and owned-newsroom language as potentially layered positioning rather than a proven contradiction.", ["F07"], "LOW", "Outlever may define the two terms differently; a company conversation is needed.", "Do not overwrite Outlever's terminology with Ankur Research's interpretation.")

hypothesis("H01", "Ankur Research proposes a Search + AI Capture Layer that connects Outlever's existing newsroom reporting to maintained evergreen answers, buyer proof, and measured discovery.", "State of Brand already publishes current reporting and newer guides, while Outlever's inspected homepage has limited visible routes into that proof.", ["F04", "F05", "F06", "F16"], "Pilot a bounded content and measurement architecture with Outlever's cooperation; compare baseline and subsequent GSC and fixed AI-prompt observations.", "Clearer query-to-page roles and measurable discovery or qualified buyer engagement over a sufficient observation window.", "No meaningful visibility or engagement change, or proof that Outlever already runs an equivalent layer.")
hypothesis("H02", "Ankur Research proposes one maintained B2B owned-media definition hub with older State of Brand arguments given explicit supporting editorial roles.", "Three broad definition articles exist, but their search relationship is unmeasured.", ["F08"], "Review GSC query/page series and URL-level backlinks before choosing pages or changing canonicals; test contextual navigation first.", "Readers and queries find distinct pages for distinct intents without harming existing traffic.", "GSC shows distinct valuable query coverage that would be damaged by consolidation.")
hypothesis("H03", "Ankur Research proposes a dedicated Outlever category or proof page that explains the newsroom offer and links to State of Brand as a live example.", "The inspected commercial homepage has no visible internal route to the operating example.", ["F06", "F16"], "Confirm offer language, customer-proof permissions, and page ownership with Outlever before publication; measure qualified actions.", "A buyer can understand the service model and reach an appropriate next step; qualified actions are observed.", "The page confuses the offer, lacks approved proof, or fails to improve qualified actions.")
hypothesis("H04", "Ankur Research proposes a repeatable direct AI-answer panel for Outlever and State of Brand category prompts.", "Phase 1 recorded no direct ChatGPT Search, Google AI, or Perplexity answer tests.", ["F04", "F07"], "Run a fixed 15-prompt panel with engine, date, locale, account context, complete answer, brands, cited URLs, and repeated-run variance.", "A reproducible baseline exists and changes can be interpreted with variance noted.", "Results are too unstable or sparse to support a meaningful conclusion.")
hypothesis("H05", "Ankur Research proposes a four-week implementation pilot followed by a longer measurement window, rather than claiming immediate business impact.", "The public capture supports architecture questions but contains no GSC, GA4, or direct AI visibility baseline.", ["F03", "F06", "F08"], "Sequence baseline access, editorial-role review, approved page and link changes, and post-launch measurement.", "The team can implement a bounded change and observe clean early signals with known limitations.", "Missing access, rights, or baselines prevent a credible test.")

unknown("U01", "What search queries and pages currently drive impressions and clicks to Outlever and State of Brand?", "Traffic weakness and page roles cannot be established from public HTML.", "Six to twelve months of Google Search Console query/page exports for both properties.")
unknown("U02", "What are the traffic sources, repeat visits, and qualified actions for Outlever and State of Brand?", "The commercial bridge cannot be evaluated as a conversion issue without behavior data.", "GA4 or equivalent source/referral, journey, and conversion exports with definitions.")
unknown("U03", "Is Outlever or State of Brand present, cited, or recommended in direct AI answers for the fixed category prompts?", "Phase 1 did not run a direct AI visibility panel.", "Dated, location- and account-pinned repeated runs in ChatGPT Search, Google AI surfaces, and Perplexity with full answers and citations.")
unknown("U04", "Do State of Brand's three owned-media definition articles compete for the same search queries?", "Editorial subject overlap alone does not prove cannibalisation.", "GSC query/page time series, intent mapping, and controlled SERP samples.")
unknown("U05", "Which State of Brand owned-media URL, if any, should be merged, redirected, or treated as canonical?", "Changing URLs without evidence could discard existing search or link value.", "GSC query/page data, URL-level backlink exports, current indexation, and editorial purpose for each URL.")
unknown("U06", "What is the URL-level external backlink strength of the State of Brand owned-media pages?", "The capture measured article-body internal links, not backlinks.", "URL-level backlink exports for the May, July, and September definition pages and the build guide.")
unknown("U07", "Are the 20 homepage-linked State of Brand URLs missing from the captured XML sitemap indexed by Google?", "Sitemap omission does not establish indexing failure.", "Current sitemap snapshot, GSC indexing report, and URL inspections.")
unknown("U08", "Does the Outlever homepage's current route to contact lose qualified buyers?", "The page architecture was observed; buyer behavior was not.", "Defined conversion events, funnel paths, qualitative buyer feedback, and baseline conversion data.")
unknown("U09", "Which claimed audience, impression, subscriber, and customer-newsroom numbers can Outlever independently substantiate?", "Public first-party or third-party statements do not substitute for data access.", "Dated analytics exports, metric definitions, customer list or audit permissions, and claimant approval for public wording.")
unknown("U10", "What parts of search discovery, AI visibility, and evergreen content architecture does Outlever already run internally?", "A public-page gap does not prove a capability gap.", "Outlever process interview, internal page map, measurement stack, and operating documentation.")
unknown("U11", "What rights and privacy constraints apply to using Outlever's executive interview corpus or customer newsroom data as original research?", "The underlying datasets were not inspected and may contain confidential material.", "Access permissions, data inventory, consent, anonymization method, and legal/editorial review.")
unknown("U12", "What qualified leads, opportunities, or revenue can be attributed to Outlever and State of Brand content?", "Phase 1 had no CRM or conversion export and cannot establish commercial leakage or revenue impact.", "Defined CRM stages, consented attribution data, conversion events, and a dated baseline.")

recommendation("R01", "Request read access to Outlever and State of Brand Google Search Console before changing the owned-media URL hierarchy.", "Query/page evidence is needed to distinguish editorial overlap from search competition.", ["F08"], ["Outlever permission", "GSC access"], "Without access, the recommendation cannot justify redirects or canonical changes.", "A dated baseline for each overlapping page and its query set.")
recommendation("R02", "Request GA4 or equivalent journey and referral data before describing the commercial route as conversion leakage.", "The inspected Outlever homepage lacks some visible routes, but no user behavior was measured.", ["F06", "F14"], ["Outlever permission", "analytics definitions"], "Weak or missing instrumentation could misstate buyer behavior.", "A documented baseline of sources, journeys, and qualified actions.")
recommendation("R03", "Check State of Brand's sitemap feed against the 20 live homepage-linked URLs from the October 1 capture.", "The captured XML sitemap omitted live pages, including two new guides.", ["F02", "F03"], ["Current sitemap", "publishing-system owner"], "A changed sitemap could make the historical defect obsolete.", "The current sitemap either includes the URLs or has a documented exclusion rule.")
recommendation("R04", "Map explicit editorial jobs for the State of Brand owned-media definition pages and implementation guide before altering any URLs.", "The pages cover related subjects but may serve distinct readers and queries.", ["F04", "F05", "F08"], ["GSC review", "editorial review", "URL-level backlinks"], "Premature consolidation could harm useful coverage and links.", "A documented primary/secondary intent and maintenance owner for each page.")
recommendation("R05", "Prototype one approved Outlever category or proof destination and a clear route to the State of Brand operating example.", "The operating example exists but was not visibly linked from the inspected Outlever homepage.", ["F06", "F16"], ["Outlever review", "proof permissions", "page owner"], "A draft could misrepresent Outlever's offer or imply unverified customer results.", "Usable buyer explanation and trackable qualified actions after launch.")
recommendation("R06", "Run the fixed direct AI visibility prompt panel before claiming an AI citation problem or improvement.", "Phase 1 did not collect direct AI-answer evidence.", ["F04", "F07"], ["Engine access", "fixed prompts", "locale and date recording"], "Answer variance and personalization may limit comparability.", "An auditable baseline of named brands and cited URLs across repeated runs.")
recommendation("R07", "Preserve the distinction between Outlever claims, observed State of Brand pages, Ankur Research interpretations, and proposed tests in every assistant answer.", "The public evidence spans different provenance levels.", ["F01", "F07", "F16"], ["Corpus type labels", "answer citation checks"], "A fluent assistant may otherwise turn a hypothesis into an asserted deficiency.", "Answers name provenance and abstain when the required data is absent.")
recommendation("R08", "Ask Outlever before publishing customer-proof details or product claims beyond its public wording.", "The underlying customer platform and reported deployment count were not audited.", ["F16"], ["Outlever approval", "permissioned examples"], "Unapproved proof could be inaccurate or commercially sensitive.", "Approved, scoped examples with dates and source trails.")


def qa(kind, id, question, answer, ids, caveat):
    add(kind, id, question=question, answer=answer,
        supporting_object_ids=ids, caveat=caveat)


# Each answer is a retrieval-safe starting point, not an instruction to invent beyond the IDs.
qa("FAQ", "FAQ01", "What is Outlever?", "Outlever publicly describes a B2B owned-newsroom and editorial-engine offer built around ideal customer profiles, executive perspectives, and human distribution. That is Outlever's offer language; Ankur Research did not audit customer delivery or outcomes.", ["F07", "C01"], "Describe the offer as Outlever's public account, not an independently verified performance claim.")
qa("FAQ", "FAQ02", "What is State of Brand?", "State of Brand is a live publication that Outlever says it runs on the same infrastructure it deploys for customers. Ankur Research observed at least 236 live State of Brand news URLs in the October 1, 2026 public capture, but did not inspect the underlying platform.", ["F01", "F16", "C03"], "The page inventory is not a readership measure.")
qa("FAQ", "FAQ03", "What did Ankur Research audit?", "Ankur Research inspected public Outlever and State of Brand pages, sitemap and robots endpoints, URL metadata, internal article links, and a qualitative web-search sample on October 1, 2026. The audit did not receive Google Search Console or GA4 data and did not run direct AI-answer tests.", ["F01", "F06", "F10", "U01", "U02", "U03"], "The audit is a dated public-surface assessment, not a private analytics audit.")
qa("FAQ", "FAQ04", "Does the audit show weak organic traffic for Outlever or State of Brand?", "No. Ankur Research had no Google Search Console query/page data and no GA4 traffic data. A State of Brand B2B owned-media guide appeared in one qualitative web-search sample, which also rules out a blanket claim of absence.", ["U01", "U02", "F13"], "Do not infer traffic volume or trend from page architecture or one search sample.")
qa("FAQ", "FAQ05", "Does the audit show that AI systems do not cite Outlever?", "No. Phase 1 did not capture direct ChatGPT Search, Google AI, or Perplexity answers for Outlever or State of Brand. Ankur Research proposes a fixed, repeated prompt panel to establish a baseline.", ["U03", "H04"], "Do not label AI citation weakness as observed.")
qa("FAQ", "FAQ06", "Why do the State of Brand owned-media pages matter?", "State of Brand has May, July, and September articles that all define owned media, plus a September implementation guide. Ankur Research sees an editorial-role question, but cannot say those pages compete in search without Google Search Console query/page data and URL-level backlinks.", ["F04", "F05", "F08", "I02", "U04", "U06"], "Do not recommend a redirect or canonical survivor from the public capture alone.")
qa("FAQ", "FAQ07", "What is the proposed commercial bridge?", "Ankur Research proposes a clearer route from State of Brand's live newsroom and guides to a reviewed Outlever category or proof page. The inspected Outlever homepage did not visibly link to State of Brand; no conversion leakage was measured.", ["F06", "F16", "H03"], "The page concept requires Outlever review and measurement.")
qa("FAQ", "FAQ08", "What is the Search + AI Capture Layer?", "The Search + AI Capture Layer is Ankur Research's hypothesis: map durable buyer questions, assign maintained evergreen pages, connect timely reporting to those pages and commercial proof, then measure search and direct AI-answer visibility. It is not a claim that Outlever lacks an internal equivalent.", ["H01", "U10"], "Treat the layer as a pilot proposal, not an established capability gap or proven outcome.")
qa("FAQ", "FAQ09", "What is the first pilot?", "Ankur Research proposes a bounded pilot: establish Google Search Console, analytics, backlink, and AI-answer baselines; clarify one owned-media content cluster; prototype one Outlever proof destination with approval; then observe early signals and continue measurement beyond four weeks.", ["H05", "R01", "R02", "R04", "R05", "R06"], "Four weeks is an implementation frame, not enough by itself to promise traffic or pipeline change.")
qa("FAQ", "FAQ10", "What are the audit's most important limitations?", "Ankur Research lacked Google Search Console, GA4, direct AI-answer tests, and URL-level backlink exports. Traffic weakness, AI citation weakness, cannibalisation, redirect targets, conversion leakage, and backlink strength remain unproven.", ["U01", "U02", "U03", "U04", "U05", "U06", "U08"], "State these limitations before interpreting the public-page findings.")

qa("MELISSA_QUESTION", "MQ01", "Melissa Rosenthal: Are you saying Outlever has no search strategy?", "No. State of Brand already published two owned-media evergreen guides in September 2026. Ankur Research proposes testing how those guides connect to reporting and commercial proof; Outlever's internal process is unknown.", ["F04", "F05", "I03", "U10"], "Do not turn an observed public architecture opportunity into a claim about Outlever's internal capability.")
qa("MELISSA_QUESTION", "MQ02", "Melissa Rosenthal: Why did Ankur Research call State of Brand a real newsroom?", "The October 1 capture found at least 236 live State of Brand news URLs and recent publishing. State of Brand also publicly describes its editorial operating model. The URL count establishes output, not reader loyalty, quality, or business impact.", ["F01", "F16", "C03"], "The shared platform description remains State of Brand's claim.")
qa("MELISSA_QUESTION", "MQ03", "Melissa Rosenthal: What is missing from Outlever's public site specifically?", "In the captured Outlever homepage HTML, Ankur Research found no visible internal link to State of Brand and no linked service or case-study destination beyond the homepage and contact route. Unlinked pages and private sales paths may exist.", ["F06", "F14", "I01"], "This is a narrow homepage-link observation, not a complete site or sales audit.")
qa("MELISSA_QUESTION", "MQ04", "Melissa Rosenthal: Why should Outlever connect its newsroom to a buyer page?", "Ankur Research's hypothesis is that a reviewed buyer page could explain the newsroom model and make State of Brand usable as public proof. Outlever's conversion data and buyer interviews would determine whether the bridge addresses a real problem.", ["H03", "U02", "U08"], "Do not promise conversion lift.")
qa("MELISSA_QUESTION", "MQ05", "Melissa Rosenthal: Are you proposing to redirect State of Brand articles?", "No redirect is selected. The May, July, and September definition pages have related subjects, but Google Search Console and URL-level backlink data are needed before any merge, canonical, or redirect decision.", ["F08", "U04", "U05", "U06", "R04"], "Editorial roles may be clarified without changing URLs.")
qa("MELISSA_QUESTION", "MQ06", "Melissa Rosenthal: Did you measure Outlever's AI visibility?", "No. Phase 1 did not run direct ChatGPT Search, Google AI, or Perplexity tests. Ankur Research specified a 15-prompt panel with repeated, dated captures as a proposed measurement step.", ["U03", "H04", "R06"], "A web-search sample is not an AI-answer test.")
qa("MELISSA_QUESTION", "MQ07", "Melissa Rosenthal: What data would make this audit stronger?", "The most useful additions are Outlever and State of Brand Google Search Console query/page exports, GA4 or equivalent journey data, URL-level backlinks for overlapping pages, a direct AI-answer prompt panel, and approved customer-proof details.", ["U01", "U02", "U03", "U06", "U09"], "Permissions and metric definitions are needed before public interpretation.")
qa("MELISSA_QUESTION", "MQ08", "Melissa Rosenthal: What would a bounded Outlever pilot change first?", "Ankur Research would baseline the data, map the owned-media cluster's editorial jobs, fix or explain the sitemap discrepancy, and draft a reviewed Outlever proof destination. Existing article URLs would remain until evidence justified a change.", ["H05", "R01", "R03", "R04", "R05"], "The sequence is proposed, not an Outlever-approved roadmap.")
qa("MELISSA_QUESTION", "MQ09", "Melissa Rosenthal: Are reported audience or customer counts being used as verified proof?", "No. Outlever and State of Brand have made public scale claims, including more than 50 customer newsrooms, but Ankur Research did not review analytics exports or customer records. Such figures must remain attributed claims.", ["C04", "U09"], "Do not equate public claims with an independent audit.")
qa("MELISSA_QUESTION", "MQ10", "Melissa Rosenthal: How would Ankur Research avoid turning our editorial operation into SEO content?", "The proposed layer gives durable buyer questions maintained answer pages while State of Brand's reporting remains the source of examples and new evidence. Outlever should review editorial ownership and voice before any pilot content is published.", ["H01", "R04", "U10"], "This is an architecture hypothesis, not a prescribed editorial policy for Outlever.")

qa("SCEPTICAL_QUESTION", "SQ01", "Is Ankur Research calling Outlever's traffic weak without access to analytics?", "No. Ankur Research had no Google Search Console or GA4 data, so Outlever and State of Brand traffic strength remains unknown. The audit limits itself to public page and sitemap observations.", ["U01", "U02", "F06"], "Reject any answer that turns a thin page map into a traffic verdict.")
qa("SCEPTICAL_QUESTION", "SQ02", "Is the 236-page State of Brand number just a vanity metric?", "The 236 figure is a minimum count of live news URLs in a dated sitemap/homepage union. It supports the narrow conclusion that substantial publishing output exists; it says nothing about readership, engagement, or revenue.", ["F01"], "Never present URL inventory as audience size.")
qa("SCEPTICAL_QUESTION", "SQ03", "How can Ankur Research claim a sitemap defect if the pages might be indexed anyway?", "The observed defect is narrower: 20 live homepage-linked State of Brand news URLs were absent from the XML sitemap at capture time. Google may still discover them through links or other routes; indexation was not checked.", ["F03", "U07"], "Do not infer deindexing or lost traffic.")
qa("SCEPTICAL_QUESTION", "SQ04", "Is the Search + AI Capture Layer a solution looking for a problem?", "Possibly. Ankur Research labels the layer as a hypothesis because Outlever may already do parts of it internally and public data do not show a discovery deficit. A bounded pilot and Outlever process review are meant to test whether the layer adds value.", ["H01", "U10"], "Do not claim an internal capability gap.")
qa("SCEPTICAL_QUESTION", "SQ05", "Do the owned-media articles really cannibalize one another?", "That is unproven. The May, July, and September State of Brand articles overlap in subject, but query/page impressions, rankings, and URL-level backlinks were unavailable. Editorial-role overlap is an inference, not measured cannibalisation.", ["F08", "I02", "U04", "U06"], "No redirect or canonical survivor follows from this evidence.")
qa("SCEPTICAL_QUESTION", "SQ06", "Does a missing State of Brand link on the Outlever homepage prove conversion leakage?", "No. The missing visible route is an observation about the inspected homepage. Ankur Research had no funnel or conversion data and did not inspect every private or unlinked buyer journey.", ["F06", "U08"], "Do not attach a conversion outcome to a link-map finding.")
qa("SCEPTICAL_QUESTION", "SQ07", "Has Ankur Research proved Outlever is absent from ChatGPT or Perplexity answers?", "No. Phase 1 contained no direct AI-answer captures. The proposed prompt panel would establish a baseline, including answer variance, before making any presence or citation claim.", ["U03", "H04"], "Search-engine snippets are not direct AI-answer evidence.")
qa("SCEPTICAL_QUESTION", "SQ08", "Why trust Outlever's reported 50-plus customer newsrooms?", "The figure is State of Brand's first-party statement about Outlever. Ankur Research did not inspect customer records or the platform, so the number is attributed, not independently verified.", ["C04", "U09"], "Keep claimant and caveat beside the figure.")
qa("SCEPTICAL_QUESTION", "SQ09", "Is Ankur Research just repackaging Outlever's existing guides?", "The public State of Brand guides already exist, so Ankur Research does not claim to have invented that layer. The proposed test concerns roles, links from timely reporting, a commercial proof destination, and measured discovery.", ["F04", "F05", "H01"], "Treat novelty and incremental impact as questions to test.")
qa("SCEPTICAL_QUESTION", "SQ10", "Could the proposed four-week pilot prove commercial impact?", "No. Four weeks can establish baselines and implement a bounded change, but commercial and search outcomes may require longer observation. The pilot has explicit failure signals and no guaranteed result.", ["H05"], "Do not sell an implementation window as an outcome guarantee.")

qa("IMPLEMENTATION_QUESTION", "IQ01", "What would Ankur Research do first for the Outlever pilot?", "First, obtain Outlever and State of Brand Google Search Console query/page access, GA4 or equivalent source and journey data, and URL-level backlinks for the overlapping owned-media pages. Record baselines before choosing a URL or writing a new page.", ["R01", "R02", "U06"], "If access is denied, limit work to a public-surface prototype and retain uncertainty.")
qa("IMPLEMENTATION_QUESTION", "IQ02", "How would Ankur Research choose a State of Brand evergreen hub?", "Compare the May, July, and September definition pages using query/page series, intent, existing links, and editorial purpose. Assign roles only after that review; no current URL has been selected as a canonical survivor.", ["F08", "U04", "U05", "R04"], "Do not choose by publication date alone.")
qa("IMPLEMENTATION_QUESTION", "IQ03", "How would Ankur Research handle the missing State of Brand sitemap URLs?", "Re-fetch the current sitemap and homepage, reproduce the 20-URL comparison, ask the publishing-system owner whether exclusions are intentional, then fix the generation feed or document the rule. Confirm Google index state separately.", ["F03", "U07", "R03"], "The historical comparison may have changed since October 1, 2026.")
qa("IMPLEMENTATION_QUESTION", "IQ04", "What would go on the proposed Outlever buyer page first?", "A reviewed explanation of Outlever's newsroom model, what Outlever runs, how reporting and distribution work, State of Brand as a public operating example, and a clear next step. Product scope and proof need Outlever approval before publication.", ["F07", "F16", "H03", "R05"], "This is a page architecture concept, not approved Outlever copy.")
qa("IMPLEMENTATION_QUESTION", "IQ05", "How would Ankur Research link State of Brand reporting to evergreen guides?", "Map relevant news stories to the durable question each guide answers, then add contextual links where they help readers. Keep news coverage editorially independent and measure navigation rather than assuming search uplift.", ["F04", "F05", "H01", "R04"], "The link pattern is a proposed test, not a proven ranking tactic.")
qa("IMPLEMENTATION_QUESTION", "IQ06", "How would Ankur Research test AI visibility for Outlever?", "Run the fixed 15-prompt panel in direct ChatGPT Search, Google AI surfaces, and Perplexity where available. Save exact prompts, answers, brands, cited URLs, engine, date, locale, account context, and repeat-run variance.", ["H04", "R06"], "A single answer cannot establish stable citation share.")
qa("IMPLEMENTATION_QUESTION", "IQ07", "What would Ankur Research measure after the pilot ships?", "Track query-to-page mapping and impressions in Google Search Console, qualified actions in an agreed analytics system, current sitemap coverage, and repeated AI-answer panel results. Compare with dated baselines and continue beyond four weeks.", ["H05", "R01", "R02", "R03", "R06"], "Early observations do not prove causality or guaranteed pipeline.")
qa("IMPLEMENTATION_QUESTION", "IQ08", "When would Ankur Research redirect an overlapping State of Brand page?", "Only after reviewing Google Search Console query/page performance, URL-level backlinks, index state, editorial purpose, and an agreed destination. The Phase 1 public capture supports no redirect decision.", ["U04", "U05", "U06", "R04"], "Redirect targets and backlink strength are currently unknown.")
qa("IMPLEMENTATION_QUESTION", "IQ09", "How would Ankur Research validate Outlever customer proof?", "Ask Outlever for permissioned examples, exact customer and metric definitions, source records, dates, and publication approval. Until then, customer-newsroom scale statements remain attributed first-party claims.", ["C04", "U09", "R08"], "Do not imply that Ankur Research inspected customer accounts or platform operations.")
qa("IMPLEMENTATION_QUESTION", "IQ10", "What would stop the Outlever pilot from proceeding?", "The pilot should pause before public changes if Outlever has not approved offer wording or proof, if baseline data needed for URL decisions is missing, or if rights to interview and customer data are unresolved. A public-surface prototype can still be reviewed without claiming outcomes.", ["H05", "U10", "U11", "R05", "R08"], "A lack of access is an evidence limit, not a reason to invent results.")


REQUIRED = {
    "FACT": {"statement", "entity", "source_url", "captured_date", "confidence", "caveat"},
    "REPORTED_CLAIM": {"statement", "claimant", "source_url", "independently_verified", "caveat"},
    "INFERENCE": {"statement", "supporting_fact_ids", "confidence", "disconfirming_evidence", "caveat"},
    "HYPOTHESIS": {"statement", "rationale", "supporting_fact_ids", "test_required", "success_signal", "failure_signal"},
    "UNKNOWN": {"question", "why_it_matters", "required_data"},
    "RECOMMENDATION": {"action", "rationale", "supporting_fact_ids", "dependencies", "risk", "expected_signal", "not_guaranteed"},
    "FAQ": {"question", "answer", "supporting_object_ids", "caveat"},
    "MELISSA_QUESTION": {"question", "answer", "supporting_object_ids", "caveat"},
    "SCEPTICAL_QUESTION": {"question", "answer", "supporting_object_ids", "caveat"},
    "IMPLEMENTATION_QUESTION": {"question", "answer", "supporting_object_ids", "caveat"},
}
ids = {item["id"] for item in objects}
assert len(ids) == len(objects), "Duplicate IDs"
with (HERE / "../../research/state_of_brand_inventory.csv").open(newline="") as inventory_file:
    news_rows = [row for row in csv.DictReader(inventory_file) if "/news/" in row["url"]]
assert len(news_rows) == 236
assert sum(row["in_sitemap"] == "True" for row in news_rows) == 216
assert sum(row["in_sitemap"] == "False" for row in news_rows) == 20
for item in objects:
    assert REQUIRED[item["type"]] <= item.keys(), item["id"]
    assert all(ref in ids for ref in item.get("supporting_fact_ids", []) + item.get("supporting_object_ids", [])), item["id"]
    assert all(ref.startswith("F") for ref in item.get("supporting_fact_ids", [])), item["id"]
    assert len(json.dumps(item).split()) <= 300, item["id"]
    if item["type"] == "FACT":
        assert item["confidence"] == "HIGH"
    if item["type"] == "REPORTED_CLAIM":
        assert item["independently_verified"] is False
    if item["type"] == "RECOMMENDATION":
        assert item["not_guaranteed"] is True
for kind in ("FAQ", "MELISSA_QUESTION", "SCEPTICAL_QUESTION", "IMPLEMENTATION_QUESTION"):
    assert sum(item["type"] == kind for item in objects) == 10, kind

output = HERE / "research-corpus.jsonl"
output.write_text("\n".join(json.dumps(item, ensure_ascii=False) for item in objects) + "\n")
print(f"Wrote {len(objects)} objects to {output}")
