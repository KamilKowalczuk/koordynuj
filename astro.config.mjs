// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import svelte from '@astrojs/svelte';
import netlify from '@astrojs/netlify';

// https://astro.build/config
export default defineConfig({
  // KRYTYCZNE: Zdefiniuj URL produkcyjny dla poprawnych canonical i Open Graph URLs
  site: 'https://koordynuj-zdrowie.pl',
  
  adapter: netlify(),
  
  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [svelte()],
});