import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import fs from 'fs';

// Plugin para servir lojista.html na raiz quando na porta 3001
function lojistaHtmlPlugin() {
  return {
    name: 'lojista-html',
    configureServer(server) {
      // Middleware executado ANTES do middleware padrão do Vite
      server.middlewares.use((req, res, next) => {
        const isLojistaPort = process.env.VITE_PORT === '3001' || process.env.PORT === '3001';
        if (isLojistaPort && req.url === '/') {
          // Serve lojista.html diretamente
          const htmlPath = path.resolve(__dirname, 'lojista.html');
          const html = fs.readFileSync(htmlPath, 'utf-8');
          res.setHeader('Content-Type', 'text/html');
          res.end(html);
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  // Carrega env vars do .env e .env.<mode>
  const env = loadEnv(mode, process.cwd(), '');

  const demo = env.VITE_DEMO || env.DEMO || 'loja';

  return {
    plugins: [tailwindcss(), lojistaHtmlPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
          lojista: path.resolve(__dirname, 'lojista.html'),
        },
      },
      // Define a variável DEMO no build para o demo-loader
      define: {
        'import.meta.env.DEMO': JSON.stringify(demo),
        'import.meta.env.VITE_DEMO': JSON.stringify(demo),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      allowedHosts: true as const,
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    preview: {
      allowedHosts: true as const,
    },
  };
});