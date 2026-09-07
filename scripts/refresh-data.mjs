import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { createTrendingBoard, mergeRollingSnapshots, normalizeNewsFeed } from '../src/live-data.js';

/** Public editorial sources that publish an RSS or Atom feed without authentication. */
export const newsSources = [
  { name: 'OpenAI', feedUrl: 'https://openai.com/news/rss.xml' },
  { name: 'GitHub Blog', feedUrl: 'https://github.blog/tag/ai/feed/' },
];

/**
 * Produces a public GitHub Search API URL for recently updated AI repositories.
 * @param {Date} now Collection run timestamp.
 * @returns {string} Search endpoint with stable sort and bounded page size.
 */
export function createGitHubSearchUrl(now) {
  const pushedAfter = new Date(now);
  pushedAfter.setUTCDate(pushedAfter.getUTCDate() - 7);
  const query = `topic:artificial-intelligence pushed:>=${pushedAfter.toISOString().slice(0, 10)} archived:false`;
  const url = new URL('https://api.github.com/search/repositories');
  url.searchParams.set('q', query);
  url.searchParams.set('sort', 'stars');
  url.searchParams.set('order', 'desc');
  url.searchParams.set('per_page', '10');
  return url.toString();
}

/**
 * Reads JSON when a file exists and has valid JSON, otherwise returns null without disturbing old data.
 * @param {string} path Absolute JSON file path.
 * @returns {Promise<unknown | null>} Parsed JSON or null.
 */
async function readJson(path) {
  try {
    return JSON.parse(await readFile(path, 'utf8'));
  } catch {
    return null;
  }
}

/**
 * Writes stable JSON only when its semantic serialized form differs from the existing file.
 * @param {string} path Absolute JSON file path.
 * @param {unknown} data JSON-safe content.
 * @param {boolean} dryRun Whether the caller is validating without persistent writes.
 * @returns {Promise<boolean>} Whether the content would change or has changed.
 */
async function writeJsonIfChanged(path, data, dryRun) {
  const next = `${JSON.stringify(data, null, 2)}\n`;
  let previous = null;
  try {
    previous = await readFile(path, 'utf8');
  } catch {
    // The first successful collection is expected to create the payload.
  }
  if (previous === next) return false;
  if (!dryRun) {
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, next, 'utf8');
  }
  return true;
}

/**
 * Returns only complete prior daily snapshot payloads from the local history directory.
 * @param {string} snapshotDirectory Absolute snapshot directory path.
 * @returns {Promise<Array<{generatedAt: string, items: Array<object>}>>} Valid dated snapshots.
 */
async function readSnapshots(snapshotDirectory) {
  try {
    const names = await readdir(snapshotDirectory);
    const snapshots = await Promise.all(names
      .filter((name) => /^github-\d{4}-\d{2}-\d{2}\.json$/.test(name))
      .map((name) => readJson(join(snapshotDirectory, name))));
    return snapshots.filter((snapshot) => snapshot && Array.isArray(snapshot.items) && snapshot.items.length);
  } catch {
    return [];
  }
}

/**
 * Deduplicates externally collected stories while retaining the newest published article first.
 * @param {Array<object>} current Existing valid payload items.
 * @param {Array<object>} incoming Newly collected stories.
 * @returns {Array<object>} Bounded, newest-first story list.
 */
function mergeNewsItems(current, incoming) {
  const deduplicated = new Map();
  for (const story of [...incoming, ...current]) {
    if (!story?.url || !story?.title) continue;
    const existing = deduplicated.get(story.url);
    if (!existing || Date.parse(story.publishedAt) > Date.parse(existing.publishedAt)) deduplicated.set(story.url, story);
  }
  return [...deduplicated.values()]
    .sort((left, right) => Date.parse(right.publishedAt) - Date.parse(left.publishedAt))
    .slice(0, 48);
}

/**
 * Fetches a feed as text and only returns records that satisfy the shared news contract.
 * @param {(input: string, init?: RequestInit) => Promise<Response>} fetchImpl Configurable fetch for production and tests.
 * @param {{name: string, feedUrl: string}} source Public source configuration.
 * @param {string} generatedAt ISO timestamp for this collection.
 * @returns {Promise<Array<object>>} Normalized stories from a single source.
 */
async function fetchNewsSource(fetchImpl, source, generatedAt) {
  const response = await fetchImpl(source.feedUrl, { headers: { accept: 'application/atom+xml, application/rss+xml, application/xml, text/xml' } });
  if (!response.ok) throw new Error(`${source.name} returned ${response.status}`);
  return normalizeNewsFeed(await response.text(), source.name, source.feedUrl, generatedAt);
}

/**
 * Collects public source data and refreshes generated static payloads without erasing prior valid output.
 * @param {{fetchImpl?: (input: string, init?: RequestInit) => Promise<Response>, now?: Date, rootDir?: string, sources?: Array<{name: string, feedUrl: string}>, dryRun?: boolean}} options Collection dependencies and execution options.
 * @returns {Promise<{changed: boolean, newsCount: number, projectCount: number, errors: string[]}>} Collection result suitable for Actions logs.
 */
export async function runRefresh({ fetchImpl = fetch, now = new Date(), rootDir = process.cwd(), sources = newsSources, dryRun = false } = {}) {
  const generatedAt = now.toISOString();
  const publicDataDirectory = join(rootDir, 'public', 'data');
  const newsPath = join(publicDataDirectory, 'news.json');
  const trendingPath = join(publicDataDirectory, 'trending.json');
  const snapshotDirectory = join(rootDir, 'data', 'snapshots');
  const snapshotPath = join(snapshotDirectory, `github-${generatedAt.slice(0, 10)}.json`);
  const errors = [];
  let changed = false;
  let newsCount = 0;
  let projectCount = 0;

  const sourceResults = await Promise.allSettled(sources.map((source) => fetchNewsSource(fetchImpl, source, generatedAt)));
  const incomingStories = sourceResults.flatMap((result, index) => {
    if (result.status === 'fulfilled') return result.value;
    errors.push(`${sources[index].name}: ${result.reason?.message ?? 'unknown feed error'}`);
    return [];
  });
  if (incomingStories.length) {
    const previousNews = await readJson(newsPath);
    const items = mergeNewsItems(Array.isArray(previousNews?.items) ? previousNews.items : [], incomingStories);
    newsCount = items.length;
    const payload = { generatedAt, sourceLabel: '官方公开 RSS / Atom', items };
    changed = (await writeJsonIfChanged(newsPath, payload, dryRun)) || changed;
  }

  const snapshots = await readSnapshots(snapshotDirectory);
  const dailySnapshot = snapshots.find((snapshot) => snapshot.generatedAt.slice(0, 10) === generatedAt.slice(0, 10));
  if (dailySnapshot) {
    const existingTrending = await readJson(trendingPath);
    projectCount = Array.isArray(existingTrending?.boards?.GitHub?.daily) ? existingTrending.boards.GitHub.daily.length : dailySnapshot.items.length;
  } else {
    try {
      const headers = { accept: 'application/vnd.github+json' };
      if (process.env.GITHUB_TOKEN) headers.authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
      const response = await fetchImpl(createGitHubSearchUrl(now), { headers });
      if (!response.ok) throw new Error(`GitHub returned ${response.status}`);
      const snapshot = createTrendingBoard(await response.json(), generatedAt);
      if (!snapshot.items.length) throw new Error('GitHub returned no valid repositories');
      projectCount = snapshot.items.length;
      changed = (await writeJsonIfChanged(snapshotPath, snapshot, dryRun)) || changed;
      const payload = mergeRollingSnapshots([...snapshots, snapshot], generatedAt);
      changed = (await writeJsonIfChanged(trendingPath, payload, dryRun)) || changed;
    } catch (error) {
      errors.push(`GitHub: ${error instanceof Error ? error.message : 'unknown source error'}`);
    }
  }

  const currentNews = await readJson(newsPath);
  const currentTrending = await readJson(trendingPath);
  return {
    changed,
    newsCount: Array.isArray(currentNews?.items) ? currentNews.items.length : newsCount,
    projectCount: Array.isArray(currentTrending?.boards?.GitHub?.daily) ? currentTrending.boards.GitHub.daily.length : projectCount,
    errors,
  };
}

if (process.argv[1] && new URL(`file://${process.argv[1]}`).href === import.meta.url) {
  const dryRun = process.argv.includes('--dry-run');
  const result = await runRefresh({ dryRun });
  console.log(JSON.stringify(result));
  if (!result.newsCount && !result.projectCount) process.exitCode = 1;
}
