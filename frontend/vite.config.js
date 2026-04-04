import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
const BACKEND = 'http://localhost:5001'

function proxyToBackend(name) {
  return {
    target: BACKEND,
    changeOrigin: true,
    secure: false,
    configure: (proxy) => {
      proxy.on('error', (err, _req, _res) => {
        console.error(
          `[vite-proxy:${name}]`,
          err?.code || err?.message || err
        )
        if (err?.stack) console.error(err.stack)
      })
    },
  }
}

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': proxyToBackend('api'),
      '/wallet': proxyToBackend('wallet'),
      '/payouts': proxyToBackend('payouts'),
      '/payout': proxyToBackend('payout'),
      '/ai': proxyToBackend('ai'),
    },
  },
})
