import path from 'path';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueDevTools from 'vite-plugin-vue-devtools';
import { copyCwcPlugin } from './copy-cwc-plugin';

export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          // Tell Vue that any components starting with 'cwc-' are custom web components
          isCustomElement: (tag) => tag.startsWith('cwc-')
        }
      }
    }),
    vueDevTools(),
    copyCwcPlugin()
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    watch: {
      // Prevent Vite from watching or transforming src/cwc
      ignored: ['**/src/cwc/**']
    }
  },
  build: {
    outDir: '../designer-server/web/static',
    emptyOutDir: false,
    rollupOptions: {
      // 👇 Exclude files in src/cwc from being bundled
      input: {
        main: path.resolve(__dirname, 'index.html')
      },
      external: (id) => id.includes('/src/cwc/')
    }
  }
});
