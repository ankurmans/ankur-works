const validIntents = new Set(['product_development', 'seo_ai_search']);

document.addEventListener('click', (event) => {
  const link = event.target.closest?.('a[data-offer-intent]');
  if (!link) return;

  const intent = link.dataset.offerIntent;
  if (!validIntents.has(intent)) return;
  const placement = link.dataset.offerPlacement || 'unspecified';
  const detail = { intent, placement };

  window.dispatchEvent(new CustomEvent('ankur:offer-intent', { detail }));
  if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push({ event: 'offer_intent', offer_intent: intent, placement });
  }
  if (typeof window.plausible === 'function') {
    window.plausible('Offer Intent', { props: detail });
  }
});
