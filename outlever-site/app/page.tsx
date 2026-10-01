import Image from "next/image";
import { ShareButton } from "./Interactions";
import { ResearchAssistant } from "./ResearchAssistant";
import { SourceRefs } from "./SourceRefs";
import { aiPrompts, sourceMap, type SourceId } from "./data";

const sources = (Object.entries(sourceMap) as [SourceId, (typeof sourceMap)[SourceId]][])
  .sort(([a], [b]) => Number(a) - Number(b));

const articles: { id: SourceId; date: string; title: string; role: string; overlap: string }[] = [
  { id: "06", date: "05 MAY", title: "What Is Owned Media, and Why Is It the Only Channel That Compounds", role: "Editorial argument", overlap: "Broad definition" },
  { id: "07", date: "23 JUL", title: "What Is Owned Media? Inside the Strategy Replacing the B2B Blog", role: "Category POV", overlap: "Broad definition" },
  { id: "03", date: "25 SEP", title: "What Is Owned Media in B2B? A Complete Guide", role: "Durable definition", overlap: "Definition guide" },
  { id: "04", date: "25 SEP", title: "How B2B Companies Build Owned Media That Buyers Actually Read", role: "Implementation guide", overlap: "Related topic" },
];

function Label({ number, children }: { number: string; children: React.ReactNode }) {
  return <p className="fn-label"><span>{number}</span>{children}</p>;
}

function ConceptIcon({ kind }: { kind: "newsroom" | "answer" | "proof" | "route" }) {
  const paths = {
    newsroom: <><rect x="3" y="5" width="26" height="22" /><path d="M9 11h14M9 16h14M9 21h9" /></>,
    answer: <><path d="M5 8h22v14H14l-6 5v-5H5z" /><path d="M10 13h12M10 17h8" /></>,
    proof: <><rect x="4" y="4" width="24" height="24" /><path d="m9 16 5 5 9-11" /></>,
    route: <><circle cx="7" cy="25" r="3" /><circle cx="25" cy="7" r="3" /><path d="M10 25h6v-9h9v-6" /></>,
  };
  return <svg className="fn-concept-icon" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[kind]}</svg>;
}

function SectionHead({ number, eyebrow, title, accent, intro, id }: {
  number: string; eyebrow: string; title: string; accent?: string; intro?: React.ReactNode; id: string;
}) {
  return <div className="fn-section-head"><Label number={number}>{eyebrow}</Label><div><h2 id={id}>{title}{accent && <> <em>{accent}</em></>}</h2>{intro && <p>{intro}</p>}</div></div>;
}

export default function HomePage() {
  return (
    <>
      <header className="site-header">
        <div className="header-inner wide-wrap">
          <a className="brand" href="#top" aria-label="Ankur Research, back to top"><span className="brand-name">ANKUR <em>/</em> RESEARCH</span></a>
          <nav className="main-nav" aria-label="Main navigation">
            <a href="#system">The finding</a><a href="#hub">The concept</a><a href="#layer">The layer</a><a href="#ask">Ask the analysis</a>
          </nav>
          <ShareButton compact />
        </div>
      </header>

      <main id="top" className="field-note">
        <section className="fn-hero wide-wrap" aria-labelledby="hero-title">
          <div className="fn-hero-copy">
            <p className="fn-overline">AN INDEPENDENT LOOK AT THE OUTLEVER MACHINE</p>
            <h1 id="hero-title">You built the<br /><em>media machine.</em></h1>
            <h2 className="fn-hero-continuation">We think there&apos;s another layer hiding underneath it.</h2>
            <p className="fn-deck">State of Brand already proves the newsroom model operates in public. We mapped how durable search, AI retrieval, and commercial routing could become another output from the system. <SourceRefs ids={["01", "02", "03", "04", "09"]} /></p>
            <div className="fn-hero-actions"><a href="#system">See the machine <span aria-hidden="true">↘</span></a><a href="#layer">Explore the layer <span aria-hidden="true">↗</span></a></div>
            <p className="fn-byline">BY ANKUR SHRESTHA <span>•</span> <time dateTime="2026-10-01">01 OCTOBER 2026</time> <span>•</span> EVIDENCE-LED FIELD NOTE</p>
            <p className="fn-disclosure">Independent analysis by Ankur. Not affiliated with Outlever or State of Brand.</p>
          </div>
          <aside className="fn-hero-panel" aria-label="Outlever research subject">
            <div className="fn-panel-top"><span>FIELD NOTE / 01</span><span>INDEPENDENT ANALYSIS</span></div>
            <div className="fn-panel-logo"><span>THE SUBJECT</span><Image src="/outlever-logo.svg" width={275} height={49} alt="Outlever logo" unoptimized /><span>THE NEWSROOM IS THE ASSET</span></div>
            <div className="fn-panel-bottom"><span>THE PUBLIC STORY</span><strong>BUILT<span>.</span></strong><span>THE NEXT LAYER IS A QUESTION WORTH TESTING.</span></div>
          </aside>
        </section>

        <section className="fn-proof" aria-label="Four findings at a glance">
          <div className="wide-wrap fn-proof-grid">
            <div><span>FOUND / PUBLISHING</span><strong>236<span>+</span></strong><b>LIVE NEWSROOM PAGES</b><p>The publishing engine exists. <SourceRefs ids={["02", "08"]} /></p></div>
            <div><span>FOUND / SITEMAP</span><strong>20</strong><b>LIVE PAGES</b><p>Outside the sitemap at capture. <SourceRefs ids={["02", "08"]} /></p></div>
            <div className="fn-proof-word"><span>FOUND / LIVE EXAMPLE</span><strong>STATE<br />OF BRAND</strong><b>PUBLIC PROOF</b><p>The newsroom model operates in public. <SourceRefs ids={["02", "09"]} /></p></div>
            <div><span>WE&apos;D TEST / ROUTE</span><strong>1</strong><b>CONNECTION TO TEST</b><p>Newsroom → answer → buyer.</p></div>
          </div>
          <p className="wide-wrap fn-proof-thesis">The newsroom already works. <em>The next output could be durable discovery.</em></p>
          <details className="wide-wrap fn-compact-detail"><summary>What these numbers do and do not show <span>+</span></summary><p>These are dated page and sitemap counts, not traffic, indexing, readership, or conversion measures. The reader route is a proposal, not observed user behavior. <SourceRefs ids={["01", "02", "08"]} /></p></details>
        </section>

        <section id="system" className="fn-section wide-wrap" aria-labelledby="system-title">
          <SectionHead number="01" eyebrow="THE SYSTEM" id="system-title" title="THE NEWSROOM" accent="ALREADY WORKS." intro="Outlever's public model starts with people, perspective, and a publishing engine. The proposed discovery layer attaches to that engine." />
          <div className="fn-machine" aria-label="Existing newsroom machine and proposed search and AI extension">
            <div className="fn-machine-track fn-machine-existing"><div className="fn-machine-track-head"><span>FOUND / OUTLEVER&apos;S PUBLIC MODEL</span><strong>THE EXISTING MACHINE</strong></div><ol><li><span>01</span><strong>ICPs</strong><small>The people in the story</small></li><li><span>02</span><strong>INTERVIEWS + PERSPECTIVES</strong><small>Reporting and real takes</small></li><li><span>03</span><strong>NEWSROOM</strong><small>State of Brand in public</small></li><li><span>04</span><strong>HUMAN DISTRIBUTION</strong><small>People carry the story</small></li></ol><div className="fn-machine-sources"><SourceRefs ids={["01", "02", "05", "09"]} /></div></div>
            <div className="fn-machine-join" aria-hidden="true"><span>+</span></div>
            <div className="fn-machine-track fn-machine-new"><div className="fn-machine-track-head"><span>WE&apos;D TEST / EXTENSION</span><strong>ANOTHER OUTPUT</strong></div><ol><li><span>01</span><strong>NEWSROOM</strong><small>Existing reporting engine</small></li><li className="fn-machine-focus"><span>02</span><strong>SEARCH + AI CAPTURE</strong><small>Proposed product layer</small></li><li><span>03</span><strong>EVERGREEN ANSWERS</strong><small>Maintained and routed</small></li><li><span>04</span><strong>GOOGLE + AI RETRIEVAL</strong><small>To be measured</small></li><li><span>05</span><strong>COMMERCIAL ROUTING</strong><small>Proof meets buyer</small></li></ol><a href="#layer">INSPECT THE HYPOTHESIS ↗</a></div>
          </div>
          <details className="fn-compact-detail"><summary>Why we&apos;re saying this <span>+</span></summary><p>The left track combines a live publishing inventory with Outlever&apos;s first-party model. The right track is Ankur&apos;s proposed extension. Arrows show architecture, not measured traffic or revenue. <SourceRefs ids={["01", "02", "05", "08", "09"]} /></p></details>
        </section>

        <section id="newsroom" className="fn-section fn-section-tint" aria-labelledby="works-title">
          <div className="wide-wrap">
            <SectionHead number="02" eyebrow="THE ASSETS" id="works-title" title="YOU BUILT" accent="THE HARD PART." intro="Four parts of the public system are already in view." />
            <div className="fn-works-grid">
              <article><span>FOUND</span><ConceptIcon kind="newsroom" /><h3>THE NEWSROOM</h3><strong>236+ live pages.</strong><p>You built the hard part. <SourceRefs ids={["02", "08"]} /></p></article>
              <article><span>REPORTED MODEL</span><ConceptIcon kind="answer" /><h3>THE PEOPLE</h3><strong>Human distribution.</strong><p>Interviews and perspectives carry the stories. <SourceRefs ids={["01", "05"]} /></p></article>
              <article><span>FOUND</span><ConceptIcon kind="proof" /><h3>THE PROOF</h3><strong>State of Brand.</strong><p>The newsroom operates in public. <SourceRefs ids={["02", "09"]} /></p></article>
              <article><span>INFERRED</span><ConceptIcon kind="route" /><h3>THE ROUTE</h3><strong>One link to make.</strong><p>Connect the proof to a buyer destination. <SourceRefs ids={["01", "09"]} /></p></article>
            </div>
          </div>
        </section>

        <section id="cluster" className="fn-section wide-wrap" aria-labelledby="cluster-title">
          <SectionHead number="03" eyebrow="THE SECOND LAYER" id="cluster-title" title="THE ANSWERS ARE" accent="ALREADY APPEARING." intro="Four owned-media pages. Related subjects. Roles worth clarifying." />
          <div className="fn-article-grid">
            {articles.map((article, index) => <details key={article.id} className="fn-article-card">
              <summary><span className="fn-card-meta"><span>{article.date} 2026</span><span>0{index + 1} / 04</span></span><strong>{article.role}</strong><span className="fn-card-open">VIEW THE EVIDENCE <b>+</b></span></summary>
              <div className="fn-card-reveal"><h3>{article.title}</h3><a href={sourceMap[article.id].url} target="_blank" rel="noopener noreferrer" data-event="source_click" data-source={article.id}>OPEN THE ARTICLE ↗</a><dl><div><dt>EVIDENCE</dt><dd>{sourceMap[article.id].detail}</dd></div><div><dt>PROPOSED ROLE</dt><dd>{article.role}</dd></div><div><dt>BOUNDARY</dt><dd>Related subject matter does not prove search competition.</dd></div></dl></div>
            </details>)}
          </div>
          <div className="fn-role-compare"><div><span>FOUND / CURRENT</span><strong>4 articles</strong><p>Related jobs.</p></div><div className="fn-role-arrow" aria-hidden="true">→</div><div><span>WE&apos;D TEST / PROPOSED</span><strong>One reader route</strong><p>Definition hub + implementation guide + editorial stories + commercial bridge.</p></div></div>
          <details className="fn-compact-detail"><summary>We wouldn&apos;t merge anything yet <span>+</span></summary><p>The four pages have overlapping topics, but search competition is unknown. GSC query/page data and URL-level backlink evidence come before merge, redirect, or canonical survivor decisions. <SourceRefs ids={["03", "04", "06", "07"]} /></p></details>
        </section>

        <section id="hub" className="fn-section fn-section-dark" aria-labelledby="hub-title">
          <div className="wide-wrap fn-hub-layout">
            <div className="fn-hub-intro"><Label number="04">THE EVERGREEN HUB</Label><h2 id="hub-title">GIVE EVERY ANSWER <em>A JOB.</em></h2><p>One maintained definition that sends readers into the newsroom and onward to the operator.</p><span className="fn-stamp">CONCEPT / NOT PUBLISHED</span></div>
            <article className="fn-webpage" aria-label="Proposed owned-media hub mockup">
              <div className="fn-browser-bar"><span>STATE OF BRAND / PROPOSED PAGE</span><span>CONTENT CONCEPT</span></div>
              <div className="fn-webpage-inner">
                <p className="fn-webpage-kicker">B2B OWNED MEDIA / A MAINTAINED ANSWER</p>
                <h3>What It Is, How a Newsroom Works, and What to Measure</h3>
                <div className="fn-definition"><span>THE DEFINITION</span><p>Owned media for a B2B company is a publishing system it controls and an audience chooses to return to. A publication, newsletter, interview series, or event program can all be part of it.</p></div>
                <nav className="fn-hub-nav" aria-label="Concept page sections"><span>THE MODEL</span><span>THE NEWSROOM</span><span>DISTRIBUTION</span><span>MEASUREMENT</span><span>BUILD OR PARTNER</span></nav>
                <div className="fn-hub-example"><div><span>FROM THE GUIDE</span><h4>A newsroom gives owned media its structure.</h4><p>Reporting makes the publication worth following. A maintained guide helps readers understand the model and find the reporting behind it.</p></div><div><span>LIVE EXAMPLE</span><strong>STATE OF BRAND ↗</strong><p>See the newsroom in public. <SourceRefs ids={["02", "09"]} /></p></div></div>
                <div className="fn-hub-route"><span>READER ROUTE</span><strong>LEARN <b>→</b> SEE IT WORK <b>→</b> MEET THE OPERATOR <b>→</b> TALK TO OUTLEVER</strong></div>
                <details className="fn-detail"><summary>Read the longer page concept <span>+</span></summary><div className="fn-detail-body"><p>A newsroom gives owned media a structure: cover questions and changes readers care about, bring practitioners into the story, and publish often enough to become a habit. A maintained guide has another job: define the model and help a reader navigate the reporting behind it.</p><p>State of Brand shows both sides in public. The proposed hub would make their relationship clearer and then route a reader to Outlever&apos;s buyer-facing proof. Search discovery and commercial response remain measurement questions.</p></div></details>
              </div>
            </article>
          </div>
        </section>

        <section id="commercial" className="fn-section wide-wrap" aria-labelledby="commercial-title">
          <SectionHead number="05" eyebrow="THE BUYER ROUTE" id="commercial-title" title="THE PROOF IS LIVE." accent="CONNECT IT." intro="The public route can make the operator behind the newsroom easier to see." />
          <div className="fn-route-grid"><div className="fn-route-card"><span>NOW / OBSERVED</span><ol><li>Outlever homepage</li><li>Contact</li></ol><p>State of Brand is a live proof asset outside this visible route. <SourceRefs ids={["01", "02"]} /></p></div><div className="fn-route-card fn-route-card-proposed"><span>NEXT / PROPOSED</span><ol><li>Outlever homepage</li><li>B2B Owned Media / Newsroom page</li><li>State of Brand proof</li><li>Buyer action</li></ol><p>A route to test, not an observed buyer journey.</p></div></div>
          <article className="fn-buyer-preview" aria-label="Proposed Outlever buyer page mockup"><div className="fn-browser-bar"><span>OUTLEVER / BUYER PAGE CONCEPT</span><span>CONCEPT — NOT OUTLEVER-APPROVED COPY</span></div><div><p>/b2b-owned-media-newsrooms/</p><h3>Become the publication your market chooses to read.</h3><p>Outlever builds and runs editorial newsrooms for B2B brands. See the model operating in public through State of Brand, then explore how it could be shaped around your industry.</p><span className="fn-faux-button">Explore the newsroom model →</span><div className="fn-buyer-modules"><div><span>PROOF / LIVE PUBLICATION</span><strong>STATE OF BRAND</strong><small>A working newsroom to inspect.</small></div><div><span>PROCESS</span><strong>INTERVIEWS → STORIES → DISTRIBUTION</strong><small>The public model, translated into a buyer route.</small></div><div><span>MEASUREMENT</span><strong>START WITH A BASELINE</strong><small>Define what a pilot would actually test.</small></div></div></div></article>
          <details className="fn-compact-detail"><summary>What we don&apos;t know <span>+</span></summary><p>The inspected Outlever homepage did not visibly link to State of Brand or a dedicated service/case-study destination at capture. We have no conversion data. The page above is a concept and requires Outlever&apos;s review before use. <SourceRefs ids={["01", "02", "09"]} /></p></details>
        </section>

        <section id="ai" className="fn-section fn-section-tint" aria-labelledby="ai-title"><div className="wide-wrap"><SectionHead number="06" eyebrow="UNKNOWN / NOT YET TESTED" id="ai-title" title="AI VISIBILITY TEST." accent="NOT RUN YET." /><div className="fn-ai-card"><div><span>STATUS / NOT RUN YET</span><strong>No result to report.</strong><p>Direct ChatGPT Search, Google AI, and Perplexity answers were not captured in Phase 1.</p></div><div className="fn-ai-metrics"><div><strong>15</strong><span>prepared prompts</span></div><div><strong>3</strong><span>engine families</span></div><div><strong>4</strong><span>recorded signals: mention, citation, recommendation, variance</span></div></div></div><details className="fn-detail fn-ai-method"><summary>View methodology and 15 prompts <span>+</span></summary><div className="fn-detail-body"><p>Capture engine, date, locale, account context, full answer, named brands, cited URLs, recommendations, and repeated-run variance. Google AI surfaces are included where available. A web result is not an AI answer.</p><ol>{aiPrompts.map(prompt => <li key={prompt}>{prompt}</li>)}</ol></div></details></div></section>

        <section id="layer" className="fn-section fn-layer" aria-labelledby="layer-title"><div className="wide-wrap"><Label number="07">PRODUCT HYPOTHESIS</Label><div className="fn-layer-heading"><h2 id="layer-title"><span>THIS MAY NOT BE AN SEO FIX.</span><br /><em>IT MAY BE ANOTHER OUTPUT FROM THE OUTLEVER MACHINE.</em></h2><p>Outlever may already do parts of this internally. The public record cannot establish that. This is an architecture to test.</p></div><div className="fn-layer-flow"><div className="fn-layer-source"><span>FOUND / PUBLIC OPERATING MODEL</span><h3>OUTLEVER NEWSROOM OS</h3><div className="fn-layer-inputs"><span>EDITORIAL BEAT</span><i>↓</i><span>REPORTING + INTERVIEWS</span></div><SourceRefs ids={["01", "02", "05"]} /></div><div className="fn-layer-down" aria-hidden="true">↓</div><div className="fn-layer-core"><div className="fn-layer-core-head"><span>PRODUCT HYPOTHESIS / WE&apos;D TEST</span><h3>SEARCH + AI<br />CAPTURE LAYER</h3></div><ul><li><span>01</span> QUERY MAP</li><li><span>02</span> EVERGREEN HUBS</li><li><span>03</span> EDITORIAL ROUTING</li><li><span>04</span> COMMERCIAL PROOF</li><li><span>05</span> AI MEASUREMENT</li></ul></div><div className="fn-layer-down" aria-hidden="true">↓</div><div className="fn-layer-output"><span>TO BE MEASURED</span><div><strong>DURABLE ANSWERS</strong><i>→</i><strong>MACHINE DISCOVERY</strong><i>→</i><strong>BUYER JOURNEY</strong></div><p>No search, AI, citation, or revenue result is claimed.</p></div></div></div></section>

        <section id="experiment" className="fn-section wide-wrap" aria-labelledby="experiment-title"><SectionHead number="08" eyebrow="A BOUNDED FIRST TEST" id="experiment-title" title="Four weeks to build." accent="Longer to judge." /><ol className="fn-weeks"><li><span>WEEK 01</span><h3>Baseline</h3><p>Review GSC query/page and URL-level links; run the first AI panel if access permits.</p></li><li><span>WEEK 02</span><h3>Build hub</h3><p>Design one maintained answer and contextual story routes.</p></li><li><span>WEEK 03</span><h3>Connect proof</h3><p>Draft one buyer destination with Outlever and seek approval before publication.</p></li><li><span>WEEK 04</span><h3>Read signals</h3><p>Check implementation, early query mapping, and repeated AI answers.</p></li></ol><p className="fn-caption">No URL consolidation before GSC and backlink review. No search or AI outcome is promised in four weeks.</p></section>

        <section id="ask" className="fn-section fn-section-dark" aria-labelledby="ask-title"><div className="wide-wrap"><SectionHead number="09" eyebrow="QUESTION THE WORK" id="ask-title" title="ASK THE" accent="RESEARCH." intro="Interrogate the dated observations, source links, hypotheses, and limitations behind this field note." /><ResearchAssistant /></div></section>

        <section className="fn-section fn-cta wide-wrap" aria-labelledby="cta-title"><Label number="10">AN OPEN INVITATION</Label><div><h2 id="cta-title">WE&apos;D TEST ONE PART <em>OF THE MACHINE.</em></h2><div><p>One cluster.<br />One buyer route.<br />One measured pilot.<br />No retainer attached.</p><a href="mailto:ankur@kmfv.cc?subject=Outlever%20field%20note" data-event="cta_click">COMPARE NOTES <span aria-hidden="true">→</span></a></div></div></section>

        <section id="method" className="fn-section fn-sources" aria-labelledby="method-title"><div className="wide-wrap"><SectionHead number="11" eyebrow="SOURCE NOTES" id="method-title" title="How we know" accent="what we know." /><details className="fn-detail"><summary>Methodology, caveats, and primary sources <span>+</span></summary><div className="fn-detail-body"><div className="fn-method-grid"><div><h3>Observed</h3><p>At capture, 240 unique State of Brand URLs were fetched from the sitemap/homepage union: 236 news pages, three category pages, and the homepage. All returned HTTP 200. Twenty homepage-linked news URLs were absent from the sitemap. This does not establish indexing or traffic. <SourceRefs ids={["02", "08"]} /></p></div><div><h3>Claim, inference, hypothesis</h3><p>Outlever&apos;s model and Melissa&apos;s interview are first-party statements. Page roles and buyer routes are inferences; the capture layer is a hypothesis. GSC, backlinks, direct AI visibility, and conversion were not measured. <SourceRefs ids={["01", "05", "09"]} /></p></div></div><div id="sources" className="fn-source-list">{sources.map(([id, source]) => <div key={id}><span>{id}</span><a href={source.url} target="_blank" rel="noopener noreferrer" data-event="source_click" data-source={id}>{source.title}<small>{source.url}</small></a><span>{source.kind}</span></div>)}</div></div></details></div></section>
      </main>
      <footer className="site-footer"><div className="wide-wrap footer-inner"><a href="#top" className="footer-brand">ANKUR / RESEARCH</a><span>Independent analysis. Not affiliated with Outlever or State of Brand.</span><ShareButton compact /></div></footer>
    </>
  );
}
