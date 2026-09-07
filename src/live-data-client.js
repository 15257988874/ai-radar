/** Generated data base path that remains valid locally and below a GitHub Pages repository subpath. */
const generatedDataBase = typeof import.meta.env?.BASE_URL === 'string' ? import.meta.env.BASE_URL : '/';

/**
 * Resolves a generated static data file without assuming the site is deployed at the domain root.
 * @param {'news.json' | 'trending.json'} fileName Generated payload file name.
 * @returns {string} Browser-fetchable asset path.
 */
function getGeneratedDataPath(fileName) {
  return `${generatedDataBase.endsWith('/') ? generatedDataBase : `${generatedDataBase}/`}data/${fileName}`;
}

/**
 * Confirms the shared payload metadata is present and readable before replacing bundled content.
 * @param {unknown} payload Candidate decoded JSON payload.
 * @returns {payload is {generatedAt: string, sourceLabel: string}} Whether metadata is valid.
 */
function hasPayloadMetadata(payload) {
  return Boolean(
    payload
    && typeof payload === 'object'
    && typeof payload.generatedAt === 'string'
    && !Number.isNaN(Date.parse(payload.generatedAt))
    && typeof payload.sourceLabel === 'string'
    && payload.sourceLabel.trim(),
  );
}

/**
 * Checks the fields required by existing news cards and source-link dialogs.
 * @param {unknown} story Candidate generated news item.
 * @returns {boolean} Whether the story is safe to render.
 */
function isNewsStory(story) {
  return Boolean(
    story
    && typeof story === 'object'
    && ['id', 'title', 'summary', 'source', 'time', 'theme', 'url', 'publishedAt'].every((key) => typeof story[key] === 'string' && story[key].trim())
    && !Number.isNaN(Date.parse(story.publishedAt)),
  );
}

/**
 * Checks the fields required by existing direct-link ranking rows.
 * @param {unknown} project Candidate generated board project.
 * @returns {boolean} Whether the project is safe to render.
 */
function isTrendProject(project) {
  return Boolean(
    project
    && typeof project === 'object'
    && ['name', 'description', 'language', 'stars', 'change', 'url'].every((key) => typeof project[key] === 'string' && project[key].trim()),
  );
}

/**
 * Fetches and validates a generated static payload, retaining caller-controlled fallback on any failure.
 * @template T
 * @param {string} path Generated public JSON path.
 * @param {(payload: unknown) => payload is T} validator Payload contract validator.
 * @param {(input: string, init?: RequestInit) => Promise<Response>} fetchImpl Browser fetch implementation.
 * @returns {Promise<{data: T | null, generatedAt: string | null, sourceLabel: string | null}>} Valid data and metadata, or an explicit null fallback state.
 */
async function loadGeneratedPayload(path, validator, fetchImpl) {
  try {
    const response = await fetchImpl(path, { headers: { accept: 'application/json' } });
    if (!response.ok) throw new Error(`Generated data returned ${response.status}`);
    const payload = await response.json();
    if (!validator(payload)) throw new Error('Generated data failed schema validation');
    return { data: payload, generatedAt: payload.generatedAt, sourceLabel: payload.sourceLabel };
  } catch {
    return { data: null, generatedAt: null, sourceLabel: null };
  }
}

/**
 * Loads server-generated news if it satisfies the published data contract.
 * @param {(input: string, init?: RequestInit) => Promise<Response>} fetchImpl Browser fetch implementation.
 * @returns {Promise<{data: {generatedAt: string, sourceLabel: string, items: Array<object>} | null, generatedAt: string | null, sourceLabel: string | null}>} Live news or explicit bundled-data fallback state.
 */
export function loadLiveNews(fetchImpl = fetch) {
  return loadGeneratedPayload(getGeneratedDataPath('news.json'), (payload) => (
    hasPayloadMetadata(payload)
    && Array.isArray(payload.items)
    && payload.items.length > 0
    && payload.items.every(isNewsStory)
  ), fetchImpl);
}

/**
 * Loads the generated GitHub board only when all visible time windows have valid array shapes.
 * @param {(input: string, init?: RequestInit) => Promise<Response>} fetchImpl Browser fetch implementation.
 * @returns {Promise<{data: {generatedAt: string, sourceLabel: string, boards: {GitHub: {daily: Array<object>, weekly: Array<object>, monthly: Array<object>}}} | null, generatedAt: string | null, sourceLabel: string | null}>} Live board or explicit bundled-data fallback state.
 */
export function loadLiveTrending(fetchImpl = fetch) {
  return loadGeneratedPayload(getGeneratedDataPath('trending.json'), (payload) => {
    const githubBoard = payload?.boards?.GitHub;
    return hasPayloadMetadata(payload)
      && githubBoard
      && ['daily', 'weekly', 'monthly'].every((window) => Array.isArray(githubBoard[window]))
      && githubBoard.daily.length > 0
      && githubBoard.daily.every(isTrendProject)
      && githubBoard.weekly.every(isTrendProject)
      && githubBoard.monthly.every(isTrendProject);
  }, fetchImpl);
}

/**
 * Presents an ISO generation timestamp in the site's Chinese reader locale.
 * @param {string | null} generatedAt Generated payload timestamp.
 * @returns {string} Compact timestamp or an empty string for absent metadata.
 */
export function formatGeneratedAt(generatedAt) {
  if (!generatedAt || Number.isNaN(Date.parse(generatedAt))) return '';
  return new Intl.DateTimeFormat('zh-CN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Shanghai',
  }).format(new Date(generatedAt));
}
