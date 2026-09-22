import { fileURLToPath, URL } from 'node:url'

import { defineConfig, type Plugin, type ViteDevServer, type PreviewServer } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'
import { GET } from './api/flow.ts'

/** `vite dev` and `vite preview` only serve the SPA, so the Vercel Function is mounted here too. */
function vercelApiDevServer(): Plugin {
  const mount = (server: ViteDevServer | PreviewServer) => {
    // Matched in full, not as a prefix: `/api/flow.types.ts` is a module the browser imports.
    server.middlewares.use(async (request, response, next) => {
      if (request.url?.split('?')[0] !== '/api/flow') return next()
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
