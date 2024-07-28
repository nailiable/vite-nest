import { defineConfig } from 'vite'

export default defineConfig({
  viteNestOptions: {
    entryPath: './src/main.ts',
    bootstrap: 'bootstrap.mjs',
  },
})
