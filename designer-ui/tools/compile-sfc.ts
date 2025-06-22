import fs from 'fs';
import path from 'path';
import { parse, compileScript, compileTemplate } from '@vue/compiler-sfc';

export const compileVueSfc = (inputPath: string, outputPath: string): void => {
  const fileContent = fs.readFileSync(inputPath, 'utf-8');
  const { descriptor } = parse(fileContent);

  const script = compileScript(descriptor, {
    id: 'sfc',
    inlineTemplate: false
  });

  const template = compileTemplate({
    id: 'sfc',
    source: descriptor.template?.content ?? '',
    filename: inputPath
  });

  const output = `
${script.content}
${template.code}
_sfc_main.render = render;
export default _sfc_main;
`;

  // Ensure the output folder exists
  const outpurDir = path.dirname(outputPath);
  fs.mkdirSync(outpurDir, { recursive: true });

  // Write the component file
  fs.writeFileSync(outputPath, output, 'utf-8');
};
