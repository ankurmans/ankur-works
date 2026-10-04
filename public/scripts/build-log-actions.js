document.querySelectorAll('.log-summary').forEach((summary) => {
  const tabs = [...summary.querySelectorAll('[role="tab"]')];
  const select = (tab, focus = false) => {
    tabs.forEach((item) => {
      const active = item === tab;
      item.setAttribute('aria-selected', String(active));
      item.tabIndex = active ? 0 : -1;
      document.getElementById(item.getAttribute('aria-controls')).hidden = !active;
    });
    if (focus) tab.focus();
  };
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => select(tab));
    tab.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1
        : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      select(tabs[next], true);
    });
  });
});

const share = document.querySelector('.log-share');
let shareScriptRequested = false;
share?.addEventListener('toggle', () => {
  if (!share.open || shareScriptRequested) return;
  shareScriptRequested = true;
  const script = document.createElement('script');
  script.src = 'https://whooshly.co/share.js';
  script.async = true;
  script.onerror = () => {
    shareScriptRequested = false;
    share.querySelector('whooshly-share').replaceWith(Object.assign(document.createElement('a'), {
      href: `mailto:?subject=${encodeURIComponent(document.title)}&body=${encodeURIComponent(location.href)}`,
      textContent: 'Share by email',
    }));
  };
  document.head.append(script);
});

document.addEventListener('click', (event) => {
  if (share?.open && !share.contains(event.target)) share.open = false;
});
