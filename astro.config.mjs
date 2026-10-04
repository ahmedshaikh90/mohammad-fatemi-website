import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://mohfatemi.com',
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' }
});
