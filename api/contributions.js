// Vercel serverless function: returns live GitHub contribution data.
// Queries the GraphQL API with GITHUB_TOKEN (set in Vercel env) so private
// contributions are included and the data is always current — no rebuild needed.
// Falls back to the public jogruber proxy if the token is missing or the call fails.

const USERNAME = 'ankurmans';

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
      'User-Agent': 'ankur.works',
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

export default async function handler(req, res) {
  const token = process.env.GITHUB_TOKEN;
  try {
    const data = token ? await fetchFromGraphQL(token) : await fetchFromProxy();
    // Cache at the edge for an hour; serve stale while revalidating for a day.
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    res.status(200).json(data);
  } catch (err) {
    try {
      const data = await fetchFromProxy();
      res.setHeader('Cache-Control', 's-maxage=1800');
      res.status(200).json(data);
    } catch (_) {
      res.status(502).json({ error: 'Failed to fetch contributions', total: {}, contributions: [] });
    }
  }
}
