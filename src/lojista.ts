// Entry da versão LOJISTA (admin) — carrega demo via DEMO=loja|estetica|lanches
import { initApp } from './app';
import { loadDemoCatalogMerged, getCurrentTheme, getCurrentCopy } from './demo-loader';

async function bootstrapLojista() {
  try {
    const [catalog, theme, copy] = await Promise.all([
      loadDemoCatalogMerged(true), // true = lojista (usa catalog-data.json com custos)
      getCurrentTheme(),
      getCurrentCopy(),
    ]);
    initApp(catalog, 'lojista', theme, copy);
  } catch (e) {
    console.error('[lojista] Falha ao carregar demo para lojista:', e);
    initApp(
      {
        store: { name: 'Demo', city: '', delivery: '', warranty: '', payment: '', whatsapp: '' },
        categories: [],
      },
      'lojista'
    );
  }
}

bootstrapLojista();