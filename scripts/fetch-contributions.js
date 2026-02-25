// Build-time script: fetches GitHub contribution data and writes static JSON
// Reads GITHUB_TOKEN from .env or environment
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Load .env file
const __root = join(dirname(fileURLToPath(import.meta.url)), '..');
const envPath = join(__root, '.env');
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const match = line.match(/^\s*([^#=]+?)\s*=\s*(.*)\s*$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2];
  }
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const USERNAME = 'ankurmans';
const OUTPUT_DIR = join(__dirname, '..', 'public', 'data');
const OUTPUT_FILE = join(OUTPUT_DIR, 'contributions.json');

const GRAPHQL_QUERY = `
query($username: String!) {
  user(login: $username) {
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            contributionCount
            date
            color
          }
        }
      }
    }
  }
}`;

function countToLevel(count, maxCount) {
  if (count === 0) return 0;
  const ratio = count / maxCount;
  if (ratio <= 0.25) return 1;
  if (ratio <= 0.5) return 2;
  if (ratio <= 0.75) return 3;
  return 4;
}

async function fetchFromGraphQL(token) {
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: GRAPHQL_QUERY,
      variables: { username: USERNAME },
    }),
  });

  if (!res.ok) throw new Error(`GitHub API returned ${res.status}`);
  const json = await res.json();

  if (json.errors) throw new Error(json.errors[0].message);

  const calendar = json.data.user.contributionsCollection.contributionCalendar;
  const days = calendar.weeks.flatMap(w => w.contributionDays);
  const maxCount = Math.max(...days.map(d => d.contributionCount), 1);

  const contributions = days.map(d => ({
    date: d.date,
    count: d.contributionCount,
    level: countToLevel(d.contributionCount, maxCount),
  }));

  // Build yearly totals
  const total = {};
  for (const d of contributions) {
    const year = d.date.slice(0, 4);
    total[year] = (total[year] || 0) + d.count;
  }

  return { total, contributions };
}

async function fetchFromProxy() {
  const res = await fetch(
    `https://github-contributions-api.jogruber.de/v4/${USERNAME}`
  );
  if (!res.ok) throw new Error(`Proxy returned ${res.status}`);
  return res.json();
}

async function main() {
  const token = process.env.GITHUB_TOKEN;
  console.log(`Fetching contributions for ${USERNAME}...`);

  try {
    const data = token
      ? await fetchFromGraphQL(token)
      : await fetchFromProxy();

    if (!token) {
      console.warn('No GITHUB_TOKEN set — using public proxy (private contributions excluded).');
    }

    if (!existsSync(OUTPUT_DIR)) {
      mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    writeFileSync(OUTPUT_FILE, JSON.stringify(data));
    console.log(`Wrote ${data.contributions.length} days to ${OUTPUT_FILE}`);
  } catch (err) {
    console.error('Failed to fetch contributions:', err.message);

    if (existsSync(OUTPUT_FILE)) {
      console.log('Using cached contributions data.');
    } else {
      if (!existsSync(OUTPUT_DIR)) {
        mkdirSync(OUTPUT_DIR, { recursive: true });
      }
      writeFileSync(OUTPUT_FILE, JSON.stringify({ total: {}, contributions: [] }));
      console.log('Wrote empty fallback data.');
    }
  }
}

main();
