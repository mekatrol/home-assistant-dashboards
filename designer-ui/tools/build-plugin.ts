import fs from 'fs';
import { PluginOption } from 'vite';
import path from 'path';
import { compileVueSfc } from './compile-sfc';
import type { ResolveIdResult } from 'rollup';

const sfcComponents = ['UnknownComponent'];

export const compileSfcComponentPlugin = (): PluginOption => {
  return {
    name: 'compile-components',
    enforce: 'post',
    apply: 'build',
    async closeBundle(): Promise<void> {
      for (const name of sfcComponents) {
        const inputPath = path.resolve(__dirname, `../src/components/${name}.vue`);
        const outputPath = path.resolve(__dirname, `../../designer-server/web/static/components/${name}.js`);

        // Ensure output directory exists
        fs.mkdirSync(path.dirname(outputPath), { recursive: true });

        compileVueSfc(inputPath, outputPath);
      }
    }
  };
};

export const excludeSfcComponentPlugin = (): PluginOption => {
  return {
    name: 'exclude-components',
    enforce: 'pre',
    resolveId(source): ResolveIdResult {
      for (const name of sfcComponents) {
        if (source.includes(`../src/components/${name}.vue`)) {
          return { id: source, external: true };
        }
      }
      return null;
    }
  };
};
