import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/** Base para GitHub Pages: https://usuario.github.io/NOMBRE-REPO/ */
function githubPagesBase(): string {
  if (process.env.VITE_BASE_PATH) {
    const base = process.env.VITE_BASE_PATH
    return base.endsWith('/') ? base : `${base}/`
  }
  return '/'
}

export default defineConfig({
  base: githubPagesBase(),
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
