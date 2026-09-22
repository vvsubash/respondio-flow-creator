import { fileURLToPath, URL } from 'node:url'

import { defineConfig, type Plugin, type ViteDevServer, type PreviewServer } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'
import { GET } from './api/flow.ts'

/** `vite dev` and `vite preview` only serve the SPA, so the Vercel Function is mounted here too. */
function vercelApiDevServer(): Plugin {
  const mount = (server: ViteDevServer | PreviewServer) => {
    server.middlewares.use('/api/flow', async (_request, response) => {
      response.setHeader('content-type', 'application/json')
      response.end(await GET().text())
    })
  }

  return {
    name: 'vercel-api-dev-server',
    configureServer: mount,
    configurePreviewServer: mount,
  }
}

export default defineConfig({
  plugins: [vue(), vueDevTools(), tailwindcss(), vercelApiDevServer()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
