import { defineConfig } from 'vite';
import vercel from 'vite-plugin-vercel';

export default defineConfig({
  server: {
    port: process.env.PORT as unknown as number,
  },
  plugins: [vercel()],
  build: {
    lib: {
      entry: './src/server.ts',
      formats: ['cjs'],
      fileName: 'server'
    },
    rollupOptions: {
      external: ['express', 'pg', /node:.*/]
    }
  }
});