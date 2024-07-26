import * as fs from 'fs-extra';
import { Plugin } from 'vite';

export type VitePluginCopyFileType = Record<'target' | 'source', string>

export const VitePluginCopyFile: (arg: VitePluginCopyFileType[]) => Plugin = (payload) => ({
  name: 'vite-plugin-copy-file',
  enforce: 'post' as const,
  closeBundle: () => {
    if (!payload || !Array.isArray(payload)) return;

    payload.forEach(async ({ target, source }) => {
      if (!source || !target) {
        return;
      }
      if (!fs.existsSync(source)) {
        console.error('source file or directory not found');
        return;
      }
      try {
        await fs.copy(source, target);
      } catch (err) {
        console.error('Error copying file or directory:', err);
      }
    });
  }
})