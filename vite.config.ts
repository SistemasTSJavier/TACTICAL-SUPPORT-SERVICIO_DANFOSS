import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/** Base de Vite para GitHub Pages (subcarpeta del repo o /docs). */
function githubPagesBase(): string {
  if (process.env.VITE_BASE_PATH) {
    const base = process.env.VITE_BASE_PATH
    return base.endsWith('/') ? base : `${base}/`
  }

  const repo = process.env.GITHUB_REPOSITORY?.split('/')[1]
  if (process.env.GITHUB_ACTIONS === 'true' && repo) {
    return `/${repo}/docs/`
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
