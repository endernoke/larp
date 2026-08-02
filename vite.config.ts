import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [svelte()],
  // Relative paths let the static build work when embedded on itch.io.
  base: './',
  build: {
    sourcemap: true,
  },
});
