import { svelte } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [tailwindcss(), svelte()],
  // Relative paths let the static build work when embedded on itch.io.
  base: './',
  build: { sourcemap: true },
});
