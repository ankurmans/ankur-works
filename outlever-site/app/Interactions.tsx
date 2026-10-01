"use client";

import { useEffect, useState } from "react";

type AnalyticsDetail = { name: string; [key: string]: string | number };

function emit(detail: AnalyticsDetail) {
  window.dispatchEvent(new CustomEvent("ankur:analytics", { detail }));
}

export function AnalyticsHooks() {
  useEffect(() => {
    emit({ name: "page_view" });
    const thresholds = [25, 50, 75, 100];
    const seen = new Set<number>();
    let scheduled = false;

    const measure = () => {
      const available = document.documentElement.scrollHeight - window.innerHeight;
      const percent = available <= 0 ? 100 : Math.round((window.scrollY / available) * 100);
      for (const threshold of thresholds) {
        if (percent >= threshold && !seen.has(threshold)) {
          seen.add(threshold);
          emit({ name: "scroll_depth", percent: threshold });
        }
      }
      scheduled = false;
    };

    const onScroll = () => {
      if (!scheduled) {
        scheduled = true;
        window.requestAnimationFrame(measure);
      }
    };

    const onClick = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target.closest<HTMLElement>("[data-event]") : null;
      if (!target) return;
      emit({
        name: target.dataset.event || "click",
        ...(target.dataset.source ? { source: target.dataset.source } : {}),
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("click", onClick);
    measure();
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("click", onClick);
    };
  }, []);

  return null;
}

export function ShareButton({ compact = false }: { compact?: boolean }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = "https://outlever.ankur.works/";
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 3000);
      } else {
        window.prompt("Copy this link", url);
      }
    } catch {
      window.prompt("Copy this link", url);
    }
  }

  return (
    <button
      className={compact ? "share-button share-button--compact" : "share-button"}
      type="button"
      onClick={share}
      data-event="share_click"
      aria-label="Share this independent analysis"
    >
      <span>{copied ? "Link copied" : "Share this note"}</span>
      <span aria-hidden="true">→</span>
    </button>
  );
}
