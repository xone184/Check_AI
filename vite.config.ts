import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

/** Miền xem trước công khai CodeSandbox, ví dụ https://abc123-3000.csb.app */
function codesandboxPublicOrigin(): string {
  const host = process.env.CODESANDBOX_HOST?.trim();
  if (!host) return "";
  if (host.startsWith("http://") || host.startsWith("https://")) return host;
  return `https://${host}`;
}

export default defineConfig(() => {
  const csbOrigin = codesandboxPublicOrigin();
  return {
    define: {
      "import.meta.env.VITE_CSB_PUBLIC_ORIGIN": JSON.stringify(csbOrigin),
    },
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3000,
      host: true,
      strictPort: false,
      allowedHosts: true as const,
      hmr: process.env.DISABLE_HMR !== 'true',
    },
    preview: {
      host: true,
      port: 4173,
      strictPort: false,
      allowedHosts: true as const,
    },
  };
});
