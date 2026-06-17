import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // lucide-react@1.x calls useContext() inside every <Icon>; without forcing a
  // single React instance the dev dep-optimizer can load a second copy and every
  // icon throws "Invalid hook call". Dedupe guarantees one React/React-DOM.
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react/jsx-runtime', 'react-router-dom', 'lucide-react'],
  },
})
