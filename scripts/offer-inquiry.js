import posthog from './analytics.js';

const allowedOffers = new Set(['product_development', 'seo_ai_search']);
const attribution = new URLSearchParams(window.location.search);

for (const form of document.querySelectorAll('.offer-inquiry-form')) {
  const offer = form.dataset.offer;
  if (!allowedOffers.has(offer)) continue;
  const status = form.querySelector('.offer-form-feedback');
  const button = form.querySelector('button[type="submit"]');
  let submissionId = crypto.randomUUID();
  form.addEventListener('focusin', () => {
    posthog.capture('offer_form_started', { intent: offer, source: 'offer_page' });
  }, { once: true });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.reportValidity() || button.disabled) return;
    button.disabled = true;
    status.classList.remove('is-error');
    status.textContent = 'Sending your note…';
    const fields = new FormData(form);
    const payload = Object.fromEntries(['name', 'email', 'website', 'brief', 'companyFax']
      .map((key) => [key, String(fields.get(key) || '')]));
    payload.offer = offer;
    payload.submissionId = submissionId;
    for (const key of ['utm_source', 'utm_medium', 'utm_campaign']) payload[key] = attribution.get(key) || '';

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch('/api/offer-inquiry', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload), signal: controller.signal,
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok) throw new Error(result.error || 'The form could not send your note. Please use the email link below.');
      form.classList.add('is-sent');
      status.textContent = result.confirmationSent
        ? 'Got it. A confirmation is on its way to your inbox. I’ll read your note and reply personally.'
        : 'Got it. I’ll read your note and reply personally. I could not send a confirmation email just now.';
      const link = document.createElement('a');
      link.href = 'https://cal.com/ankur-kmf/30min';
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = 'Book a call with me';
      status.append(document.createElement('br'), link);
      const detail = { intent: offer, placement: 'offer_form', source: 'offer_page' };
      posthog.capture('offer_lead', detail);
      window.dispatchEvent(new CustomEvent('ankur:offer-lead', { detail }));
      if (Array.isArray(window.dataLayer)) window.dataLayer.push({ event: 'offer_lead', offer_intent: offer });
      if (typeof window.plausible === 'function') window.plausible('Offer Lead', { props: detail });
      submissionId = crypto.randomUUID();
    } catch (error) {
      status.classList.add('is-error');
      status.textContent = error instanceof Error && error.name !== 'AbortError'
        ? error.message : 'The connection timed out. Please try again or use the email link below.';
      button.disabled = false;
    } finally { clearTimeout(timer); }
  });
}
