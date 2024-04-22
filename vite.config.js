import { defineConfig, loadEnv } from 'vite';
import * as fs from 'fs';
import * as path from 'path';

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relative => path.resolve(appDirectory, relative);
const root = path.resolve(__dirname, resolveApp('src'));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    base: '/',
    publicDir: 'static',
    ...(env.VITE_PORT
      ? {
          server: {
            port: Number(env.VITE_PORT),
          },
        }
      : {}),
    build: {
      lib: {
        entry: path.resolve(__dirname, `${root}/index.js`),
        formats: ['cjs', 'es'],
        fileName: format => `index.${format}.js`,
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `
          @import "src/styles/base/_mixins.scss";
          @import "src/styles/base/_placeholders.scss";
          @import "src/styles/base/_functions.scss";
          @import "src/styles/base/_media.scss";
        `,
        },
      },
      devSourcemap: true,
    },
    resolve: {
      alias: {
        '@': `${root}/`,
        '@static': `${root}/../static`,
      },
    },
  };
});
