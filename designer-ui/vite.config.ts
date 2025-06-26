import fs from 'fs';
import path from 'path';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig, UserConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueDevTools from 'vite-plugin-vue-devtools';
import { copyCwcPlugin } from './copy-cwc-plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cwcDir = path.resolve(__dirname, 'src/cwc');

// Automatically find all .ts or .js files in src/cwc
const inputEntries = Object.fromEntries(
  fs
    .readdirSync(cwcDir)
    .filter((file) => file.endsWith('.ts') || file.endsWith('.js'))
    .map((file) => {
      const name = path.parse(file).name;
      return [name, path.resolve(cwcDir, file)];
    })
);

export const viteVueConfig = defineConfig({
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

export const viteLitConfig = defineConfig({
  root: '.', // optional, in case your root differs
  build: {
    lib: false,
    outDir: '../designer-server/web/static/components',
    rollupOptions: {
      input: inputEntries,
      external: ['lit'],
      output: {
        entryFileNames: '[name].js', // keeps each file named after its source
        format: 'es',
        globals: {
          lit: 'lit'
        }
      }
    },
    emptyOutDir: false, // so it doesn't wipe the Vue build
    minify: true
  }
});

const target = process.env.VITE_BUILD_TARGET || 'vue';

export default ((): UserConfig => {
  if (target === 'vue') {
    return viteVueConfig;
  } else if (target === 'lit') {
    return viteLitConfig;
  } else {
    throw new Error(`Unknown VITE_BUILD_TARGET: ${target}`);
  }
})();
