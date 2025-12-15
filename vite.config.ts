import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig((configEnv) => {
  console.log('configEnv.mode', configEnv.mode);
  return {
    base: './',
    plugins: [vue()],
    build: {
      outDir: '../../dist/hamilton-t1/',
      emptyOutDir: true,
      sourcemap: configEnv.mode === 'development'
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    test: {
      globals: true,
      environment: 'jsdom',
    },
  }
})