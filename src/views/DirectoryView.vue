<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { catalog, searchCatalog } from '../catalog.js';
import { resolveStoredTheme } from '../theme.js';

/** External configuration required to present a complete tools or open-source directory. */
const props = defineProps({
  kind: { type: String, required: true },
  title: { type: String, required: true },
  eyebrow: { type: String, required: true },
  description: { type: String, required: true },
});

/** Browser storage key shared by every discovery route. */
const themeStorageKey = 'ai-radar-theme-preference';
/** Keyword applied to the current complete directory. */
const query = ref('');
/** Current usage-category filter. */
const activeCategory = ref('全部');
/** Explicit reader theme. */
const theme = ref('light');
/** Selected resource shown in the contextual detail view. */
const selectedResource = ref(null);
/** Whether the return-to-top action should be shown. */
const canReturnToTop = ref(false);
/** Search input that receives Cmd/Ctrl+K focus. */
const searchInput = ref(null);
/** Active router state for page transitions. */
const route = useRoute();
/** Router used by global navigation. */
const router = useRouter();

/** Categories represented by resources of the current kind. */
const categories = computed(() => ['全部', ...new Set(catalog.filter((item) => item.kind === props.kind).map((item) => item.category))]);

/**
 * Filters the complete directory by type, keyword, and selected usage category.
 * @returns {import('../catalog.js').CatalogItem[]} Full directory entries visible to the reader.
 */
const visibleResources = computed(() => searchCatalog(query.value).filter((item) => (
  item.kind === props.kind && (activeCategory.value === '全部' || item.category === activeCategory.value)
)));

/**
 * Produces the accessible count status for the active directory result set.
 * @returns {string} Filter and keyword outcome summary.
 */
const resultSummary = computed(() => {
  if (query.value.trim()) return `“${query.value.trim()}” 找到 ${visibleResources.value.length} 个${props.kind}`;
  if (activeCategory.value !== '全部') return `${activeCategory.value} · ${visibleResources.value.length} 个${props.kind}`;
  return `共 ${visibleResources.value.length} 个${props.kind}`;
});

/**
 * Adds entrance motion after a resource block actually enters the reader viewport.
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
 * Applies and persists an explicit two-state visual theme.
 * @param {'light' | 'dark'} nextTheme Theme chosen by the reader.
 * @returns {void}
 */
function applyTheme(nextTheme) {
  theme.value = nextTheme;
  document.documentElement.dataset.theme = nextTheme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', nextTheme === 'dark' ? '#071216' : '#eff8fa');
  window.localStorage.setItem(themeStorageKey, nextTheme);
}

/**
 * Switches between the supported light and dark presentations.
 * @returns {void}
 */
function toggleTheme() {
  applyTheme(theme.value === 'dark' ? 'light' : 'dark');
}

/**
 * Restores the persisted theme without accepting retired third theme states.
 * @returns {void}
 */
function restoreTheme() {
  applyTheme(resolveStoredTheme(window.localStorage.getItem(themeStorageKey)));
}

/**
 * Opens the selected resource while retaining the reader's filtered directory context.
 * @param {import('../catalog.js').CatalogItem} resource Resource selected from the listing.
 * @returns {void}
 */
function openResource(resource) {
  selectedResource.value = resource;
}

/**
 * Closes the active resource detail dialog.
 * @returns {void}
 */
function closeResource() {
  selectedResource.value = null;
}

/**
 * Pushes a top-level discovery destination and preserves actual browser history.
 * @param {string} destination Target route path.
 * @returns {void}
 */
function navigate(destination) {
  router.push(destination);
}

/**
 * Shows the return control after the reader has moved beyond the opening directory panel.
 * @returns {void}
 */
function updateScrollUi() {
  canReturnToTop.value = window.scrollY > 360;
}

/**
 * Returns to the directory masthead, respecting reduced-motion preference.
 * @returns {void}
 */
function returnToTop() {
  window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
}

/**
 * Focuses the visible route search field when the conventional Cmd/Ctrl+K shortcut is used.
 * @param {KeyboardEvent} event Browser key event.
 * @returns {void}
 */
function handleKeyboardShortcut(event) {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    searchInput.value?.focus();
  }
}

/** Restores persistent route state and attaches only route-local window listeners. */
onMounted(() => {
  restoreTheme();
  updateScrollUi();
  window.addEventListener('scroll', updateScrollUi, { passive: true });
  window.addEventListener('keydown', handleKeyboardShortcut);
});

/** Releases route-local listeners when a top-level page is changed. */
onBeforeUnmount(() => {
  window.removeEventListener('scroll', updateScrollUi);
  window.removeEventListener('keydown', handleKeyboardShortcut);
});
</script>

<template>
  <header class="topbar site-header directory-header">
    <div class="wrap shell topbar-inner header-inner">
      <button class="brand focus-ring" type="button" aria-label="AI Radar 首页" @click="navigate('/')"><span class="brand-mark" aria-hidden="true">✦</span><span>AI Radar</span></button>
      <nav class="site-nav main-nav" aria-label="主导航">
        <button class="focus-ring" :class="{ 'is-active': route.name === 'news' }" type="button" @click="navigate('/news')">资讯</button>
        <button class="focus-ring" :class="{ 'is-active': route.name === 'tools' }" type="button" @click="navigate('/tools')">工具</button>
        <button class="focus-ring" :class="{ 'is-active': route.name === 'opensource' }" type="button" @click="navigate('/opensource')">开源</button>
        <button class="focus-ring" :class="{ 'is-active': route.name === 'ranking' }" type="button" @click="navigate('/ranking')">榜单</button>
      </nav>
      <div class="actions header-actions">
        <label class="search-box" for="directory-search"><span class="search-icon search-symbol" aria-hidden="true">⌕</span><input id="directory-search" ref="searchInput" v-model="query" type="search" :placeholder="`搜索${kind}、场景、项目`" autocomplete="off" /><kbd>⌘ K</kbd><button v-if="query" class="focus-ring" type="button" aria-label="清空目录搜索" @click="query = ''">×</button></label>
        <button class="theme-switch theme-toggle focus-ring" type="button" role="switch" :aria-checked="theme === 'dark'" :aria-label="theme === 'dark' ? '切换到浅色主题' : '切换到深色主题'" @click="toggleTheme"><span class="theme-orbit" aria-hidden="true"><span class="theme-sun">☼</span><span class="theme-moon">◐</span></span></button>
      </div>
    </div>
  </header>

  <main class="directory-page">
    <section class="directory-masthead">
      <div v-reveal class="wrap shell directory-masthead-inner"><p class="eyebrow">{{ eyebrow }}</p><h1>{{ title }}</h1><p>{{ description }}</p></div>
    </section>
    <section class="directory-feed-section" :aria-labelledby="`${kind}-directory-title`">
      <div class="wrap shell">
        <div v-reveal class="directory-feed-heading"><div><p class="eyebrow">COMPLETE DIRECTORY</p><h2 :id="`${kind}-directory-title`">全部{{ kind }}</h2></div><p class="result-count" aria-live="polite">{{ resultSummary }}</p></div>
        <div v-reveal class="news-filter-bar" role="tablist" :aria-label="`${kind}场景分类筛选`"><button v-for="category in categories" :key="category" class="focus-ring" type="button" role="tab" :aria-selected="activeCategory === category" :class="{ 'is-active': activeCategory === category }" @click="activeCategory = category">{{ category }}</button></div>
        <div v-if="visibleResources.length" class="directory-resource-grid" aria-live="polite">
          <button v-for="(item, index) in visibleResources" :key="item.id" v-reveal class="directory-resource-card focus-ring" :style="{ '--reveal-delay': `${(index % 4) * 65}ms` }" type="button" @click="openResource(item)"><div class="resource-head"><span class="resource-icon" :class="`resource-icon--${item.accent}`" aria-hidden="true">{{ item.label }}</span><span class="resource-kind">{{ item.category }}</span></div><div class="resource-copy"><h3>{{ item.name }}</h3><p>{{ item.description }}</p></div><footer><span class="heat-dot" aria-hidden="true"></span><span>{{ item.metric }}</span><span class="resource-arrow" aria-hidden="true">↗</span></footer></button>
        </div>
        <div v-else class="news-empty-state"><span aria-hidden="true">⌕</span><h3>没有匹配的{{ kind }}</h3><p>试试更短的关键词，或切换到“全部”。</p><button class="directory-toggle focus-ring" type="button" @click="query = ''; activeCategory = '全部'">清除筛选</button></div>
      </div>
    </section>
  </main>

  <footer class="footer site-footer"><div class="wrap shell footer-inner"><div><button class="brand brand--footer focus-ring" type="button" @click="navigate('/')"><span class="brand-mark" aria-hidden="true">✦</span><span>AI Radar</span></button><p>面向中文用户的 AI 资讯、工具与开源项目发现站。</p></div><div class="source-list"><span>GitHub</span><span>官方发布</span><span>公开 RSS</span></div></div></footer>
  <button class="back-to-top focus-ring" :class="{ 'is-visible': canReturnToTop }" type="button" aria-label="返回顶部" title="返回顶部" @click="returnToTop"><span aria-hidden="true">↑</span></button>
  <div v-if="selectedResource" class="detail-backdrop" role="presentation" @click.self="closeResource"><section class="resource-detail" role="dialog" aria-modal="true" :aria-label="`${selectedResource.name} 详情`"><button class="detail-close focus-ring" type="button" aria-label="关闭详情" @click="closeResource">×</button><div class="detail-icon" :class="`resource-icon--${selectedResource.accent}`" aria-hidden="true">{{ selectedResource.label }}</div><p class="eyebrow">{{ selectedResource.kind }} · {{ selectedResource.category }}</p><h2>{{ selectedResource.name }}</h2><p>{{ selectedResource.description }}</p><div class="detail-meta"><span class="heat-dot" aria-hidden="true"></span><span>{{ selectedResource.metric }}</span></div><a class="detail-link focus-ring" :href="selectedResource.url" target="_blank" rel="noreferrer">访问官方来源 <span aria-hidden="true">↗</span></a></section></div>
</template>
