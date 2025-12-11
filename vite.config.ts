import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    base: './', // Ensures assets are linked relatively for GitHub Pages
    define: {
      // Safe replacement for process.env.API_KEY
      'process.env.API_KEY': JSON.stringify(env.API_KEY || ''),
      // Prevent "process is not defined" error in browser
      'process.env': {} 
    }
  };
});