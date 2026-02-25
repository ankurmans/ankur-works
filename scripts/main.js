// Prefetch external links on hover for perceived speed
document.querySelectorAll('a[target="_blank"]').forEach(link => {
  link.addEventListener('mouseenter', () => {
    const prefetch = document.createElement('link');
    prefetch.rel = 'prefetch';
    prefetch.href = link.href;
    document.head.appendChild(prefetch);
  }, { once: true });
});

// === Contribution Heatmap ===
const GITHUB_USERNAME = 'ankurmans';

async function initHeatmap() {
  const grid = document.querySelector('.heatmap__grid');
  if (!grid) return;

  const data = await fetchContributions();
  if (!data) return;

  renderGrid(grid, data.contributions);
  renderMonthLabels(data.contributions);
  renderTotal(data.contributions);
  initTooltips(grid);
}

async function fetchContributions() {
  // Try local static JSON first (generated at build time)
  try {
    const res = await fetch('/data/contributions.json');
    if (res.ok) return res.json();
  } catch (_) { /* fall through */ }

  // Fallback: fetch live from public proxy
  try {
    const res = await fetch(
      `https://github-contributions-api.jogruber.de/v4/${GITHUB_USERNAME}`
    );
    if (res.ok) return res.json();
  } catch (_) { /* fall through */ }

  return null;
}

function renderGrid(container, contributions) {
  const today = new Date();
  const oneYearAgo = new Date(today);
  oneYearAgo.setFullYear(today.getFullYear() - 1);

  // Build lookup map
  const countMap = new Map();
  contributions.forEach(c => countMap.set(c.date, c));

  // Start on the Sunday of the week containing oneYearAgo
  const startDate = new Date(oneYearAgo);
  startDate.setDate(startDate.getDate() - startDate.getDay());

  const fragment = document.createDocumentFragment();
  const current = new Date(startDate);

  while (current <= today) {
    const yyyy = current.getFullYear();
    const mm = String(current.getMonth() + 1).padStart(2, '0');
    const dd = String(current.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;

    const entry = countMap.get(dateStr);
    const level = entry ? entry.level : 0;
    const count = entry ? entry.count : 0;

    const cell = document.createElement('span');
    cell.className = 'heatmap__cell';
    cell.dataset.level = level;
    cell.dataset.date = dateStr;
    cell.dataset.count = count;
    fragment.appendChild(cell);

    current.setDate(current.getDate() + 1);
  }

  container.appendChild(fragment);
}

function renderMonthLabels(contributions) {
  const monthsContainer = document.querySelector('.heatmap__months');
  if (!monthsContainer) return;

  const months = ['Jan','Feb','Mar','Apr','May','Jun',
                  'Jul','Aug','Sep','Oct','Nov','Dec'];

  const today = new Date();
  const oneYearAgo = new Date(today);
  oneYearAgo.setFullYear(today.getFullYear() - 1);
  const startDate = new Date(oneYearAgo);
  startDate.setDate(startDate.getDate() - startDate.getDay());

  let currentMonth = -1;
  let weekIndex = 0;
  const current = new Date(startDate);

  while (current <= today) {
    if (current.getDay() === 0) {
      const month = current.getMonth();
      if (month !== currentMonth) {
        const label = document.createElement('span');
        label.textContent = months[month];
        label.style.gridColumn = weekIndex + 1;
        monthsContainer.appendChild(label);
        currentMonth = month;
      }
      weekIndex++;
    }
    current.setDate(current.getDate() + 1);
  }
}

function renderTotal(contributions) {
  const totalEl = document.querySelector('.heatmap__total');
  if (!totalEl || !contributions) return;

  const today = new Date();
  const oneYearAgo = new Date(today);
  oneYearAgo.setFullYear(today.getFullYear() - 1);
  const cutoff = oneYearAgo.toISOString().slice(0, 10);

  const count = contributions
    .filter(c => c.date >= cutoff)
    .reduce((sum, c) => sum + c.count, 0);

  totalEl.textContent = `${count.toLocaleString()} contributions in the last year`;
}

function initTooltips(grid) {
  const tooltip = document.createElement('div');
  tooltip.className = 'heatmap__tooltip';
  document.body.appendChild(tooltip);

  grid.addEventListener('mouseover', (e) => {
    const cell = e.target.closest('.heatmap__cell');
    if (!cell) return;

    const count = cell.dataset.count;
    const date = new Date(cell.dataset.date + 'T00:00:00');
    const formatted = date.toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });

    tooltip.textContent = `${count} contribution${count !== '1' ? 's' : ''} on ${formatted}`;
    tooltip.classList.add('heatmap__tooltip--visible');

    const rect = cell.getBoundingClientRect();
    tooltip.style.left = `${rect.left + rect.width / 2 - tooltip.offsetWidth / 2}px`;
    tooltip.style.top = `${rect.top - tooltip.offsetHeight - 6}px`;
  });

  grid.addEventListener('mouseout', (e) => {
    if (e.target.closest('.heatmap__cell')) {
      tooltip.classList.remove('heatmap__tooltip--visible');
    }
  });
}

initHeatmap();
