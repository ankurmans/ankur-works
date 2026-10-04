import posthog from './analytics.js';

if (import.meta.env.VITE_POSTHOG_TOKEN) {
  const match = window.location.pathname.match(/^\/build-log\/([a-z0-9-]+)\/?$/);
  const postSlug = match?.[1] || 'index';
  const properties = { post_slug: postSlug, content_status: 'draft' };
  const capture = (event, extra = {}) => posthog.capture(event, { ...properties, ...extra });

  // The Share Kit emits a selection event; it cannot prove the recipient shared.
  document.addEventListener('whooshly:share', (event) => {
    const network = event.detail?.network;
    if (['x', 'facebook', 'linkedin', 'email', 'copy'].includes(network)) {
      capture('build_log_share_intent', { network });
    }
  });

  const share = document.querySelector('.log-share');
  share?.addEventListener('toggle', () => {
    if (share.open) capture('build_log_share_menu_opened');
  });

  const end = document.querySelector('.log-end');
  if (end && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      capture('build_log_end_seen');
      observer.disconnect();
    }, { threshold: 0.5 });
    observer.observe(end);
  }

  document.addEventListener('click', (event) => {
    const link = event.target.closest?.('a[href]');
    if (!link) return;
    if (link.closest('.log-card')) capture('build_log_draft_opened', { destination_slug: link.pathname.split('/')[2] });
    if (!link.closest('.log-end, .log-prose')) return;
    const destination = new URL(link.href, window.location.href);
    if (!['/product-development/', '/seo-ai-search/', '/mascot-branding/'].includes(destination.pathname)) return;
    capture('build_log_offer_clicked', { offer_path: destination.pathname });

    // Keep native post attribution available to the inquiry form on the offer page.
    const entry = new URLSearchParams(window.location.search);
    for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content']) {
      if (entry.has(key) && !destination.searchParams.has(key)) {
        destination.searchParams.set(key, entry.get(key).slice(0, 100));
      }
    }
    link.href = destination.href;
  });
}
