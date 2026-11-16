// Entry da versão CLIENTE (público) — carrega demo via DEMO=loja|estetica|lanches
import { initApp } from './app';
import { loadDemoCatalogMerged, getCurrentTheme, getCurrentCopy } from './demo-loader';

async function bootstrapClient() {
  try {
    const [catalog, theme, copy] = await Promise.all([
      loadDemoCatalogMerged(false), // false = não é lojista (usa catalog-public.json)
      getCurrentTheme(),
      getCurrentCopy(),
    ]);
    initApp(catalog, 'cliente', theme, copy);
  } catch (e) {
    console.error('[main] Falha ao carregar demo para cliente:', e);
    initApp(
      {
        store: { name: 'Demo', city: '', delivery: '', warranty: '', payment: '', whatsapp: '' },
        categories: [],
      },
      'cliente'
    );
  }
}

bootstrapClient();