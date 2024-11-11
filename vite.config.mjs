import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  root: 'public',
  server: {
    port: 5173,
    proxy: {
      '/socket.io': {
        target: 'http://localhost:3000',
        ws: true,
      },
    },
  },
  build: {
    outDir: '../dist_public',
    emptyOutDir: true,
  },
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: '**/*.html',
          dest: '.',
        },
        {
          src: 'output.css',
          dest: '.',
        },
        {
          src: 'js/**/*',
          dest: 'js',
        },
      ],
    }),
  ],
});
