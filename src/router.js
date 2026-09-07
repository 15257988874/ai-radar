import { createRouter, createWebHistory } from 'vue-router';
import HomeView from './views/HomeView.vue';
import NewsView from './views/NewsView.vue';
import DirectoryView from './views/DirectoryView.vue';
import RankingView from './views/RankingView.vue';

/**
 * Application routes. The dedicated news route preserves the landing page as a curated entry point.
 * @type {import('vue-router').RouteRecordRaw[]}
 */
const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/news', name: 'news', component: NewsView },
  { path: '/tools', name: 'tools', component: DirectoryView },
  { path: '/opensource', name: 'opensource', component: DirectoryView },
  { path: '/ranking', name: 'ranking', component: RankingView },
];

/**
 * Client-side router for independent discovery pages and home-section navigation.
 * The Vite base URL keeps project-site navigation below the GitHub Pages repository prefix.
 * Hash destinations keep the original landing-page sections reachable from the global navigation.
 * @type {import('vue-router').Router}
 */
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to) {
    if (to.hash) return { el: to.hash, top: 84, behavior: 'smooth' };
    return { top: 0, behavior: 'smooth' };
  },
});

export default router;
