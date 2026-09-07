<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { trendingBoards } from '../catalog.js';
import { formatGeneratedAt, loadLiveTrending } from '../live-data-client.js';
import { resolveStoredTheme } from '../theme.js';

/** Shared storage key for the two visual themes. */
const themeStorageKey = 'ai-radar-theme-preference';
/** Source site selected in the open-source trend board. */
const activeSource = ref('GitHub');
/** Time window selected for the current source board. */
const activeWindow = ref('daily');
/** Keyword applied to repository names, languages, and summaries. */
const query = ref('');
/** Current reader theme. */
const theme = ref('light');
/** Whether the fixed return control is visible. */
const canReturnToTop = ref(false);
/** Input exposed through Cmd/Ctrl+K. */
const searchInput = ref(null);
/** Router used to navigate between top-level discovery pages. */
const router = useRouter();
/** Current board set, with generated GitHub data merged over the bundled multi-source baseline. */
const currentBoards = ref(trendingBoards);
/** Generated GitHub board metadata, absent whenever the bundled baseline is in use. */
const liveTrendingMetadata = ref(null);

/** Available open-source trend sources. */
const sources = computed(() => Object.keys(currentBoards.value));
/** Time-window controls expressed as display label and stable data key. */
const windows = [
  { key: 'daily', label: '日榜', sublabel: '24H 热度' },
  { key: 'weekly', label: '周榜', sublabel: '7D 增长' },
  { key: 'monthly', label: '月榜', sublabel: '30D 趋势' },
];

/**
 * Filters the selected source/time board by the reader-entered keyword.
 * @returns {import('../catalog.js').TrendProject[]} Direct-link projects in the active board.
 */
const visibleProjects = computed(() => {
  const normalizedQuery = query.value.trim().toLocaleLowerCase('zh-CN');
  const projects = currentBoards.value[activeSource.value]?.[activeWindow.value] ?? [];
  if (!normalizedQuery) return projects;
  return projects.filter((project) => `${project.name} ${project.language} ${project.description}`.toLocaleLowerCase('zh-CN').includes(normalizedQuery));
});

/**
 * Applies and persists a theme choice shared with all discovery routes.
 * @param {'light' | 'dark'} nextTheme Requested reader theme.
 * @returns {void}
 */
function applyTheme(nextTheme) {
  theme.value = nextTheme;
  document.documentElement.dataset.theme = nextTheme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', nextTheme === 'dark' ? '#071216' : '#eff8fa');
  window.localStorage.setItem(themeStorageKey, nextTheme);
}

/** Switches between the two supported reader themes. @returns {void} */
function toggleTheme() {
  applyTheme(theme.value === 'dark' ? 'light' : 'dark');
}

/** Restores the explicit theme choice or the approved light default. @returns {void} */
function restoreTheme() {
  applyTheme(resolveStoredTheme(window.localStorage.getItem(themeStorageKey)));
}

/**
 * Changes the selected trend source and retains the selected period for fast comparison.
 * @param {string} source Open-source discovery source.
 * @returns {void}
 */
function selectSource(source) {
  activeSource.value = source;
}

/**
 * Changes the activity period rendered in the current source board.
 * @param {'daily' | 'weekly' | 'monthly'} windowKey Selected trend time window.
 * @returns {void}
 */
function selectWindow(windowKey) {
  activeWindow.value = windowKey;
}

/**
 * Replaces only the GitHub seed board after generated data passes client-side validation.
 * @returns {Promise<void>} Resolves after the public board request settles.
 */
async function hydrateLiveTrending() {
  const result = await loadLiveTrending();
  if (!result.data) return;
  currentBoards.value = { ...trendingBoards, GitHub: result.data.boards.GitHub };
  liveTrendingMetadata.value = { generatedAt: result.generatedAt, sourceLabel: result.sourceLabel };
}

/**
 * Routes to a top-level discovery destination through browser history.
 * @param {string} destination Target path.
 * @returns {void}
 */
function navigate(destination) {
  router.push(destination);
}

/** Updates visibility for the return-to-top action. @returns {void} */
function updateScrollUi() {
  canReturnToTop.value = window.scrollY > 360;
}

/** Returns to the board masthead while honoring motion preferences. @returns {void} */
function returnToTop() {
  window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
}

/**
 * Focuses the board search field for Cmd/Ctrl+K without interfering with ordinary typing.
 * @param {KeyboardEvent} event Browser keyboard event.
 * @returns {void}
 */
function handleKeyboardShortcut(event) {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    searchInput.value?.focus();
  }
}

/** Initializes shared visual state and route-local event listeners. */
onMounted(() => {
  restoreTheme();
  updateScrollUi();
  void hydrateLiveTrending();
  window.addEventListener('scroll', updateScrollUi, { passive: true });
  window.addEventListener('keydown', handleKeyboardShortcut);
});

/** Clears route-local listeners during navigation and HMR. */
onBeforeUnmount(() => {
  window.removeEventListener('scroll', updateScrollUi);
  window.removeEventListener('keydown', handleKeyboardShortcut);
});
</script>

<template>
  <header class="topbar site-header ranking-header">
    <div class="wrap shell topbar-inner header-inner">
      <button class="brand focus-ring" type="button" aria-label="AI Radar 首页" @click="navigate('/')"><span class="brand-mark" aria-hidden="true">✦</span><span>AI Radar</span></button>
      <nav class="site-nav main-nav" aria-label="主导航"><button class="focus-ring" type="button" @click="navigate('/news')">资讯</button><button class="focus-ring" type="button" @click="navigate('/tools')">工具</button><button class="focus-ring" type="button" @click="navigate('/opensource')">开源</button><button class="focus-ring is-active" type="button" aria-current="page">榜单</button></nav>
      <div class="actions header-actions"><label class="search-box" for="ranking-search"><span class="search-icon search-symbol" aria-hidden="true">⌕</span><input id="ranking-search" ref="searchInput" v-model="query" type="search" placeholder="搜索仓库、语言、项目" autocomplete="off" /><kbd>⌘ K</kbd><button v-if="query" class="focus-ring" type="button" aria-label="清空榜单搜索" @click="query = ''">×</button></label><button class="theme-switch theme-toggle focus-ring" type="button" role="switch" :aria-checked="theme === 'dark'" :aria-label="theme === 'dark' ? '切换到浅色主题' : '切换到深色主题'" @click="toggleTheme"><span class="theme-orbit" aria-hidden="true"><span class="theme-sun">☼</span><span class="theme-moon">◐</span></span></button></div>
    </div>
  </header>

  <main class="ranking-page">
    <section class="ranking-masthead"><div class="wrap shell ranking-masthead-inner"><p class="eyebrow">OPEN SOURCE INTELLIGENCE</p><h1>开源趋势榜</h1><p>按日、周、月查看 GitHub 与模型社区的项目热度，直接进入仓库、模型页或项目主页。</p></div></section>
    <section class="ranking-feed-section" aria-labelledby="ranking-board-title"><div class="wrap shell"><div class="ranking-board-heading"><div><p class="eyebrow">TRENDING PROJECTS</p><h2 id="ranking-board-title">正在上升的开源项目</h2></div><div class="data-status"><p class="result-count">{{ activeSource }} · {{ visibleProjects.length }} 个项目</p><p v-if="liveTrendingMetadata" class="data-freshness">{{ liveTrendingMetadata.sourceLabel }} · 更新于 {{ formatGeneratedAt(liveTrendingMetadata.generatedAt) }}</p></div></div>
      <div class="ranking-source-tabs" role="tablist" aria-label="开源趋势来源"><button v-for="source in sources" :key="source" class="focus-ring" type="button" role="tab" :aria-selected="activeSource === source" :class="{ 'is-active': activeSource === source }" @click="selectSource(source)"><span class="source-symbol" aria-hidden="true">{{ source === 'GitHub' ? '◉' : source === 'Hugging Face' ? 'HF' : 'MS' }}</span>{{ source }}</button></div>
      <div class="ranking-window-tabs" role="tablist" aria-label="趋势时间范围"><button v-for="window in windows" :key="window.key" class="focus-ring" type="button" role="tab" :aria-selected="activeWindow === window.key" :class="{ 'is-active': activeWindow === window.key }" @click="selectWindow(window.key)"><strong>{{ window.label }}</strong><span>{{ window.sublabel }}</span></button></div>
      <div v-if="visibleProjects.length" class="trend-list" aria-live="polite"><a v-for="(project, index) in visibleProjects" :key="`${activeSource}-${activeWindow}-${project.name}`" class="trend-row focus-ring" :href="project.url" target="_blank" rel="noreferrer"><span class="trend-rank">{{ String(index + 1).padStart(2, '0') }}</span><span class="trend-project"><strong>{{ project.name }}</strong><small>{{ project.description }}</small></span><span class="trend-language">{{ project.language }}</span><span class="trend-stars">★ {{ project.stars }}</span><span class="trend-change">{{ project.change }}</span><span class="trend-arrow" aria-hidden="true">↗</span></a></div>
      <div v-else class="news-empty-state"><span aria-hidden="true">⌕</span><h3>没有匹配的开源项目</h3><p>试试仓库名称、语言或更短的关键词。</p><button class="directory-toggle focus-ring" type="button" @click="query = ''">清除搜索</button></div>
    </div></section>
  </main>
  <footer class="footer site-footer"><div class="wrap shell footer-inner"><div><button class="brand brand--footer focus-ring" type="button" @click="navigate('/')"><span class="brand-mark" aria-hidden="true">✦</span><span>AI Radar</span></button><p>面向中文用户的 AI 资讯、工具与开源项目发现站。</p></div><div class="source-list"><span>GitHub</span><span>Hugging Face</span><span>ModelScope</span></div></div></footer>
  <button class="back-to-top focus-ring" :class="{ 'is-visible': canReturnToTop }" type="button" aria-label="返回顶部" title="返回顶部" @click="returnToTop"><span aria-hidden="true">↑</span></button>
</template>
