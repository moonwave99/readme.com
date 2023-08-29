import { defineConfig } from 'vite';
import { watch } from 'vite-plugin-watch';

export default defineConfig({
  plugins: [
    watch({
      pattern: 'README.md',
      command: 'npm run site:html',
    }),
  ],
  server: {
    open: 'site/index.html',
  },
});
