import { copyFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

function spaFallback404(): Plugin {
  return {
    name: 'spa-fallback-404',
    async closeBundle() {
      const distDir = resolve('dist')
      try {
        await copyFile(resolve(distDir, 'index.html'), resolve(distDir, '404.html'))
      } catch {
        // Ignore if index.html was not emitted (e.g. non-build contexts)
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), spaFallback404()],
  base: '/',
  define: {
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
})
