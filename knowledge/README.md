# AI Twin knowledge

`approved-claims.json` holds public claims that need precise scope. The knowledge generator requires every approved claim's exact excerpt and numeric `value` to appear in the matching section of `index.html` before it includes the claim. That keeps an answer and its visible citation aligned. The rest of the knowledge base is generated from the site's published copy. `required_answer_terms` must stay in any generated answer using the claim's value; `excluded_query_terms` prevents the claim from answering a question about a different metric or scope.

`personal-stories.json` is the chat-only RAG source for Ankur-provided personal answers. The completed answers he supplied on 2026-10-01 have been condensed into narrow records; the unanswered pronunciation placeholder and topics without a concrete answer were omitted. Each entry has a unique `personal-...` id, title, first-person factual text, query topics, provenance, `visibility: "chatbot"`, and `approved: true`. These records have no public page link and never change the site's mailto flow. Do not infer a Ryan Reynolds role from a vague mention.

`seo-ai-search-pack/` preserves the Ankur-provided Markdown source. The generator retrieves the public operating frameworks in files 01–04 for chat and voice. File 00 informs response behaviour, file 06 informs tone and examples, and file 05 remains an engineering extraction spec. `search-observations.json` contains separately scoped, approved Pepys PostHog proof for chatbot answers. Its private dashboard URLs establish provenance but are not shown as public source links. Observed referral sessions, product events, GSC clicks, AI citations, and revenue are distinct measures.

The generator also reads the published main content of `/product-development/` and `/seo-ai-search/` in this checkout. It creates citable section records and omits pricing language. The chatbot can recommend the relevant offer and link to its page; the ordinary site CTAs stay mailto and the Cal.com link stays inside chat.

The commerce result is a founder-stated claim about **combined USD revenue for two brands over two years**. It is not annual revenue, profit, GMV, or a per-brand result. Exact calendar dates and a supporting case study have not been supplied. The claim is public because Ankur authorized it for the site and chat; it is not labeled independently verified.

For each future Pepys or QuoteSweep metric, collect the entity, metric definition, unit, time window, comparison baseline, data source and query, date checked, public wording, and caveats. Get Ankur's approval for public use, put the exact wording on a citable page section, then add the scoped claim here. Drafts and unverified figures stay out of this file and out of model context.

Run `npm test` after changing site copy or claims. The pretest step regenerates `api/assistant-knowledge.json` and fails if a claim no longer matches its source.
