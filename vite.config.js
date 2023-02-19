import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import eslint from 'vite-plugin-eslint'
// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.IS_DEV !== 'true' ? './' : '/',
  plugins: [react(), eslint()],
  resolve: {
    alias: {
      'node-fetch': 'isomorphic-fetch'
    }
  }
})
