import { createApp } from 'vue';
import 'virtual:uno.css';
import './styles.css';
import App from './App.vue';
import router from './router.js';

/** Mounts the Vue application after UnoCSS and global visual tokens are available. */
createApp(App).use(router).mount('#app');
