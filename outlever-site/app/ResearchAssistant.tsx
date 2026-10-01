"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { isGeneralAnkurQuestion } from "../lib/assistant-routing";

const examples = [
  "Why do these pages overlap?",
  "What would you change first?",
  "What evidence is missing?",
  "What could prove the thesis wrong?",
  "How would this work inside Outlever?",
];

const sectionPrompts = [
  { id: "cluster", prompt: "Ask about this content cluster" },
  { id: "layer", prompt: "Ask how this could work as an Outlever capability" },
  { id: "experiment", prompt: "Ask what we'd measure" },
] as const;

type ResearchAnswer = {
  direct_answer: string;
  evidence: string[];
  boundary: string;
  next_test: string;
  status: "OBSERVED" | "REPORTED" | "INFERRED" | "HYPOTHESIS" | "UNKNOWN";
  sources: { title: string; url: string }[];
  kind?: "twin";
};

type TwinAnswer = { answer?: string; error?: string; sources?: { title: string; url: string }[] };
type TwinTurn = { role: "user" | "assistant"; content: string };

function twinEndpoint() {
  if (process.env.NEXT_PUBLIC_ANKUR_TWIN_URL) return process.env.NEXT_PUBLIC_ANKUR_TWIN_URL;
  return ["localhost", "127.0.0.1"].includes(window.location.hostname)
    ? "http://127.0.0.1:5173/api/assistant" : "https://ankur.works/api/assistant";
}

export function ResearchAssistant() {
  const [question, setQuestion] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [answer, setAnswer] = useState<ResearchAnswer | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [contextPrompt, setContextPrompt] = useState("");
  const [selectedPrompt, setSelectedPrompt] = useState("");
  const [visiblePrompt, setVisiblePrompt] = useState("");
  const [launcherVisible, setLauncherVisible] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const requestId = useRef(0);
  const twinHistory = useRef<TwinTurn[]>([]);
  const lastAnswerWasTwin = useRef(false);
  const conversationId = useRef("");

  function currentConversationId() {
    if (conversationId.current) return conversationId.current;
    const key = "ankur:outlever:research-conversation:v1";
    try {
      const saved = localStorage.getItem(key);
      conversationId.current = saved && /^[0-9a-f-]{36}$/i.test(saved) ? saved : crypto.randomUUID();
      localStorage.setItem(key, conversationId.current);
    } catch { conversationId.current = crypto.randomUUID(); }
    return conversationId.current;
  }

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const active = sectionPrompts.find(({ id }) => {
        const bounds = document.getElementById(id)?.getBoundingClientRect();
        return bounds && bounds.top < window.innerHeight * 0.58 && bounds.bottom > window.innerHeight * 0.35;
      });
      setVisiblePrompt(active?.prompt || "");
      if (active) setContextPrompt(active.prompt);
      const askBounds = document.getElementById("ask")?.getBoundingClientRect();
      setLauncherVisible(window.scrollY > 520 && !(askBounds && askBounds.top < window.innerHeight && askBounds.bottom > 0));
    };
    const schedule = () => { if (!frame) frame = window.requestAnimationFrame(update); };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    schedule();
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  function openFromSection() {
    setSelectedPrompt(visiblePrompt);
    document.getElementById("ask")?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 350);
  }

  async function ask(value: string) {
    const clean = value.trim();
    if (!clean || clean.length > 600) return;
    setSelectedPrompt("");
    const id = ++requestId.current;
    const conversation = currentConversationId();
    const turnId = crypto.randomUUID();
    setQuestion(clean);
    setSubmitted(clean);
    setAnswer(null);
    setError("");
    setLoading(true);
    try {
      const useTwin = isGeneralAnkurQuestion(clean, lastAnswerWasTwin.current);
      if (useTwin) {
        const response = await fetch(twinEndpoint(), {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: clean, history: twinHistory.current.slice(-4), conversationId: conversation, turnId, channel: "chat", page: "/" }),
        });
        const data = await response.json() as TwinAnswer;
        if (!response.ok || !data.answer) throw new Error(data.error || "Ankur's AI Twin is unavailable right now.");
        if (id !== requestId.current) return;
        twinHistory.current = [...twinHistory.current, { role: "user" as const, content: clean }, { role: "assistant" as const, content: data.answer }].slice(-4);
        lastAnswerWasTwin.current = true;
        setAnswer({ direct_answer: data.answer, evidence: [], boundary: "", next_test: "", status: "REPORTED", kind: "twin",
          sources: (data.sources || []).map(source => ({ title: source.title, url: new URL(source.url, "https://ankur.works").href })) });
      } else {
        const response = await fetch("/api/research", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: clean, conversationId: conversation, turnId }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "The research assistant is unavailable right now.");
        if (id === requestId.current) { lastAnswerWasTwin.current = false; setAnswer(data as ResearchAnswer); }
      }
    } catch (cause) {
      if (id === requestId.current) setError(cause instanceof Error ? cause.message : "The research assistant is unavailable right now.");
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void ask(question);
  }

  return <><div className="fn-assistant">
    <div className="fn-assistant-main">
      <div className="fn-assistant-status"><span className="fn-status-dot" /> THE EVIDENCE, READY FOR QUESTIONS</div>
      <form onSubmit={submit}>
        <label htmlFor="research-question">Your question</label>
        <div><input id="research-question" ref={inputRef} value={question} onChange={event => setQuestion(event.target.value)} maxLength={600} placeholder={selectedPrompt || contextPrompt || "Ask about the finding, the gaps, or the pilot…"} /><button type="submit" disabled={loading} data-event="research_ask">{loading ? "Checking…" : "Ask a question"} <span aria-hidden="true">→</span></button></div>
      </form>
      {submitted && <div className="fn-answer" role="status" aria-live="polite">
        <span>QUESTION / {submitted}</span>
        {loading ? <p>Checking the evidence…</p> : error ? <p>{error}</p> : answer && <>
          {answer.kind === "twin" && <strong>ANKUR&apos;S AI TWIN / GENERAL WORK</strong>}
          <h3>{answer.direct_answer}</h3>
          {answer.evidence.length > 0 && <div><strong>EVIDENCE / {answer.status}</strong><ul>{answer.evidence.map((point, index) => <li key={index}>{point}</li>)}</ul></div>}
          {answer.boundary && <p className="fn-answer-caveat"><strong>BOUNDARY</strong> {answer.boundary}</p>}
          {answer.next_test && <p><strong>NEXT TEST</strong> {answer.next_test}</p>}
          {answer.sources.length > 0 && <p className="fn-answer-sources"><strong>Sources</strong> {answer.sources.map((source, index) => <a href={source.url} key={`${source.url}-${index}`} target="_blank" rel="noopener noreferrer">{source.title}</a>)}</p>}
          {answer.kind === "twin" && <p className="fn-answer-sources"><a href="https://cal.com/ankur-kmf/30min" target="_blank" rel="noopener noreferrer">Book a 30-minute call with Ankur</a></p>}
        </>}
      </div>}
      <p className="fn-assistant-note">Research answers draw on the dated audit and distinguish observations, claims, interpretations, and unknowns. Questions about Ankur&apos;s own work use his AI Twin. Neither speaks for Outlever. Questions and answers may be saved privately for Ankur to review.</p>
    </div>
    <aside className="fn-assistant-examples"><span>START WITH A QUESTION</span><div className="fn-assistant-chips">{examples.map(example => <button type="button" key={example} onClick={() => { void ask(example); inputRef.current?.focus(); }} data-event="research_example">{example}</button>)}</div></aside>
  </div>{launcherVisible && <button type="button" className="fn-context-ask" onClick={openFromSection} aria-label={visiblePrompt ? `Ask the analysis about this section: ${visiblePrompt}` : "Ask the analysis"}>ASK THE ANALYSIS <span aria-hidden="true">↗</span></button>}</>;
}
