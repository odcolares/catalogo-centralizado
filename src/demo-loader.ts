/**
 * Demo Loader — carrega configuração de demo baseada em env DEMO=loja|estetica|lanches
 * Precedência: base defaults → theme preset → demo config/overrides → demo catalog
 */

import type { CatalogData, Store, ThemeTokens, CopyTexts } from './app';

// Tipos para configuração de demo
export interface DemoConfig {
  demo: string;
  preset: string;
  store: Store;
  logo?: { src: string; alt: string };
  customImages?: Record<string, string>;
}

export interface ThemePreset {
  id: string;
  label: string;
  description: string;
  theme: ThemeTokens;
  copy: CopyTexts;
  storeDefaults: Partial<Store> & {
    categories?: Array<{ id: string; name: string; icon: string; order: number }>;
    tags?: string[];
  };
}

// Cache dos módulos carregados
const themeCache = new Map<string, ThemePreset>();
const configCache = new Map<string, DemoConfig>();
const catalogCache = new Map<string, CatalogData>();

/** Obtém o nome do demo ativo via import.meta.env (Vite) ou fallback */
export function getActiveDemo(): string {
  // Vite expõe import.meta.env.VITE_DEMO ou import.meta.env.DEMO
  const envDemo = (import.meta as any).env?.VITE_DEMO
    || (import.meta as any).env?.DEMO
    || 'loja'; // default
  return envDemo;
}

/** Carrega preset de tema (themes/<id>.json) */
export async function loadThemePreset(presetId: string): Promise<ThemePreset> {
  if (themeCache.has(presetId)) return themeCache.get(presetId)!;

  try {
    // @ts-ignore - import dinâmico com variável
    const module = await import(`../themes/${presetId}.json`);
    const preset = module.default as ThemePreset;
    themeCache.set(presetId, preset);
    return preset;
  } catch (e) {
    console.warn(`[demo-loader] Preset "${presetId}" não encontrado, usando defaults`);
    return getDefaultThemePreset();
  }
}

/** Carrega config do demo (demos/<demo>/config.json) */
export async function loadDemoConfig(demoId: string): Promise<DemoConfig> {
  if (configCache.has(demoId)) return configCache.get(demoId)!;

  try {
    // @ts-ignore - import dinâmico com variável
    const module = await import(`../demos/${demoId}/config.json`);
    const config = module.default as DemoConfig;
    configCache.set(demoId, config);
    return config;
  } catch (e) {
    console.warn(`[demo-loader] Config do demo "${demoId}" não encontrada, usando defaults`);
    return getDefaultDemoConfig(demoId);
  }
}

/** Carrega catálogo do demo (data ou public) */
export async function loadDemoCatalog(demoId: string, isLojista: boolean): Promise<CatalogData> {
  const cacheKey = `${demoId}:${isLojista ? 'data' : 'public'}`;
  if (catalogCache.has(cacheKey)) return catalogCache.get(cacheKey)!;

  const catalogFile = isLojista ? 'catalog-data.json' : 'catalog-public.json';

  try {
    // @ts-ignore - import dinâmico com variável
    const module = await import(`../demos/${demoId}/${catalogFile}`);
    const catalog = module.default as CatalogData;
    catalogCache.set(cacheKey, catalog);
    return catalog;
  } catch (e) {
    console.warn(`[demo-loader] Catálogo "${catalogFile}" do demo "${demoId}" não encontrado`);
    return getEmptyCatalog();
  }
}

/** Mescla preset + config + catálogo com precedência correta */
export function mergeDemoData(
  preset: ThemePreset,
  config: DemoConfig,
  catalog: CatalogData
): CatalogData {
  // Store mesclado: catalog.store (base) → preset.storeDefaults → config.store (override final)
  const mergedStore: Store = {
    ...catalog.store,
    ...preset.storeDefaults,
    ...config.store,
    // Garantir que campos obrigatórios existam
    name: config.store.name || preset.storeDefaults.name || catalog.store.name || 'Demo',
    city: config.store.city || preset.storeDefaults.city || catalog.store.city || 'Manaus/AM',
    whatsapp: config.store.whatsapp || preset.storeDefaults.whatsapp || catalog.store.whatsapp || '',
  };

  // Categories: usar do catálogo (já vêm com produtos), mas ordenar conforme preset se disponível
  let categories = catalog.categories;
  if (preset.storeDefaults.categories?.length) {
    const presetOrder = new Map(preset.storeDefaults.categories.map((c, i) => [c.id, i]));
    categories = [...categories].sort((a, b) => {
      const oa = presetOrder.has(a.id) ? presetOrder.get(a.id)! : 999;
      const ob = presetOrder.has(b.id) ? presetOrder.get(b.id)! : 999;
      return oa - ob;
    });
  }

  return {
    store: mergedStore,
    categories,
  };
}

/** Carrega tudo e retorna catálogo final mesclado */
export async function loadDemoCatalogMerged(isLojista: boolean): Promise<CatalogData> {
  const demoId = getActiveDemo();

  // Primeiro carrega config para saber qual preset usar
  const config = await loadDemoConfig(demoId);
  const presetId = config.preset || demoId;

  // Carrega preset e catálogo em paralelo
  const [preset, catalog] = await Promise.all([
    loadThemePreset(presetId),
    loadDemoCatalog(demoId, isLojista),
  ]);

  return mergeDemoData(preset, config, catalog);
}

// Defaults fallback
function getDefaultThemePreset(): ThemePreset {
  return {
    id: 'loja',
    label: 'Loja',
    description: 'Preset padrão',
    theme: {
      primary: '#0a8754',
      primaryHover: '#087047',
      primaryLight: '#ecfdf5',
      accent: '#f59e0b',
      surface: '#ffffff',
      surfaceAlt: '#f8fafc',
      textPrimary: '#0f172a',
      textSecondary: '#475569',
      border: '#e2e8f0',
      logoStyle: 'rounded-full',
      iconStyle: 'rounded-xl',
    },
    copy: {
      heroTitle: 'Sua loja no WhatsApp',
      heroSubtitle: 'Catálogo bonito, pedido direto, controle total',
      ctaPrimary: 'Ver catálogo',
      ctaSecondary: 'Falar no WhatsApp',
      emptyState: 'Nenhum produto cadastrado ainda',
      footerNote: 'Entregamos em Manaus via motoboy.',
    },
    storeDefaults: {
      city: 'Manaus/AM',
      minOrder: 0,
    },
  };
}

function getDefaultDemoConfig(demoId: string): DemoConfig {
  return {
    demo: demoId,
    preset: demoId,
    store: {
      name: `Demo ${demoId.charAt(0).toUpperCase() + demoId.slice(1)}`,
      whatsapp: '5592999999999',
      city: 'Manaus/AM',
      delivery: 'Consulte condições.',
      warranty: 'Consulte condições.',
      payment: 'PIX para pedidos. Dinheiro/cartão apenas in loco.',
      minOrder: 0,
    },
    logo: { src: 'images/logo.jpg', alt: `Demo ${demoId}` },
  };
}

function getEmptyCatalog(): CatalogData {
  return {
    store: {
      name: '',
      city: '',
      delivery: '',
      warranty: '',
      payment: '',
      whatsapp: '',
    },
    categories: [],
  };
}

/** Exporta tema atual para uso em componentes (CSS vars, etc.) */
export async function getCurrentTheme(): Promise<ThemeTokens> {
  const demoId = getActiveDemo();
  const config = await loadDemoConfig(demoId);
  const preset = await loadThemePreset(config.preset || demoId);
  return preset.theme;
}

/** Exporta copy atual para uso em componentes */
export async function getCurrentCopy(): Promise<CopyTexts> {
  const demoId = getActiveDemo();
  const config = await loadDemoConfig(demoId);
  const preset = await loadThemePreset(config.preset || demoId);
  return preset.copy;
}