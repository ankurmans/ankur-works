import posthog from './analytics.js';

const validIntents = new Set(['product_development', 'seo_ai_search']);
const outboundCategories = {
  'pepys.co': 'product',
  'whooshly.co': 'product',
  'quotesweep.com': 'product',
  'twinsona.com': 'product',
  'toughtrucksforkids.com': 'commerce',
  'ampedrideontoys.com': 'commerce',
  'github.com': 'code',
  'claude.ai': 'directory',
  'linkedin.com': 'social',
  'x.com': 'social',
  'caldrin.co': 'company',
};

document.addEventListener('click', (event) => {
  const link = event.target.closest?.('a[href]');
  if (!link) return;

  const intent = link.dataset.offerIntent;
  if (validIntents.has(intent)) {
    const placement = link.dataset.offerPlacement || 'unspecified';
    const detail = { intent, placement };

    posthog.capture('offer_intent', detail, { transport: 'sendBeacon', send_instantly: true });
    window.dispatchEvent(new CustomEvent('ankur:offer-intent', { detail }));
    if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push({ event: 'offer_intent', offer_intent: intent, placement });
    }
    if (typeof window.plausible === 'function') {
      window.plausible('Offer Intent', { props: detail });
    }
  }

  const destination = new URL(link.href, window.location.href);
  const source = link.closest('#ask-ankur-dialog') ? 'ai_twin' : 'site';
  if (destination.protocol === 'mailto:') {
    posthog.capture('contact_click', { method: 'email', source }, { transport: 'sendBeacon', send_instantly: true });
    return;
  }
  if (!['http:', 'https:'].includes(destination.protocol) || destination.host === window.location.host) return;
  const host = destination.hostname.replace(/^www\./, '');
  if (host === 'cal.com') {
    if (!link.hasAttribute('data-chat-booking')) {
      posthog.capture('booking_link_clicked', { source }, { transport: 'sendBeacon', send_instantly: true });
    }
    return;
  }
  posthog.capture('outbound_link_clicked', {
    destination_host: host,
    category: outboundCategories[host] || 'other',
  }, { transport: 'sendBeacon', send_instantly: true });
});
