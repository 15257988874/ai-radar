import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import UnoCSS from 'unocss/vite';

/** Repository name used by the GitHub Pages deployment path. */
const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1];
/** Pages serves project sites beneath their repository name, while local Vite stays at the origin root. */
const base = process.env.GITHUB_ACTIONS && repositoryName ? `/${repositoryName}/` : '/';

/** Vite configuration for the Vue single-page application and generated UnoCSS utilities. */
export default defineConfig({
  base,
  plugins: [vue(), UnoCSS()],
});
