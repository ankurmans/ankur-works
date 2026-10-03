const params = new URLSearchParams(window.location.search);
let source = params.get('utm_source')?.slice(0, 80);
if (!source) {
  try { source = document.referrer ? new URL(document.referrer).hostname : 'direct'; }
  catch { source = 'unknown'; }
}
const visit = { intent: 'character_marketing', source };
window.dispatchEvent(new CustomEvent('ankur:character-page-view', { detail: visit }));
if (Array.isArray(window.dataLayer)) window.dataLayer.push({ event: 'character_page_view', ...visit });
if (typeof window.plausible === 'function') window.plausible('Character Page View', { props: visit });

for (const video of document.querySelectorAll('.offer-character video')) {
  video.addEventListener('play', () => {
    const detail = { intent: 'character_marketing', asset: 'whooshly_quincy_film', placement: 'case_study' };
    window.dispatchEvent(new CustomEvent('ankur:character-video-play', { detail }));
    if (Array.isArray(window.dataLayer)) window.dataLayer.push({ event: 'character_video_play', ...detail });
    if (typeof window.plausible === 'function') window.plausible('Character Video Play', { props: detail });
  });
}
