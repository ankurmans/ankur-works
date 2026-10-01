// This is the page map for the prospect assistant. It explains what this site
// itself says; the dated evidence brief remains the authority for external
// company claims and for the boundaries on those claims.
export const OUTLEVER_SITE_CONTEXT = {
  site_id: "outlever",
  site_url: "https://outlever.ankur.works/",
  subject_company: "Outlever",
  related_publication: "State of Brand",
  author: "Ankur Research",
  independence: "Independent analysis; not affiliated with Outlever or State of Brand and not speaking for Melissa Rosenthal.",
  sections: [
    { id: "top", topic: "The opening thesis", page_says: "State of Brand demonstrates a live newsroom model. Ankur Research proposes testing whether durable search answers, AI retrieval, and buyer routing could become another output." },
    { id: "system", topic: "The existing machine", page_says: "The page separates Outlever's public newsroom model from the proposed Search + AI Capture Layer." },
    { id: "newsroom", topic: "Public assets", page_says: "The page points to the State of Brand newsroom, Outlever's reported people-led model, and a possible route connecting proof to a buyer destination." },
    { id: "cluster", topic: "Owned-media cluster", page_says: "Four State of Brand owned-media pages cover related definitions and implementation questions. The page raises editorial roles to investigate, without claiming search cannibalisation." },
    { id: "hub", topic: "Evergreen hub", page_says: "A maintained definition page is a content concept, not a published State of Brand page or a chosen redirect target." },
    { id: "commercial", topic: "Buyer route", page_says: "A buyer-facing Outlever destination that links to State of Brand proof is proposed. The page does not claim measured conversion leakage." },
    { id: "ai", topic: "Direct AI visibility", page_says: "The direct AI-answer panel was prepared but not run in Phase 1; there is no visibility result to report." },
    { id: "layer", topic: "Search + AI Capture Layer", page_says: "The proposed capability maps buyer questions, maintains evergreen hubs, routes reporting, connects commercial proof, and measures search and AI answers." },
    { id: "experiment", topic: "Four-week pilot", page_says: "A bounded pilot proposes baselines, one hub, one proof route, and early implementation and answer checks. Outcomes require longer measurement." },
    { id: "ask", topic: "Question the work", page_says: "The research assistant lets readers inspect observations, reports, inferences, hypotheses, and unknowns. General questions about Ankur's own work go to his AI Twin." },
    { id: "method", topic: "Source notes", page_says: "The methodology and source section explains the dated public capture, citations, caveats, and missing private data." },
  ],
} as const;
