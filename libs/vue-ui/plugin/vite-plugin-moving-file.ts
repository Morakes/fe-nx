import fs from "fs";

export const VitePluginMovingFile = ({ target, source }: Record<'target' | 'source', string>) => ({
  name: 'vite-plugin-moving-file',
  enforce: 'post' as const,
  closeBundle: () => {
    if (!source || !target) {
      return;
    }
    if (!fs.existsSync(source)) {
      console.error('source file not found');
      return;
    }
    fs.copyFileSync(source, target)
  }
})
