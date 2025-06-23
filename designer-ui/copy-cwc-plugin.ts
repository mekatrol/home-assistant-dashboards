// tools/copy-cwc-plugin.ts
import fs from 'fs';
import path from 'path';
import { Plugin } from 'vite';

export function copyCwcPlugin(): Plugin {
  const sourceDir = path.resolve(__dirname, './src/cwc');
  const targetDir = path.resolve(__dirname, '../designer-server/web/static/components');

  return {
    name: 'copy-cwc-js-files',
    apply: 'build',

    async closeBundle(): Promise<void> {
      if (!fs.existsSync(sourceDir)) {
        console.warn(`[copy-cwc-plugin] Source directory not found: ${sourceDir}`);
        return;
      }

      const files = fs.readdirSync(sourceDir).filter((f) => f.endsWith('.js'));

      for (const file of files) {
        const name = path.basename(file, '.js');
        const from = path.join(sourceDir, file);
        const to = path.resolve(targetDir, `${name}.js`);

        // Ensure target directory exists
        fs.mkdirSync(path.dirname(to), { recursive: true });

        fs.copyFileSync(from, to);
        console.log(`[copy-cwc-plugin] Copied ${file} → ${to}`);
      }
    }
  };
}
