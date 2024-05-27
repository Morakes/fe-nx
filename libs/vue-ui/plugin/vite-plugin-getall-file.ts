import fs from "fs";
import path from "path";
import { Plugin } from "vite";

export const VitePluginGetallFile: (any) => Plugin = ({ target, source }: Record<'target' | 'source', string>) => ({
    name: 'vite-plugin-getall-file',
    enforce: 'post' as const,
    configResolved(config) {
        const componentsDir = path.resolve(__dirname, 'src/lib');
        const entryPoints: Record<string, string> = {};

        fs.readdirSync(componentsDir).forEach(dir => {
        const componentName = path.basename(dir);
        entryPoints[`lib/${componentName}/index`] = path.join(componentsDir, dir, 'index.ts');
        });
        

        config.build.rollupOptions.output = ['es', 'cjs'].map((distType) => ({
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
              // if (/^.*\.(css|less|scss)$/.test(id)) {
              //     return 'style'
              // }
            }
          }))
        }
})
