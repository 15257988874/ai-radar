<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { catalog, featuredStories, searchCatalog } from '../catalog.js';
import { formatGeneratedAt, loadLiveNews } from '../live-data-client.js';
import { resolveStoredTheme } from '../theme.js';

/** Primary navigation sections and their corresponding page anchors. */
const navigation = [
  { label: '资讯', target: 'news' },
  { label: '工具', target: 'tools' },
  { label: '开源', target: 'opensource' },
  { label: '榜单', target: 'ranking' },
];

/** Reader-facing scenario filters shown only inside the resource directory. */
const categories = ['全部', '对话与写作', '图像与视频', '开发与自动化', '模型与平台'];

/** Dedicated storage key that prevents the retired prototype theme state from changing the Vue application's first visit. */
const themeStorageKey = 'ai-radar-theme-preference';

/** Query entered in the global search field. */
const query = ref('');
/** Current scenario filter for the tool directory. */
const activeCategory = ref('全部');
/** Whether the reader has explicitly expanded the full resource directory. */
const isDirectoryExpanded = ref(false);
/** Current primary-navigation state, updated by direct reader intent. */
const activeNavigation = ref('news');
/** Explicit theme choice persisted for the reader's next visit. */
const theme = ref('light');
/** Fraction of total page reading distance already covered by the reader. */
const readingProgress = ref(0);
/** Whether the fixed return control should be interactable. */
const canReturnToTop = ref(false);
/** Search input element used by the global keyboard shortcut. */
const searchInput = ref(null);
/** Resource currently opened in the contextual detail dialog. */
const selectedResource = ref(null);
/** Generated live-news payload when the public JSON contract is available. */
const liveNewsPayload = ref(null);

/**
 * Prefers the current public feed for the landing-page editorial preview without removing its seed fallback.
 * @returns {Array<object>} Three reader-facing stories for the homepage.
 */
const featuredNews = computed(() => (liveNewsPayload.value?.items ?? featuredStories).slice(0, 3));

/** Latest successful public news generation time for transparent reader context. */
const liveNewsGeneratedAt = computed(() => liveNewsPayload.value?.generatedAt ?? null);

/**
 * Filters search results by the selected scenario after keyword matching has completed.
 * @returns {import('./catalog.js').CatalogItem[]} Resources visible in the current directory state.
 */
const visibleResources = computed(() => searchCatalog(query.value).filter((item) => (
  activeCategory.value === '全部' || item.category === activeCategory.value
)));

/**
 * Limits the default landing-page directory to curated highlights while preserving full results for reader intent.
 * @returns {import('./catalog.js').CatalogItem[]} Resource cards to render in the current directory state.
 */
const displayedResources = computed(() => {
  const hasExplicitDirectoryIntent = query.value.trim() || activeCategory.value !== '全部';

  if (isDirectoryExpanded.value || hasExplicitDirectoryIntent) return visibleResources.value;

  return visibleResources.value.slice(0, 6);
});

/**
 * Indicates that the landing-page preview hides additional resources that can be explicitly expanded.
 * @returns {boolean} Whether the directory expansion control should be rendered.
 */
const hasHiddenResources = computed(() => (
  !query.value.trim()
  && activeCategory.value === '全部'
  && visibleResources.value.length > displayedResources.value.length
));

/**
 * Produces the reader-facing count summary for current search or category results.
 * @returns {string} Accessible summary displayed beside the resource heading.
 */
const resourceCount = computed(() => (
  query.value.trim()
    ? `“${query.value.trim()}” 找到 ${visibleResources.value.length} 个资源`
    : activeCategory.value !== '全部'
      ? `${activeCategory.value} · ${visibleResources.value.length} 个资源`
      : isDirectoryExpanded.value
        ? `共 ${visibleResources.value.length} 个资源`
        : `精选 ${displayedResources.value.length} 个资源`
));

/**
 * Selects a section, updates navigation emphasis, and scrolls below the sticky header.
 * @param {string} targetId ID of the destination section.
 * @returns {void}
 */
function scrollToSection(targetId) {
  activeNavigation.value = targetId;
  document.querySelector(`#${targetId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * Moves attention to the tools section after a reader starts a global resource search.
 * @returns {void}
 */
function handleSearch() {
  if (query.value.trim()) {
    isDirectoryExpanded.value = true;
    scrollToSection('tools');
  }
}

/**
 * Clears the active search while retaining its current scenario filter for a quick comparison.
 * @returns {void}
 */
function clearSearch() {
  query.value = '';
  isDirectoryExpanded.value = false;
  searchInput.value?.focus();
}

/**
 * Applies a scenario filter while preserving the compact landing-page preview for the unfiltered directory.
 * @param {string} category Reader-selected resource scenario.
 * @returns {void}
 */
function selectCategory(category) {
  activeCategory.value = category;
  isDirectoryExpanded.value = category !== '全部';
}

/**
 * Toggles the expanded resource directory without changing the active search or scenario filter.
 * @returns {void}
 */
function toggleResourceDirectory() {
  isDirectoryExpanded.value = !isDirectoryExpanded.value;
}

/**
 * Applies an explicit palette to the document and persists it for subsequent visits.
 * @param {'light' | 'dark'} nextTheme Theme selected by the reader.
 * @returns {void}
 */
function applyTheme(nextTheme) {
  theme.value = nextTheme;
  document.documentElement.dataset.theme = nextTheme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', nextTheme === 'dark' ? '#071216' : '#eff8fa');
  window.localStorage.setItem(themeStorageKey, nextTheme);
}

/**
 * Toggles the only two supported visual themes.
 * @returns {void}
 */
function toggleTheme() {
  applyTheme(theme.value === 'dark' ? 'light' : 'dark');
}

/**
 * Restores a saved palette or uses system preference only for a reader's first visit.
 * @returns {void}
 */
function restoreTheme() {
  const savedTheme = window.localStorage.getItem(themeStorageKey);
  applyTheme(resolveStoredTheme(savedTheme));
}

/**
 * Opens a concise resource detail view without removing the reader from their current discovery context.
 * @param {import('./catalog.js').CatalogItem} resource Resource selected from a directory card or open-source row.
 * @returns {void}
 */
function openResource(resource) {
  selectedResource.value = resource;
}

/**
 * Closes the resource detail view and restores reading focus to the directory.
 * @returns {void}
 */
function closeResource() {
  selectedResource.value = null;
}

/**
 * Synchronizes reading progress and return-control visibility to the current scroll distance.
 * @returns {void}
 */
function updateScrollUi() {
  const maximumScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
  readingProgress.value = Math.min(window.scrollY / maximumScroll, 1);
  canReturnToTop.value = window.scrollY > 460;
}

/**
 * Returns the reader to the top while respecting operating-system motion preferences.
 * @returns {void}
 */
function returnToTop() {
  window.scrollTo({
    top: 0,
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
  });
}

/**
 * Gives the global search field a familiar Cmd/Ctrl+K entry point without intercepting other typing.
 * @param {KeyboardEvent} event Browser keyboard event.
 * @returns {void}
 */
function handleKeyboardShortcut(event) {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    searchInput.value?.focus();
  }
}

/**
 * Hydrates homepage editorial highlights from generated data while preserving seed stories on failure.
 * @returns {Promise<void>} Resolves after the non-blocking public data request settles.
 */
async function hydrateLiveNews() {
  const result = await loadLiveNews();
  if (result.data) liveNewsPayload.value = result.data;
}

/**
 * Reveals a visual block only after it enters the viewport, respecting reduced-motion settings.
 * @type {import('vue').ObjectDirective}
 */
const vReveal = {
  mounted(element) {
    element.dataset.reveal = '';
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      element.classList.add('is-visible');
      return;
    }
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        currentObserver.unobserve(entry.target);
      });
    }, { threshold: 0.14 });
    observer.observe(element);
    element._revealObserver = observer;
  },
  unmounted(element) {
    element._revealObserver?.disconnect();
  },
};

/** Sets up persistent visual state and event listeners when the Vue root becomes interactive. */
onMounted(() => {
  restoreTheme();
  updateScrollUi();
  void hydrateLiveNews();
  window.addEventListener('scroll', updateScrollUi, { passive: true });
  window.addEventListener('keydown', handleKeyboardShortcut);
});

/** Releases page-level listeners when Vue unmounts, preventing stale handlers during HMR. */
onBeforeUnmount(() => {
  window.removeEventListener('scroll', updateScrollUi);
  window.removeEventListener('keydown', handleKeyboardShortcut);
});
</script>

<template>
  <div class="reading-progress" :style="{ '--progress': readingProgress }" aria-hidden="true"></div>

  <header class="topbar site-header">
    <div class="wrap shell topbar-inner header-inner">
      <a class="brand" href="#top" aria-label="AI Radar 首页"><span class="brand-mark" aria-hidden="true">✦</span><span>AI Radar</span></a>
      <nav class="site-nav main-nav" aria-label="主导航">
        <button
          v-for="item in navigation"
          :key="item.target"
          class="focus-ring"
          :class="{ 'is-active': activeNavigation === item.target }"
          type="button"
          @click="scrollToSection(item.target)"
        >{{ item.label }}</button>
      </nav>
      <div class="actions header-actions flex items-center">
        <label class="search-box" for="site-search">
          <span class="search-icon search-symbol" aria-hidden="true">⌕</span>
          <input id="site-search" ref="searchInput" v-model="query" type="search" placeholder="搜索资讯、工具、项目" autocomplete="off" @input="handleSearch" />
          <kbd>⌘ K</kbd>
          <button v-if="query" class="focus-ring" type="button" aria-label="清空搜索" @click="clearSearch">×</button>
        </label>
        <button class="theme-switch theme-toggle focus-ring" type="button" role="switch" :aria-checked="theme === 'dark'" :aria-label="theme === 'dark' ? '切换到浅色主题' : '切换到深色主题'" @click="toggleTheme">
          <span class="theme-orbit" aria-hidden="true"><span class="theme-sun">☼</span><span class="theme-moon">◐</span></span>
        </button>
      </div>
    </div>
  </header>

  <main id="top">
    <section class="signal-hero" aria-labelledby="hero-title">
      <span class="signal-node signal-node--left" aria-hidden="true"></span>
      <span class="signal-node signal-node--right" aria-hidden="true"></span>
      <div class="wrap shell hero-inner">
        <div class="hero-meta"><span><b>01</b> AI 情报雷达</span><span>精选聚合 · 持续收录</span></div>
        <h1 id="hero-title" class="hero-brand"><span class="hero-ai">AI</span><span class="hero-radar">RADAR</span></h1>
        <p class="hero-slogan">发现真正值得关注的 AI 变化。</p>
        <p class="hero-baseline">EXPLORE THE NEXT SIGNAL</p>
      </div>
    </section>

    <section id="news" class="content-band top-stories news-section" aria-labelledby="news-title">
      <div class="wrap shell">
        <div v-reveal class="section-head section-heading">
          <div><p class="eyebrow">TOP STORY</p><h2 id="news-title">值得先看的内容</h2><p v-if="liveNewsGeneratedAt" class="data-freshness">公开源更新于 {{ formatGeneratedAt(liveNewsGeneratedAt) }}</p></div>
          <button class="text-link focus-ring" type="button" @click="scrollToSection('ranking')">浏览全部资讯 <span aria-hidden="true">→</span></button>
        </div>
        <div class="story-grid editorial-grid">
          <article v-reveal class="feature-card feature-story surface-transition">
            <span class="feature-label">本周焦点 · {{ featuredNews[0].type }}</span>
            <h3>{{ featuredNews[0].title }}</h3>
            <p>{{ featuredNews[0].summary }}</p>
          </article>
          <aside class="rail breaking-rail" aria-label="正在发生的资讯">
            <div class="rail-head breaking-head"><b>正在发生</b><button class="text-link focus-ring" type="button" @click="scrollToSection('ranking')">全部资讯 <span aria-hidden="true">→</span></button></div>
            <article v-for="(story, index) in featuredNews.slice(1)" :key="story.title" v-reveal class="rail-card breaking-card surface-transition" :style="{ '--reveal-delay': `${index * 100}ms` }">
              <p class="eyebrow">{{ story.type }}</p><h3>{{ story.title }}</h3><p>{{ story.source }} · {{ story.time }}</p>
            </article>
          </aside>
        </div>
      </div>
    </section>

    <section id="tools" class="content-band tools tools-section" aria-labelledby="tools-title">
      <div class="wrap shell">
        <div v-reveal class="section-head section-heading section-heading--resources">
          <div><p class="eyebrow">TOOL DIRECTORY</p><h2 id="tools-title">按场景找到合适的 AI 工具</h2></div>
          <p class="result-count" aria-live="polite">{{ resourceCount }}</p>
        </div>
        <div v-reveal class="category-bar" role="tablist" aria-label="工具场景分类">
              <button v-for="category in categories" :key="category" class="focus-ring" type="button" role="tab" :aria-selected="activeCategory === category" :class="{ 'is-active': activeCategory === category }" @click="selectCategory(category)">{{ category }}</button>
            </div>
            <div class="tool-grid resource-grid" aria-live="polite">
          <button v-for="item in displayedResources" :key="item.id" v-reveal class="tool-card resource-card surface-transition focus-ring" type="button" :aria-label="`查看 ${item.name} 详情`" @click="openResource(item)">
            <div class="resource-head"><span class="resource-icon" :class="`resource-icon--${item.accent}`" aria-hidden="true">{{ item.label }}</span><span class="resource-kind">{{ item.kind }}</span></div>
            <div class="resource-copy"><p class="resource-category">{{ item.category }}</p><h3>{{ item.name }}</h3><p>{{ item.description }}</p></div>
            <footer><span class="heat-dot" aria-hidden="true"></span><span>{{ item.metric }}</span><span class="resource-arrow" aria-hidden="true">↗</span></footer>
          </button>
              <div v-if="visibleResources.length === 0" class="empty-state"><span aria-hidden="true">⌕</span><p>没有匹配的资源，试试更短的关键词。</p></div>
            </div>
            <div v-if="hasHiddenResources || (isDirectoryExpanded && !query && activeCategory === '全部')" class="resource-directory-action">
              <button class="directory-toggle focus-ring" type="button" @click="toggleResourceDirectory">{{ isDirectoryExpanded ? '收起完整目录' : '查看完整目录' }} <span aria-hidden="true">{{ isDirectoryExpanded ? '↑' : '↓' }}</span></button>
            </div>
          </div>
        </section>

    <section id="opensource" class="content-band open-source-section" aria-labelledby="opensource-title">
      <div class="wrap shell split-layout">
        <div v-reveal class="open-source-copy"><p class="eyebrow">OPEN SOURCE WATCH</p><div class="open-source-title-row"><h2 id="opensource-title">本周值得上手的开源项目</h2><span aria-hidden="true">04 / SIGNAL</span></div><p>关注可复用的 Skill、可连接的 MCP、可落地的 Agent 框架与本地模型工具。每个项目都以清楚的用途和热度信号呈现。</p><button class="text-action focus-ring" type="button" @click="scrollToSection('tools')">浏览完整资源目录 <span aria-hidden="true">→</span></button></div>
        <div v-reveal class="project-list">
          <button v-for="(item, index) in catalog.filter((resource) => resource.kind === '开源').slice(0, 4)" :key="item.id" class="project-row focus-ring" type="button" :aria-label="`查看 ${item.name} 详情`" @click="openResource(item)"><span class="project-rank">0{{ index + 1 }}</span><span class="project-name">{{ item.name }}</span><span class="project-description">{{ item.description }}</span><span class="project-metric">{{ item.metric }}</span><span aria-hidden="true">↗</span></button>
        </div>
      </div>
    </section>

    <section id="ranking" class="content-band ranking-section" aria-labelledby="ranking-title">
      <div class="wrap shell ranking-layout">
        <div v-reveal class="section-heading"><div><p class="eyebrow">SIGNAL RANKING</p><h2 id="ranking-title">本周信号榜</h2></div><p class="section-note">更新于今日</p></div>
        <div class="ranking-grid">
          <article v-reveal class="ranking-card ranking-card--primary surface-transition"><p class="ranking-index">01</p><p class="eyebrow">开发与自动化</p><h3>Claude Code</h3><p>复杂代码库的 Agent 工作流，仍在持续升温。</p><span>开发者热度 +38%</span></article>
          <article v-reveal class="ranking-card surface-transition"><p class="ranking-index">02</p><p class="eyebrow">模型与平台</p><h3>DeepSeek</h3><p>围绕推理能力与开发者生态的讨论持续扩展。</p><span>关注度 +26%</span></article>
          <article v-reveal class="ranking-card surface-transition"><p class="ranking-index">03</p><p class="eyebrow">图像与视频</p><h3>可灵 AI</h3><p>控制力成为生成视频工具下一阶段的核心竞争力。</p><span>内容热度 +21%</span></article>
        </div>
      </div>
    </section>
  </main>

  <footer class="footer site-footer"><div class="wrap shell footer-inner"><div><a class="brand brand--footer" href="#top"><span class="brand-mark" aria-hidden="true">✦</span><span>AI Radar</span></a><p>面向中文用户的 AI 资讯、工具与开源项目发现站。</p></div><div class="source-list"><span>GitHub</span><span>官方发布</span><span>公开 RSS</span></div></div></footer>
  <button class="back-to-top focus-ring" :class="{ 'is-visible': canReturnToTop }" type="button" aria-label="返回顶部" title="返回顶部" @click="returnToTop"><span aria-hidden="true">↑</span></button>
  <div v-if="selectedResource" class="detail-backdrop" role="presentation" @click.self="closeResource">
    <section class="resource-detail" role="dialog" aria-modal="true" :aria-label="`${selectedResource.name} 详情`">
      <button class="detail-close focus-ring" type="button" aria-label="关闭详情" @click="closeResource">×</button>
      <div class="detail-icon" :class="`resource-icon--${selectedResource.accent}`" aria-hidden="true">{{ selectedResource.label }}</div>
      <p class="eyebrow">{{ selectedResource.kind }} · {{ selectedResource.category }}</p>
      <h2>{{ selectedResource.name }}</h2>
      <p>{{ selectedResource.description }}</p>
      <div class="detail-meta"><span class="heat-dot" aria-hidden="true"></span><span>{{ selectedResource.metric }}</span></div>
      <a class="detail-link focus-ring" :href="selectedResource.url" target="_blank" rel="noreferrer">访问官方来源 <span aria-hidden="true">↗</span></a>
    </section>
  </div>
</template>
