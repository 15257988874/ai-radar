<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { newsStories } from '../catalog.js';
import { formatGeneratedAt, loadLiveNews } from '../live-data-client.js';
import { resolveStoredTheme } from '../theme.js';

/** Browser storage key shared with the landing page so the selected theme survives route changes. */
const themeStorageKey = 'ai-radar-theme-preference';
/** Search term applied to the complete editorial stream. */
const query = ref('');
/** Active topic filter for the editorial stream. */
const activeCategory = ref('全部');
/** Current explicit reader theme. */
const theme = ref('light');
/** Visibility state for the fixed return-to-top control. */
const canReturnToTop = ref(false);
/** Current article selected for the reader's quick detail view. */
const selectedStory = ref(null);
/** Search input exposed through the shared Cmd/Ctrl+K convention. */
const searchInput = ref(null);
/** Router used to return from the complete stream to the landing-page sections. */
const router = useRouter();
/** Generated public news payload, kept null when the reader must use bundled editorial content. */
const liveNewsPayload = ref(null);

/** Canonical source homes used by detail cards when the static editorial seed does not carry article-level URLs. */
const sourceLinks = {
  'AI Radar 编辑部': 'https://github.com/',
  '机器之心': 'https://www.jiqizhixin.com/',
  'GitHub Trending': 'https://github.com/trending',
  'OpenAI Developers': 'https://platform.openai.com/docs',
  '量子位': 'https://www.qbitai.com/',
  'Hugging Face': 'https://huggingface.co/',
  '36Kr': 'https://36kr.com/',
  'The Pragmatic Engineer': 'https://newsletter.pragmaticengineer.com/',
  'InfoQ': 'https://www.infoq.com/',
  '少数派': 'https://sspai.com/',
  'MIT Technology Review': 'https://www.technologyreview.com/',
  'LangChain Blog': 'https://blog.langchain.dev/',
  TechCrunch: 'https://techcrunch.com/',
  Snyk: 'https://snyk.io/blog/',
  'ComfyUI Community': 'https://github.com/Comfy-Org/ComfyUI',
  VentureBeat: 'https://venturebeat.com/',
  'Figma Blog': 'https://www.figma.com/blog/',
  LlamaIndex: 'https://www.llamaindex.ai/blog',
  EdSurge: 'https://www.edsurge.com/',
  'SWE-bench': 'https://www.swebench.com/',
  Wired: 'https://www.wired.com/',
};

/** Complete set of news topics derived from whichever data source is currently valid. */
const categories = computed(() => ['全部', ...new Set((liveNewsPayload.value?.items ?? newsStories).map((story) => story.type))]);

/** Latest successful generated-news timestamp rendered beside the full feed. */
const liveNewsGeneratedAt = computed(() => liveNewsPayload.value?.generatedAt ?? null);

/**
 * Adds entrance motion only when a news block enters the reading viewport.
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
    }, { threshold: 0.12 });
    observer.observe(element);
    element._revealObserver = observer;
  },
  unmounted(element) {
    element._revealObserver?.disconnect();
  },
};

/**
 * Applies the text query and topic category without reducing the route to a landing-page preview.
 * @returns {import('../catalog.js').Story[]} News entries visible in the current reader state.
 */
const visibleStories = computed(() => {
  const normalizedQuery = query.value.trim().toLocaleLowerCase('zh-CN');
  return (liveNewsPayload.value?.items ?? newsStories).filter((story) => (
    (!normalizedQuery || `${story.title} ${story.summary} ${story.source} ${story.type}`.toLocaleLowerCase('zh-CN').includes(normalizedQuery))
    && (activeCategory.value === '全部' || story.type === activeCategory.value)
  ));
});

/**
 * Human-readable status for search and filter outcomes.
 * @returns {string} Accessible results summary.
 */
const resultSummary = computed(() => {
  if (query.value.trim()) return `“${query.value.trim()}” 找到 ${visibleStories.value.length} 条资讯`;
  if (activeCategory.value !== '全部') return `${activeCategory.value} · ${visibleStories.value.length} 条资讯`;
  return `共 ${visibleStories.value.length} 条资讯`;
});

/**
 * Uses the shared document theme contract and persists the explicit reader choice.
 * @param {'light' | 'dark'} nextTheme Target reader theme.
 * @returns {void}
 */
function applyTheme(nextTheme) {
  theme.value = nextTheme;
  document.documentElement.dataset.theme = nextTheme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', nextTheme === 'dark' ? '#071216' : '#eff8fa');
  window.localStorage.setItem(themeStorageKey, nextTheme);
}

/**
 * Switches between the two supported reader themes.
 * @returns {void}
 */
function toggleTheme() {
  applyTheme(theme.value === 'dark' ? 'light' : 'dark');
}

/**
 * Restores the persisted palette, using the approved light presentation for a first-time reader.
 * @returns {void}
 */
function restoreTheme() {
  applyTheme(resolveStoredTheme(window.localStorage.getItem(themeStorageKey)));
}

/**
 * Updates whether the return-to-top action should appear after meaningful reading depth.
 * @returns {void}
 */
function updateScrollUi() {
  canReturnToTop.value = window.scrollY > 360;
}

/**
 * Returns the reader to the beginning of the news stream while honoring reduced-motion preferences.
 * @returns {void}
 */
function returnToTop() {
  window.scrollTo({
    top: 0,
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
  });
}

/**
 * Opens the selected story's quick reading view without leaving the complete feed.
 * @param {import('../catalog.js').Story} story Editorial item selected by the reader.
 * @returns {void}
 */
function openStory(story) {
  selectedStory.value = story;
}

/**
 * Closes the quick reading view and retains the reader's filtered stream position.
 * @returns {void}
 */
function closeStory() {
  selectedStory.value = null;
}

/**
 * Returns to a landing-page destination through the router so browser history remains consistent.
 * @param {string} hash Landing-page section identifier.
 * @returns {void}
 */
function navigateHome(hash = '') {
  router.push({ path: '/', hash });
}

/**
 * Navigates to a complete discovery page from the global header.
 * @param {string} destination Target top-level route.
 * @returns {void}
 */
function navigate(destination) {
  router.push(destination);
}

/**
 * Resolves a concrete external destination for every static editorial detail card.
 * @param {import('../catalog.js').Story} story Editorial story being viewed.
 * @returns {string} Trusted source homepage or a source-search fallback.
 */
function getStoryUrl(story) {
  return story.url || sourceLinks[story.source] || `https://www.google.com/search?q=${encodeURIComponent(`${story.source} ${story.title}`)}`;
}

/**
 * Loads the generated public feed after the static route has rendered, retaining seeds on an unavailable response.
 * @returns {Promise<void>} Resolves after the data source decision is made.
 */
async function hydrateLiveNews() {
  const result = await loadLiveNews();
  if (result.data) liveNewsPayload.value = result.data;
}

/**
 * Focuses the complete-news search input through Cmd/Ctrl+K.
 * @param {KeyboardEvent} event Browser key event.
 * @returns {void}
 */
function handleKeyboardShortcut(event) {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    searchInput.value?.focus();
  }
}

/**
 * Restores persistent view state and subscribes to only the scroll event used by this route.
 * @returns {void}
 */
onMounted(() => {
  restoreTheme();
  updateScrollUi();
  void hydrateLiveNews();
  window.addEventListener('scroll', updateScrollUi, { passive: true });
  window.addEventListener('keydown', handleKeyboardShortcut);
});

/**
 * Releases the route-local scroll handler during navigation and HMR disposal.
 * @returns {void}
 */
onBeforeUnmount(() => {
  window.removeEventListener('scroll', updateScrollUi);
  window.removeEventListener('keydown', handleKeyboardShortcut);
});
</script>

<template>
  <header class="topbar site-header news-header">
    <div class="wrap shell topbar-inner header-inner">
      <button class="brand focus-ring" type="button" aria-label="AI Radar 首页" @click="navigateHome()"><span class="brand-mark" aria-hidden="true">✦</span><span>AI Radar</span></button>
      <nav class="site-nav main-nav" aria-label="主导航">
        <button class="focus-ring is-active" type="button" aria-current="page">资讯</button>
        <button class="focus-ring" type="button" @click="navigate('/tools')">工具</button>
        <button class="focus-ring" type="button" @click="navigate('/opensource')">开源</button>
        <button class="focus-ring" type="button" @click="navigate('/ranking')">榜单</button>
      </nav>
      <div class="actions header-actions">
        <label class="search-box" for="news-search">
          <span class="search-icon search-symbol" aria-hidden="true">⌕</span>
          <input id="news-search" ref="searchInput" v-model="query" type="search" placeholder="搜索完整资讯流" autocomplete="off" />
          <kbd>⌘ K</kbd>
          <button v-if="query" class="focus-ring" type="button" aria-label="清空资讯搜索" @click="query = ''">×</button>
        </label>
        <button class="theme-switch theme-toggle focus-ring" type="button" role="switch" :aria-checked="theme === 'dark'" :aria-label="theme === 'dark' ? '切换到浅色主题' : '切换到深色主题'" @click="toggleTheme">
          <span class="theme-orbit" aria-hidden="true"><span class="theme-sun">☼</span><span class="theme-moon">◐</span></span>
        </button>
      </div>
    </div>
  </header>

  <main class="news-page" id="top">
    <section class="news-masthead" aria-labelledby="news-page-title">
      <div v-reveal class="wrap shell news-masthead-inner">
        <p class="eyebrow">AI RADAR / NEWSROOM</p>
        <div class="news-title-row"><h1 id="news-page-title">AI 资讯情报流</h1><span class="news-live-mark"><i aria-hidden="true"></i>{{ liveNewsGeneratedAt ? '最近更新' : '精选收录' }}</span></div>
        <p>把模型、产品、开源与开发者生态放进同一条可浏览的信息流，先看全局，再深入你关心的方向。</p>
      </div>
    </section>

    <section class="news-feed-section" aria-labelledby="news-feed-title">
      <div class="wrap shell">
        <div v-reveal class="news-feed-heading">
          <div><p class="eyebrow">FULL STREAM</p><h2 id="news-feed-title">全部资讯</h2></div>
          <div class="data-status"><p class="result-count" aria-live="polite">{{ resultSummary }}</p><p v-if="liveNewsGeneratedAt" class="data-freshness">公开源更新于 {{ formatGeneratedAt(liveNewsGeneratedAt) }}</p></div>
        </div>

        <div v-reveal class="news-filter-bar" role="tablist" aria-label="资讯分类筛选">
          <button v-for="category in categories" :key="category" class="focus-ring" type="button" role="tab" :aria-selected="activeCategory === category" :class="{ 'is-active': activeCategory === category }" @click="activeCategory = category">{{ category }}</button>
        </div>

        <div v-if="visibleStories.length" class="news-feed-grid" aria-live="polite">
          <button v-for="(story, index) in visibleStories" :key="story.id" v-reveal class="news-feed-card surface-transition focus-ring" :class="{ 'news-feed-card--lead': index === 0 }" :style="{ '--reveal-delay': `${(index % 3) * 75}ms` }" type="button" @click="openStory(story)">
            <div class="news-feed-card-top"><span class="news-story-type">{{ story.type }}</span><time>{{ story.time }}</time></div>
            <h3>{{ story.title }}</h3>
            <p>{{ story.summary }}</p>
            <footer><span>{{ story.source }}</span><span class="news-card-arrow" aria-hidden="true">↗</span></footer>
          </button>
        </div>
        <div v-else class="news-empty-state"><span aria-hidden="true">⌕</span><h3>没有匹配的资讯</h3><p>试试更短的关键词，或切换到“全部”。</p><button class="directory-toggle focus-ring" type="button" @click="query = ''; activeCategory = '全部'">清除筛选</button></div>
      </div>
    </section>
  </main>

  <footer class="footer site-footer"><div class="wrap shell footer-inner"><div><button class="brand brand--footer focus-ring" type="button" @click="navigateHome()"><span class="brand-mark" aria-hidden="true">✦</span><span>AI Radar</span></button><p>面向中文用户的 AI 资讯、工具与开源项目发现站。</p></div><div class="source-list"><span>GitHub</span><span>官方发布</span><span>公开 RSS</span></div></div></footer>
  <button class="back-to-top focus-ring" :class="{ 'is-visible': canReturnToTop }" type="button" aria-label="返回顶部" title="返回顶部" @click="returnToTop"><span aria-hidden="true">↑</span></button>

  <div v-if="selectedStory" class="detail-backdrop" role="presentation" @click.self="closeStory">
    <section class="resource-detail news-detail" role="dialog" aria-modal="true" :aria-label="`${selectedStory.title} 资讯详情`">
      <button class="detail-close focus-ring" type="button" aria-label="关闭资讯详情" @click="closeStory">×</button>
      <p class="eyebrow">{{ selectedStory.type }} · {{ selectedStory.source }}</p>
      <h2>{{ selectedStory.title }}</h2>
      <p>{{ selectedStory.summary }}</p>
      <div class="detail-meta"><span class="heat-dot" aria-hidden="true"></span><span>{{ selectedStory.time }}</span></div>
      <a class="detail-link focus-ring" :href="getStoryUrl(selectedStory)" target="_blank" rel="noreferrer">访问资讯来源 <span aria-hidden="true">↗</span></a>
    </section>
  </div>
</template>
