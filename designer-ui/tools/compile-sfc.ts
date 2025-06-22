import fs from 'fs';
import path from 'path';
import { parse, compileScript, compileTemplate } from '@vue/compiler-sfc';
import { transformSync } from 'esbuild';

export const compileVueSfc = (inputPath: string, outputPath: string): void => {
  const fileContent = fs.readFileSync(inputPath, 'utf-8');
  const { descriptor } = parse(fileContent, { filename: inputPath });

  if (!descriptor.script && !descriptor.scriptSetup) {
    throw new Error(`Missing <script> or <script setup> in ${inputPath}`);
  }

  const script = compileScript(descriptor, {
    id: 'sfc',
    inlineTemplate: false
  });

  const template = compileTemplate({
    id: 'sfc',
    source: descriptor.template?.content ?? '',
    filename: inputPath
  });

  if (template.errors.length > 0) {
    console.error(`Template compile error for ${inputPath}`, template.errors);
    throw template.errors[0];
  }

  // Replace 'export default' with 'const _sfc_main ='
  const scriptCode = script.content.replace(/export\s+default/, 'const _sfc_main =');

  // Transpile TypeScript if needed
  const tsCompiled = transformSync(scriptCode, {
    loader: 'ts',
    target: 'esnext',
    format: 'esm'
  });

  const output = `
${template.code}
${tsCompiled.code}

// Attach render function
_sfc_main.render = render;
export default _sfc_main;
`;

  // Ensure the output folder exists
  const outputDir = path.dirname(outputPath);
  fs.mkdirSync(outputDir, { recursive: true });

  // Write the component file
  fs.writeFileSync(outputPath, output.trim(), 'utf-8');
};
