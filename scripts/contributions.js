const grid = document.querySelector('#contribution-grid');
const months = document.querySelector('#contribution-months');
const total = document.querySelector('#contribution-total');
const scope = document.querySelector('#contribution-scope');
const updated = document.querySelector('#contribution-updated');
const CACHE_KEY = 'ankur-github-contributions-v1';
const REFRESH_MS = 60 * 60 * 1000;
const RETRY_MS = 15 * 60 * 1000;
const MAX_SNAPSHOT_MS = 7 * 24 * REFRESH_MS;
const LOCAL = ['localhost', '127.0.0.1'].includes(location.hostname);
let currentSnapshot = null;
let refreshTimer;
let nextRefreshAt = 0;
let refreshInFlight = null;
let hasRendered = false;

function dayString(date) { return date.toISOString().slice(0, 10); }
function dateLabel(date) { return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }); }
function validDays(data) {
  if (!Array.isArray(data?.contributions)) return [];
  return data.contributions.filter(day => /^\d{4}-\d{2}-\d{2}$/.test(day.date) && Number.isFinite(day.count) && day.count >= 0);
}
function readSnapshot() {
  if (LOCAL) return null;
  try {
    const snapshot = JSON.parse(localStorage.getItem(CACHE_KEY));
    const age = Date.now() - snapshot?.savedAt;
    if (!Number.isFinite(age) || age < 0 || age > MAX_SNAPSHOT_MS || validDays(snapshot?.data).length < 300) return null;
    if (!['github-graphql', 'public-proxy'].includes(snapshot.data.source)) return null;
    return snapshot;
  } catch (_) { return null; }
}
function saveSnapshot(data) {
  const snapshot = { savedAt: Date.now(), data };
  currentSnapshot = snapshot;
  if (!LOCAL) {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(snapshot)); }
    catch (_) { /* The graph still works if browser storage is disabled. */ }
  }
  return snapshot;
}
async function getAuthenticatedData() {
  try {
    const response = await fetch('/api/contributions');
    if (!response.ok) throw new Error('Authenticated GitHub feed unavailable');
    const data = await response.json();
    if (data.source === 'github-graphql' && validDays(data).length >= 300) return data;
  } catch (_) { /* The authenticated source is unavailable. */ }
  return null;
}
async function getPublicData() {
  // A local preview should reveal a missing or expired token, rather than
  // quietly display the public-only fallback while developing the graph.
  if (LOCAL) return null;
  try {
    const response = await fetch('https://github-contributions-api.jogruber.de/v4/ankurmans?y=last');
    if (!response.ok) throw new Error('Public GitHub feed unavailable');
    const data = await response.json();
    if (validDays(data).length >= 300) return { ...data, scope: 'public', source: 'public-proxy' };
  } catch (_) { /* Show an honest unavailable state below. */ }
  return null;
}
function draw(data, { savedAt, stale = false } = {}) {
  const metric = data.metric === 'commits' ? 'commit' : 'contribution';
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const cutoff = new Date(today);
  cutoff.setUTCDate(cutoff.getUTCDate() - 364);
  const start = new Date(cutoff);
  start.setUTCDate(start.getUTCDate() - start.getUTCDay());
  const lookup = new Map(validDays(data).map(day => [day.date, day.count]));
  const counts = [];
  const cells = document.createDocumentFragment();
  const monthNodes = document.createDocumentFragment();
  let previousMonth = -1;
  let week = 0;
  const date = new Date(start);
  while (date <= today) {
    if (date.getUTCDay() === 0) {
      const month = date.getUTCMonth();
      if (month !== previousMonth) {
        const label = document.createElement('span');
        label.textContent = date.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' });
        label.style.gridColumn = String(week + 1);
        monthNodes.appendChild(label);
        previousMonth = month;
      }
      week++;
    }
    const count = date < cutoff ? 0 : (lookup.get(dayString(date)) ?? 0);
    counts.push(count);
    const cell = document.createElement('span');
    cell.className = 'contribution-cell';
    cell.dataset.count = String(count);
    cell.title = `${count} GitHub ${metric}${count === 1 ? '' : 's'} on ${dateLabel(date)}`;
    cells.appendChild(cell);
    date.setUTCDate(date.getUTCDate() + 1);
  }
  const positive = counts.filter(count => count > 0).sort((a, b) => a - b);
  const high = positive[Math.floor(positive.length * .9)] || 1;
  [...cells.children].forEach(cell => {
    const count = Number(cell.dataset.count);
    cell.dataset.level = count === 0 ? '0' : String(Math.max(1, Math.min(4, Math.ceil(count / high * 4))));
  });
  grid.replaceChildren(cells);
  months.replaceChildren(monthNodes);
  const sum = counts.reduce((a, b) => a + b, 0);
  total.textContent = `${sum.toLocaleString()} ${metric}s in the past year`;
  const visibility = data.scope === 'private-and-public' ? 'Private and public activity included.' : data.scope === 'public' ? 'Public activity only.' : 'Private activity inclusion is unverified.';
  grid.setAttribute('aria-label', `${sum.toLocaleString()} GitHub ${metric}s over the past year. ${visibility}`);
  const full = data.scope === 'private-and-public';
  scope.textContent = full ? 'PRIVATE + PUBLIC · VERIFIED' : data.scope === 'public' ? 'PUBLIC ACTIVITY' : 'SCOPE UNVERIFIED';
  scope.classList.toggle('scope-badge-full', full);
  const checkedAt = new Date(data.generatedAt || savedAt);
  updated.textContent = Number.isFinite(checkedAt.getTime())
    ? `GitHub checked ${checkedAt.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', timeZoneName: 'short' })}.`
    : 'GitHub check unavailable.';
  if (!hasRendered) document.querySelector('.contribution-scroll').scrollLeft = document.querySelector('.contribution-scroll').scrollWidth;
  hasRendered = true;
}
function unavailable() {
  total.textContent = LOCAL ? 'Local GitHub token needed' : 'Activity temporarily unavailable';
  scope.textContent = 'CONNECTION NEEDED';
  updated.textContent = LOCAL ? 'Set GITHUB_TOKEN in .env.local, restart the preview, and refresh this page.' : 'Visit GitHub for the latest activity.';
}
function scheduleRefresh(delay) {
  clearTimeout(refreshTimer);
  nextRefreshAt = Date.now() + delay;
  refreshTimer = setTimeout(refresh, delay);
}
async function refresh() {
  if (refreshInFlight) return refreshInFlight;
  refreshInFlight = (async () => {
    const authenticated = await getAuthenticatedData();
    if (authenticated) {
      const snapshot = saveSnapshot(authenticated);
      draw(authenticated, snapshot);
      scheduleRefresh(REFRESH_MS);
      return;
    }
    // A temporary token or network failure must not replace a verified
    // private-and-public snapshot with a public-only graph.
    if (currentSnapshot?.data.source === 'github-graphql' && Date.now() - currentSnapshot.savedAt <= MAX_SNAPSHOT_MS) {
      draw(currentSnapshot.data, { ...currentSnapshot, stale: true });
      scheduleRefresh(RETRY_MS);
      return;
    }
    const publicData = await getPublicData();
    if (publicData) {
      const snapshot = saveSnapshot(publicData);
      draw(publicData, snapshot);
      scheduleRefresh(REFRESH_MS);
      return;
    }
    if (currentSnapshot && Date.now() - currentSnapshot.savedAt <= MAX_SNAPSHOT_MS) draw(currentSnapshot.data, { ...currentSnapshot, stale: true });
    else unavailable();
    scheduleRefresh(RETRY_MS);
  })().finally(() => { refreshInFlight = null; });
  return refreshInFlight;
}

currentSnapshot = readSnapshot();
if (currentSnapshot) {
  draw(currentSnapshot.data, { ...currentSnapshot, stale: Date.now() - currentSnapshot.savedAt >= REFRESH_MS });
  const delay = currentSnapshot.savedAt + REFRESH_MS - Date.now();
  if (delay > 0) scheduleRefresh(delay);
  else refresh();
} else refresh();

document.addEventListener('visibilitychange', () => {
  if (!document.hidden && Date.now() >= nextRefreshAt && !refreshInFlight) refresh();
});
window.addEventListener('storage', event => {
  if (event.key !== CACHE_KEY) return;
  const snapshot = readSnapshot();
  if (snapshot && snapshot.savedAt > (currentSnapshot?.savedAt || 0)) {
    currentSnapshot = snapshot;
    draw(snapshot.data, snapshot);
    scheduleRefresh(Math.max(0, snapshot.savedAt + REFRESH_MS - Date.now()));
  }
});
