import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/** En GitHub Actions usa /nombre-del-repo/ para Pages en subcarpeta. */
function githubPagesBase(): string {
  const repo = process.env.GITHUB_REPOSITORY?.split('/')[1]
  if (process.env.GITHUB_ACTIONS === 'true' && repo) {
    return `/${repo}/`
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
