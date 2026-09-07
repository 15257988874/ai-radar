import { defineConfig, presetUno, transformerDirectives, transformerVariantGroup } from 'unocss';

/** Shared UnoCSS setup for layout primitives and small reusable interaction utilities. */
export default defineConfig({
  presets: [presetUno()],
  transformers: [transformerDirectives(), transformerVariantGroup()],
  shortcuts: {
    'surface-transition': 'transition-[transform,box-shadow,border-color,background] duration-280 ease-out',
    'focus-ring': 'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-cyan-3/25',
  },
});
