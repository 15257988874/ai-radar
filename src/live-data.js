import { XMLParser } from 'fast-xml-parser';

/**
 * Converts one-or-many XML values into an array for uniform feed traversal.
 * @template T
 * @param {T | T[] | null | undefined} value XML value emitted by the parser.
 * @returns {T[]} Values in array form.
 */
function asArray(value) {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
}

/**
 * Reads text from RSS or Atom scalar/object nodes without exposing parser-specific shapes.
 * @param {unknown} value Feed node value.
 * @returns {string} Trimmed text content or an empty string.
 */
function readText(value) {
  if (typeof value === 'string' || typeof value === 'number') return String(value).trim();
  if (!value || typeof value !== 'object') return '';
  const node = /** @type {Record<string, unknown>} */ (value);
  return String(node['#text'] ?? node.__cdata ?? node['@_value'] ?? '').trim();
}

/**
 * Extracts a reader-safe plain-text summary from mixed feed description content.
 * @param {unknown} value Feed summary or content node.
 * @returns {string} Collapsed plain-text summary.
 */
function cleanSummary(value) {
  return readText(value).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Removes tracking fragments and normalizes terminal slashes so duplicate feed entries share one key.
 * @param {unknown} value Candidate URL from a source feed.
 * @returns {string | null} Canonical public URL, or null when the value is not an absolute HTTP URL.
 */
export function canonicalUrl(value) {
  try {
    const url = new URL(readText(value));
    if (!['http:', 'https:'].includes(url.protocol)) return null;
    url.hash = '';
    for (const key of [...url.searchParams.keys()]) {
      if (key.startsWith('utm_')) url.searchParams.delete(key);
    }
    url.search = url.searchParams.toString();
    if (url.pathname.length > 1) url.pathname = url.pathname.replace(/\/+$/, '');
    return url.toString();
  } catch {
    return null;
  }
}

/**
 * Creates a stable compact key from an externally supplied canonical URL.
 * @param {string} value Canonical public URL.
 * @returns {string} Stable browser-safe identifier.
 */
function createStableId(value) {
  let hash = 2166136261;
  for (const character of value) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return `live-${(hash >>> 0).toString(36)}`;
}

/**
 * Reads an Atom link node by preferring its alternate/href target over text fallback.
 * @param {unknown} value Atom link node.
 * @returns {string | null} Canonical article URL when available.
 */
function readAtomLink(value) {
  for (const item of asArray(value)) {
    if (!item || typeof item !== 'object') continue;
    const link = /** @type {Record<string, unknown>} */ (item);
    if (link['@_rel'] && link['@_rel'] !== 'alternate') continue;
    const url = canonicalUrl(link['@_href'] ?? link['#text']);
    if (url) return url;
  }
  return canonicalUrl(value);
}

/**
 * Reads RSS items or Atom entries from an XML feed document.
 * @param {string} xml XML response body.
 * @returns {Array<Record<string, unknown>>} Parsed article nodes.
 */
function parseFeedEntries(xml) {
  const parser = new XMLParser({
    ignoreAttributes: false,
    parseTagValue: false,
    trimValues: true,
  });
  const feed = parser.parse(xml);
  const rssChannel = feed?.rss?.channel;
  const rssItems = asArray(rssChannel?.item);
  if (rssItems.length) return rssItems;
  return asArray(feed?.feed?.entry);
}

/**
 * Normalizes a public RSS or Atom response into reader-facing news stories.
 * @param {string} xml Public RSS/Atom response body.
 * @param {string} sourceName Publisher label rendered to readers.
 * @param {string} sourceUrl Public publisher feed URL for traceability.
 * @param {string} generatedAt ISO timestamp for this collection run.
 * @returns {Array<{id: string, type: string, title: string, summary: string, source: string, time: string, theme: string, url: string, publishedAt: string, sourceUrl: string, generatedAt: string}>} Valid, duplicate-free stories.
 */
export function normalizeNewsFeed(xml, sourceName, sourceUrl, generatedAt) {
  try {
    const seenUrls = new Set();
    return parseFeedEntries(xml).flatMap((entry) => {
      const title = readText(entry.title);
      const url = readAtomLink(entry.link);
      const publishedAtValue = readText(entry.pubDate ?? entry.published ?? entry.updated);
      const publishedAt = new Date(publishedAtValue).toISOString();
      if (!title || !url || seenUrls.has(url) || Number.isNaN(Date.parse(publishedAt))) return [];
      seenUrls.add(url);
      return [{
        id: createStableId(url),
        type: '官方更新',
        title,
        summary: cleanSummary(entry.description ?? entry.summary ?? entry.content) || '查看官方发布内容与完整说明。',
        source: sourceName,
        time: '最新收录',
        theme: 'official',
        url,
        publishedAt,
        sourceUrl,
        generatedAt,
      }];
    });
  } catch {
    return [];
  }
}

/**
 * Formats an integer popularity count for existing reader-facing board cards.
 * @param {unknown} value GitHub star count.
 * @returns {string} Compact lower-case count label.
 */
function formatStars(value) {
  const count = Number(value);
  if (!Number.isFinite(count) || count < 0) return '0';
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(count).replace('K', 'k').replace('M', 'm');
}

/**
 * Converts a GitHub Search API response into a validated daily board snapshot.
 * @param {{ items?: Array<Record<string, unknown>> }} response Public GitHub repository search response.
 * @param {string} generatedAt ISO timestamp for the snapshot.
 * @returns {{generatedAt: string, items: Array<{name: string, description: string, language: string, stars: string, change: string, url: string}>}} Daily direct-link board snapshot.
 */
export function createTrendingBoard(response, generatedAt) {
  const seenUrls = new Set();
  const items = asArray(response?.items).flatMap((repository) => {
    const url = canonicalUrl(repository.html_url);
    const name = readText(repository.full_name);
    if (!url || !name || seenUrls.has(url)) return [];
    seenUrls.add(url);
    return [{
      name,
      description: readText(repository.description) || '暂无项目说明。',
      language: readText(repository.language) || '其他',
      stars: formatStars(repository.stargazers_count),
      change: '今日入榜',
      url,
    }];
  }).slice(0, 10);
  return { generatedAt, items };
}

/**
 * Computes a rolling board by ranking repositories by distinct snapshot-day appearances, then current stars.
 * @param {Array<{generatedAt: string, items: Array<{name: string, description: string, language: string, stars: string, change: string, url: string}>}>} snapshots Ordered or unordered daily board snapshots.
 * @param {number} dayCount Number of consecutive calendar days included in the board.
 * @returns {Array<{name: string, description: string, language: string, stars: string, change: string, url: string}>} Aggregated board rows.
 */
function aggregateRollingBoard(snapshots, dayCount) {
  const grouped = new Map();
  for (const snapshot of snapshots) {
    const day = snapshot.generatedAt.slice(0, 10);
    for (const project of snapshot.items) {
      const existing = grouped.get(project.url) ?? { ...project, days: new Set(), starsValue: 0 };
      existing.days.add(day);
      existing.starsValue = Math.max(existing.starsValue, Number(project.stars.replace(/[^\d.]/g, '')) || 0);
      grouped.set(project.url, existing);
    }
  }
  return [...grouped.values()]
    .sort((left, right) => right.days.size - left.days.size || right.starsValue - left.starsValue || left.name.localeCompare(right.name))
    .slice(0, 10)
    .map(({ days, starsValue, ...project }) => ({ ...project, change: `近${dayCount}日入榜 ${days.size} 天` }));
}

/**
 * Builds the reader payload for daily, weekly, and monthly GitHub API heat boards.
 * @param {Array<{generatedAt: string, items: Array<{name: string, description: string, language: string, stars: string, change: string, url: string}>}>} snapshots Daily snapshots from local history.
 * @param {string} generatedAt ISO timestamp for this generated payload.
 * @returns {{generatedAt: string, sourceLabel: string, boards: {GitHub: {daily: Array<object>, weekly: Array<object>, monthly: Array<object>}}}} Reader payload for the ranking route.
 */
export function mergeRollingSnapshots(snapshots, generatedAt) {
  const sortedSnapshots = snapshots
    .filter((snapshot) => snapshot && Array.isArray(snapshot.items) && snapshot.items.length && !Number.isNaN(Date.parse(snapshot.generatedAt)))
    .sort((left, right) => Date.parse(right.generatedAt) - Date.parse(left.generatedAt));
  const daily = sortedSnapshots[0]?.items ?? [];
  return {
    generatedAt,
    sourceLabel: 'GitHub API 公开仓库搜索',
    boards: {
      GitHub: {
        daily,
        weekly: aggregateRollingBoard(sortedSnapshots.slice(0, 7), 7),
        monthly: aggregateRollingBoard(sortedSnapshots.slice(0, 30), 30),
      },
    },
  };
}
