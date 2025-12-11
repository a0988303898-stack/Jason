import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    base: './', // Ensures assets are linked relatively for GitHub Pages
    define: {
      // Only define specific keys. Do NOT define 'process.env' object as it breaks React.
      'process.env.API_KEY': JSON.stringify(env.API_KEY || '')
    }
  };
});