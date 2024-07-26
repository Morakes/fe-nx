/// <reference types='vitest' />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import * as path from 'path';
import * as fs from 'fs';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'
import { VitePluginCopyFile } from '../plugin/src'

const outputDir = path.resolve(__dirname, '../../dist/libs/react-ui');
const componentsDir = path.resolve(__dirname, 'src/lib');
const entryPoints: Record<string, string> = {
  index: path.resolve(__dirname, 'src/index.ts')
};

fs.readdirSync(componentsDir).forEach(dir => {
  const componentName = path.basename(dir);
  entryPoints[`lib/${componentName}/index`] = `${componentsDir}/${dir}/index.tsx`;
});

export default defineConfig({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/libs/react-ui',

  plugins: [
    react(),
    nxViteTsPaths(),
    dts({
      entryRoot: 'src',
      tsconfigPath: path.join(__dirname, 'tsconfig.lib.json'),
      outDir:outputDir,
    }),
    VitePluginCopyFile([{
      target: path.resolve(outputDir, 'package.json'),
      source: path.resolve(__dirname, './package.json')
    }]),
    cssInjectedByJsPlugin({
      jsAssetsFilterFunction: (outputChunk) => {
        return /vendor\..?js$/.test(outputChunk.fileName)
      },
      styleId: 'conpany-ui'
    })
  ],

  build: {
    outDir: outputDir,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    lib: {
      entry: '',
      formats: ['es'],
    },
    rollupOptions: {
      input: entryPoints,
      output: {
        // 压缩 Rollup 产生的额外代码
        compact: true,
        // 入口文件
        entryFileNames: '[name].js',
        assetFileNames: () => {
          return 'style.[ext]'
        },
        chunkFileNames: () => {
          return 'dist/[name].mjs'
        },
        manualChunks: (id) => {
          if (/.*node_modules.*/.test(id)) {
            return 'vendor'
          }
        },
        dir: outputDir,
      },
      external: id => { 
        // 完整包名列表
        const exactExternals = ["react", "react-dom", "react/jsx-runtime"];
        // 检查是否完整匹配
        const isExactExternal = exactExternals.includes(id);
    
        // 检查是否是需要包括子模块的包
        const packageWithSubmodules = ["echarts"];
        const isSubmoduleExternal = packageWithSubmodules.some(external => id.startsWith(`${external}/`) || id === external);
    
        return isExactExternal || isSubmoduleExternal; 
      },
    },
  },
});
