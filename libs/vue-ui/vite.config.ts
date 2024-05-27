/// <reference types='vitest' />
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import dts from 'vite-plugin-dts';
import * as path from 'path';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import fs from 'fs';
import { VitePluginMovingFile } from './plugin/vite-plugin-moving-file'

const componentsDir = path.resolve(__dirname, 'src/lib');
const entryPoints: Record<string, string> = {};

fs.readdirSync(componentsDir).forEach(dir => {
 const componentName = path.basename(dir);
 entryPoints[`lib/${componentName}/index`] = path.join(componentsDir, dir, 'index.ts');
});

export default defineConfig({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/libs/vue-ui',

  plugins: [
    vue(),
    nxViteTsPaths(),
    dts({
      entryRoot: 'src/lib',
      tsconfigPath: path.join(__dirname, 'tsconfig.lib.json'),
      outDir: [path.resolve(__dirname, '../../dist/libs/vue-ui/es'), path.resolve(__dirname, '../../dist/libs/vue-ui/cjs')]
    }),
    VitePluginMovingFile({
      target: path.resolve(__dirname, '../../dist/libs/vue-ui/README.md'),
      source: path.resolve(__dirname, './README.md')
    }),
  ],
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'vue-ui',
    },
    cssCodeSplit: false,
    rollupOptions: {
      input: {
        index: path.resolve(__dirname, 'src/index.ts'),
        ...entryPoints
      },
      output: ['es', 'cjs'].map((distType) => ({
        entryFileNames: `${distType}/[name].js`,
        assetFileNames: () => {
          return `${distType}/lib/[name]/[name].[ext]`
        },
        chunkFileNames: () => {
          return `${distType}/dist/[name].[hash].js`
        },
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            return 'vendor'
          }
        },
        dir: `../../dist/libs/vue-ui/`
      })),
      external: ['vue']
    }
  },
});
