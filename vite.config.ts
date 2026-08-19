import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // GitHub Pages project site is hosted under:
  // https://<user>.github.io/<repo>/
  base: '/Lexi-English-Teacher/',
})
