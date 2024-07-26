/// <reference types='vitest' />
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import dts from 'vite-plugin-dts';
import * as path from 'path';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { VitePluginCopyFile } from "../plugin/src"
import fs from 'fs';

const outputDir = path.resolve(__dirname, '../../dist/libs/vue-ui');
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
      entryRoot: 'src',
      tsconfigPath: path.join(__dirname, 'tsconfig.lib.json'),
      outDir: [path.resolve(outputDir, 'es'), path.resolve(outputDir, 'cjs')]
    }),
    VitePluginCopyFile([
      {
        target: path.resolve(outputDir, 'README.md'),
        source: path.resolve(__dirname, 'README.md')
      },
      {
        target: path.resolve(outputDir, 'package.json'),
        source: path.resolve(__dirname, 'package.json')
      }
    ]),
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
        exports: 'named',
        dir: outputDir
      })),
      external: ['vue', 'ant-design-vue', 'vuedraggable']
    }
  },
});
