
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    server: {
      host: '0.0.0.0',
      port: 3000,
      strictPort: true,
      watch: {
        usePolling: true,
      },
      hmr: {
        protocol: 'wss',
        clientPort: 443,
        overlay: false,
      },
    },
    build: {
      outDir: 'dist',
    },
    define: {
      // Ensure the key is at least an empty string to prevent SDK initialization crashes
      'process.env.API_KEY': JSON.stringify(env.API_KEY || ""),
    },
  };
});
