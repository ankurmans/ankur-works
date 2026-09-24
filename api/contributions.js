// GitHub-authenticated commit calendar. The token needs read:user access to
// include private repositories. No private repository names or code are returned.
const USERNAME = 'ankurmans';
const QUERY = `query($username: String!) {
  viewer { login }
  user(login: $username) {
    contributionsCollection {
      totalCommitContributions
      contributionCalendar { totalContributions weeks { contributionDays { date contributionCount } } }
      commitContributionsByRepository(maxRepositories: 100) {
        repository { id isPrivate }
        early: contributions(first: 100) { totalCount nodes { occurredAt commitCount } }
        late: contributions(last: 100) { nodes { occurredAt commitCount } }
      }
    }
  }
}`;
function level(count, high) { return count === 0 ? 0 : Math.max(1, Math.min(4, Math.ceil(count / high * 4))); }
export default async function handler(req, res) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return res.status(503).json({ error: 'Authenticated GitHub connection unavailable' });
  try {
    const response = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', 'User-Agent': 'ankur.works' },
      body: JSON.stringify({ query: QUERY, variables: { username: USERNAME } }),
    });
    if (!response.ok) throw new Error(`GitHub returned ${response.status}`);
    const result = await response.json();
    if (result.errors?.length || result.data?.viewer?.login !== USERNAME) throw new Error('GitHub identity or query mismatch');
    const collection = result.data.user?.contributionsCollection;
    if (!collection?.contributionCalendar?.weeks) throw new Error('Missing contribution calendar');
    const byRepo = new Map();
    let privateRepositoriesWithCommits = 0;
    let visibleRepositoriesComplete = true;
    for (const entry of collection.commitContributionsByRepository) {
      const perDay = new Map();
      for (const node of [...entry.early.nodes, ...entry.late.nodes]) perDay.set(node.occurredAt.slice(0, 10), node.commitCount);
      if ([...perDay.values()].reduce((sum, count) => sum + count, 0) !== entry.early.totalCount) visibleRepositoriesComplete = false;
      byRepo.set(entry.repository.id, perDay);
      if (entry.repository.isPrivate && perDay.size > 0) privateRepositoriesWithCommits++;
    }
    const daily = new Map();
    let countedCommits = 0;
    for (const repoDays of byRepo.values()) {
      for (const [date, count] of repoDays) {
        daily.set(date, (daily.get(date) || 0) + count);
        countedCommits += count;
      }
    }
    const exactCommits = visibleRepositoriesComplete && countedCommits === collection.totalCommitContributions;
    // read:user reveals private contribution totals, but may withhold the
    // private repository breakdown. Use GitHub's authenticated calendar then;
    // its cells include other contribution types, so label them accordingly.
    const hiddenPrivateCommits = visibleRepositoriesComplete && countedCommits < collection.totalCommitContributions;
    const scope = privateRepositoriesWithCommits > 0 || hiddenPrivateCommits ? 'private-and-public' : 'unverified';
    const calendarDays = collection.contributionCalendar.weeks.flatMap(week => week.contributionDays);
    const counts = exactCommits ? daily : new Map(calendarDays.map(day => [day.date, day.contributionCount]));
    const positive = [...counts.values()].filter(Boolean).sort((a, b) => a - b);
    const high = positive[Math.floor(positive.length * .9)] || 1;
    const contributions = calendarDays.map(({ date }) => ({ date, count: counts.get(date) || 0, level: level(counts.get(date) || 0, high) }));
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=3600');
    return res.status(200).json({
      source: 'github-graphql', metric: exactCommits ? 'commits' : 'contributions', scope,
      generatedAt: new Date().toISOString(),
      totalCommitContributions: collection.totalCommitContributions,
      totalContributions: collection.contributionCalendar.totalContributions,
      contributions,
    });
  } catch (_) {
    return res.status(503).json({ error: 'Authenticated GitHub connection unavailable' });
  }
}
