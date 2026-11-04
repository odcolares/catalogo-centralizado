import './style.css';
import catalogDataRaw from '../catalog-data.json';

interface Product {
  id: string;
  name: string;
  code: string;
  cost: number;
  price: number;
  price_max?: number;
  highlights: string[];
  tags: string[];
}

interface Category {
  id: string;
  name: string;
  icon: string;
  products: Product[];
}

interface Store {
  name: string;
  city: string;
  delivery: string;
  warranty: string;
  payment: string;
  whatsapp: string;
  contacts?: Record<string, string>;
  supplier?: string;
  minOrder?: number;
}

interface CatalogData {
  store: Store;
  categories: Category[];
}

const catalog: CatalogData = catalogDataRaw as CatalogData;

// State
let activeTab: 'catalog' | 'table' | 'markdown' | 'api' = 'catalog';
let searchQuery = '';
let selectedCategory = 'all';
let selectedTag = 'all';
let showCostMargins = false;
let sortBy: 'default' | 'price-asc' | 'price-desc' | 'name' | 'margin' = 'default';

function brl(value?: number | null): string {
  if (value === null || value === undefined) return '—';
  return 'R$ ' + Number(value).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function showToast(message: string) {
  const existing = document.getElementById('toast-notification');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'toast-notification';
  toast.className =
    'fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-zinc-900 text-white px-4 py-2.5 rounded-lg shadow-xl text-sm font-medium transition-all animate-fade-in border border-zinc-700';
  toast.innerHTML = `<span>✓</span><span>${escapeHtml(message)}</span>`;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 2200);
}

// Generate WhatsApp link
function getWhatsAppUrl(product: Product): string {
  const store = catalog.store || {};
  const waNumber = (store.whatsapp || '').replace(/\D/g, '');
  const msg = encodeURIComponent(
    `Olá! Vi o catálogo da ${store.name || 'loja'} e tenho interesse no produto: ${product.name} (${product.code}). Poderia me confirmar a disponibilidade?`
  );
  return `https://wa.me/${waNumber}?text=${msg}`;
}

// Collect all unique tags
const allTags = Array.from(
  new Set(
    catalog.categories.flatMap((cat) =>
      cat.products.flatMap((p) => p.tags || [])
    )
  )
).sort();

// Calculate totals
const totalProducts = catalog.categories.reduce(
  (acc, c) => acc + c.products.length,
  0
);

function getFilteredProducts(): { category: Category; product: Product }[] {
  const query = searchQuery.trim().toLowerCase();
  const results: { category: Category; product: Product }[] = [];

  for (const cat of catalog.categories) {
    if (selectedCategory !== 'all' && cat.id !== selectedCategory) continue;

    for (const p of cat.products) {
      if (selectedTag !== 'all' && !(p.tags || []).includes(selectedTag)) {
        continue;
      }

      if (query) {
        const matchName = p.name.toLowerCase().includes(query);
        const matchCode = p.code.toLowerCase().includes(query);
        const matchHighlights = p.highlights.some((h) =>
          h.toLowerCase().includes(query)
        );
        const matchTags = (p.tags || []).some((t) =>
          t.toLowerCase().includes(query)
        );
        const matchCat = cat.name.toLowerCase().includes(query);

        if (!matchName && !matchCode && !matchHighlights && !matchTags && !matchCat) {
          continue;
        }
      }

      results.push({ category: cat, product: p });
    }
  }

  // Sort
  if (sortBy === 'price-asc') {
    results.sort((a, b) => a.product.price - b.product.price);
  } else if (sortBy === 'price-desc') {
    results.sort((a, b) => b.product.price - a.product.price);
  } else if (sortBy === 'name') {
    results.sort((a, b) => a.product.name.localeCompare(b.product.name));
  } else if (sortBy === 'margin') {
    results.sort((a, b) => {
      const marginA = a.product.cost > 0 ? (a.product.price - a.product.cost) / a.product.cost : 0;
      const marginB = b.product.cost > 0 ? (b.product.price - b.product.cost) / b.product.cost : 0;
      return marginB - marginA;
    });
  }

  return results;
}

function buildMarkdownText(): string {
  const store = catalog.store || {};
  const lines: string[] = [];
  lines.push(`# Catálogo Consolidado — ${store.name || '[Nome da Loja]'}`);
  lines.push('');
  lines.push(
    `> **Fonte custo:** ${store.supplier || 'luizeletronicos.com.br'} | **Cidade:** ${store.city || 'Manaus/AM'}`
  );
  lines.push(`> **Entrega:** ${store.delivery || ''}`);
  lines.push(`> **Garantia:** ${store.warranty || ''}`);
  lines.push(`> **Pagamento:** ${store.payment || ''}`);
  lines.push(`> **Pedido mínimo:** ${brl(store.minOrder)}`);
  lines.push('');

  let total = 0;
  const summary = [
    '| Categoria | Qtd Produtos | Faixa de Preço (venda) |',
    '|-----------|-------------|------------------------|',
  ];
  for (const cat of catalog.categories) {
    const prices = cat.products.map((p) => p.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = min === max ? brl(min) : `${brl(min)} – ${brl(max)}`;
    summary.push(`| ${cat.icon || ''} ${cat.name} | ${cat.products.length} | ${range} |`);
    total += cat.products.length;
  }
  summary.push(`| **TOTAL** | **${total} produtos** | — |`);
  lines.push(...summary, '');

  for (const cat of catalog.categories) {
    lines.push(`## ${cat.icon || ''} ${cat.name}`.trim());
    lines.push('');
    lines.push('| Modelo | Código | Custo | Preço de Venda | Margem | Destaques |');
    lines.push('|--------|--------|-------|----------------|--------|-----------|');
    for (const p of cat.products) {
      const margin = p.cost > 0 ? Math.round(((p.price - p.cost) / p.cost) * 100) : 0;
      let priceCell = brl(p.price);
      if (p.price_max && p.price_max > p.price) priceCell += ` – ${brl(p.price_max)}`;
      const kit = (p.tags || []).includes('kit') ? ' 🎁 Kit' : '';
      lines.push(
        `| ${p.name.replace(/\|/g, '\\|')}${kit} | ${p.code.replace(/\|/g, '\\|')} | ${brl(p.cost)} | ${priceCell} | ${margin}% | ${p.highlights.join(', ').replace(/\|/g, '\\|')} |`
      );
    }
    lines.push('');
  }

  lines.push('---');
  lines.push('');
  lines.push('Gerado automaticamente a partir de `catalog-data.json`.');
  return lines.join('\n');
}

function renderApp() {
  const app = document.querySelector<HTMLDivElement>('#app')!;
  const store = catalog.store || {};
  const filtered = getFilteredProducts();

  app.innerHTML = `
    <!-- Header -->
    <header class="bg-[#0a8754] text-white shadow-md">
      <div class="max-w-6xl mx-auto px-4 py-6">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div class="inline-flex items-center gap-2 bg-emerald-700/60 text-emerald-100 text-xs font-semibold px-2.5 py-1 rounded-full mb-2">
              <span>📍 ${escapeHtml(store.city || 'Manaus/AM')}</span>
              <span>•</span>
              <span>${totalProducts} Produtos Catalogados</span>
            </div>
            <h1 class="text-2xl md:text-3xl font-extrabold tracking-tight">
              ${escapeHtml(store.name || 'Catálogo de Eletrônicos')}
            </h1>
            <p class="text-emerald-100 text-sm mt-1 max-w-xl">
              Catálogo centralizado com estoque, especificações, preços de atacado e venda local em Manaus.
            </p>
          </div>

          <div class="flex flex-col sm:flex-row gap-2">
            <a href="https://wa.me/${(store.whatsapp || '').replace(/\D/g, '')}"
               target="_blank" rel="noopener"
               class="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold px-4 py-2.5 rounded-lg shadow transition text-sm">
              <span>💬 Atendimento WhatsApp</span>
            </a>
            <button id="toggle-margins-btn"
                    class="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-emerald-400/40 hover:bg-emerald-700/50 transition">
              ${showCostMargins ? '👁️ Ocultar Custos/Margens' : '📈 Modo Lojista (Custos)'}
            </button>
          </div>
        </div>

        <!-- Info Badges -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-5 pt-4 border-t border-emerald-600/60 text-xs text-emerald-50">
          <div class="flex items-center gap-2 bg-emerald-800/40 px-3 py-2 rounded-md">
            <span>🚚</span>
            <span><strong>Entrega:</strong> ${escapeHtml(store.delivery || 'Motoboy no mesmo dia')}</span>
          </div>
          <div class="flex items-center gap-2 bg-emerald-800/40 px-3 py-2 rounded-md">
            <span>✅</span>
            <span><strong>Garantia:</strong> ${escapeHtml(store.warranty || 'Garantia local 30 dias')}</span>
          </div>
          <div class="flex items-center gap-2 bg-emerald-800/40 px-3 py-2 rounded-md">
            <span>💳</span>
            <span><strong>Pagamento:</strong> ${escapeHtml(store.payment || 'PIX ou dinheiro')}</span>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Navigation Tabs -->
    <nav class="bg-white border-b border-zinc-200 sticky top-0 z-30 shadow-xs">
      <div class="max-w-6xl mx-auto px-4 flex overflow-x-auto gap-2 py-2">
        <button class="nav-tab px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition ${
          activeTab === 'catalog'
            ? 'bg-emerald-50 text-[#0a8754] font-bold border border-emerald-200'
            : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
        }" data-tab="catalog">
          📱 Catálogo Digital (${filtered.length})
        </button>
        <button class="nav-tab px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition ${
          activeTab === 'table'
            ? 'bg-emerald-50 text-[#0a8754] font-bold border border-emerald-200'
            : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
        }" data-tab="table">
          📊 Tabela & Margens
        </button>
        <button class="nav-tab px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition ${
          activeTab === 'markdown'
            ? 'bg-emerald-50 text-[#0a8754] font-bold border border-emerald-200'
            : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
        }" data-tab="markdown">
          📄 Markdown Consolidado
        </button>
        <button class="nav-tab px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition ${
          activeTab === 'api'
            ? 'bg-emerald-50 text-[#0a8754] font-bold border border-emerald-200'
            : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
        }" data-tab="api">
          🔌 API JSON
        </button>
      </div>
    </nav>

    <!-- Main Content Area -->
    <main class="max-w-6xl mx-auto px-4 py-6">
      ${renderTabContent(filtered)}
    </main>

    <!-- Footer -->
    <footer class="border-t border-zinc-200 bg-white mt-12 py-6 text-center text-xs text-zinc-500">
      <div class="max-w-6xl mx-auto px-4">
        <p>Catálogo centralizado de eletrônicos em Manaus/AM • Fonte única em <code>catalog-data.json</code></p>
        <p class="mt-1">Gera simultaneamente HTML responsivo, Markdown consolidado e API JSON estruturada.</p>
      </div>
    </footer>
  `;

  attachEventListeners();
}

function renderTabContent(filtered: { category: Category; product: Product }[]): string {
  if (activeTab === 'table') {
    return renderTableView();
  }
  if (activeTab === 'markdown') {
    return renderMarkdownView();
  }
  if (activeTab === 'api') {
    return renderApiView();
  }
  return renderCatalogView(filtered);
}

function renderCatalogView(filtered: { category: Category; product: Product }[]): string {
  // Category quick filter chips
  const categoryChips = [
    { id: 'all', name: 'Todas', icon: '🌐', count: totalProducts },
    ...catalog.categories.map((c) => ({
      id: c.id,
      name: c.name,
      icon: c.icon,
      count: c.products.length,
    })),
  ]
    .map(
      (cat) => `
      <button class="cat-filter-btn inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition border ${
        selectedCategory === cat.id
          ? 'bg-[#0a8754] text-white border-[#0a8754] shadow-xs'
          : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50'
      }" data-cat="${cat.id}">
        <span>${cat.icon}</span>
        <span>${escapeHtml(cat.name)}</span>
        <span class="opacity-75 font-normal">(${cat.count})</span>
      </button>`
    )
    .join('');

  // Tag filter chips
  const tagChips = [
    'all',
    'mais-vendido',
    'kit',
    'gamer',
    'entrada',
    'intermediario',
    'premium',
    'esportivo',
    'usb-c',
  ]
    .map((tag) => {
      const label =
        tag === 'all'
          ? 'Todos os tipos'
          : tag === 'kit'
          ? '🎁 Kits'
          : tag === 'mais-vendido'
          ? '🔥 Mais Vendidos'
          : tag === 'gamer'
          ? '🎮 Gamer'
          : tag.charAt(0).toUpperCase() + tag.slice(1);
      return `
        <button class="tag-filter-btn px-2.5 py-1 rounded-md text-xs font-medium transition ${
          selectedTag === tag
            ? 'bg-zinc-900 text-white'
            : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
        }" data-tag="${tag}">
          ${label}
        </button>
      `;
    })
    .join('');

  // Products grid or empty
  let productsHtml = '';
  if (filtered.length === 0) {
    productsHtml = `
      <div class="bg-white rounded-xl border border-zinc-200 p-12 text-center text-zinc-500">
        <p class="text-3xl mb-2">🔍</p>
        <p class="text-base font-semibold text-zinc-800">Nenhum produto encontrado</p>
        <p class="text-sm text-zinc-500 mt-1">Tente buscar por outro termo ou limpe os filtros de categoria.</p>
        <button id="clear-filters-btn" class="mt-4 px-4 py-2 bg-[#0a8754] text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition">
          Limpar Filtros
        </button>
      </div>
    `;
  } else {
    // Group by category if "all" is selected and no search query, or show direct cards
    productsHtml = `
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        ${filtered
          .map(({ category, product: p }) => {
            const isKit = (p.tags || []).includes('kit');
            const isTop = (p.tags || []).includes('mais-vendido');
            const margin =
              p.cost > 0 ? Math.round(((p.price - p.cost) / p.cost) * 100) : 0;
            const profit = p.price - p.cost;

            return `
              <article class="bg-white rounded-xl border border-zinc-200 shadow-xs hover:shadow-md transition-shadow flex flex-col overflow-hidden">
                <div class="p-4 flex-1 flex flex-col">
                  <!-- Header: category & badges -->
                  <div class="flex items-center justify-between gap-2 mb-2">
                    <span class="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1">
                      <span>${category.icon}</span>
                      <span>${escapeHtml(category.name)}</span>
                    </span>
                    <div class="flex gap-1">
                      ${isTop ? '<span class="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded">🔥 TOP</span>' : ''}
                      ${isKit ? '<span class="bg-orange-100 text-orange-800 text-[10px] font-bold px-1.5 py-0.5 rounded">🎁 KIT</span>' : ''}
                    </div>
                  </div>

                  <!-- Product Name & Code -->
                  <h3 class="font-bold text-zinc-900 text-base leading-snug">
                    ${escapeHtml(p.name)}
                  </h3>
                  <p class="text-zinc-500 text-xs mt-0.5 mb-3 font-mono">
                    Cód: ${escapeHtml(p.code)}
                  </p>

                  <!-- Highlights -->
                  <ul class="text-xs text-zinc-600 space-y-1 mb-4 flex-1">
                    ${p.highlights
                      .map(
                        (h) => `
                      <li class="flex items-start gap-1.5">
                        <span class="text-emerald-600 mt-0.5 font-bold">✓</span>
                        <span>${escapeHtml(h)}</span>
                      </li>
                    `
                      )
                      .join('')}
                  </ul>

                  <!-- Pricing Box -->
                  <div class="pt-3 border-t border-zinc-100 mb-3">
                    <div class="flex items-baseline justify-between">
                      <span class="text-xs text-zinc-500 font-medium">Preço à vista:</span>
                      <div class="text-right">
                        <span class="text-lg font-black text-[#0a8754]">${brl(p.price)}</span>
                        ${
                          p.price_max && p.price_max > p.price
                            ? `<span class="block text-[11px] text-zinc-400">até ${brl(p.price_max)}</span>`
                            : ''
                        }
                      </div>
                    </div>

                    ${
                      showCostMargins
                        ? `
                      <div class="mt-2 pt-2 border-t border-dashed border-zinc-200 text-xs bg-zinc-50 -mx-4 -mb-3 p-3">
                        <div class="grid grid-cols-3 gap-1 text-center font-mono">
                          <div>
                            <span class="text-[10px] text-zinc-400 block uppercase">Custo</span>
                            <span class="text-zinc-700 font-semibold">${brl(p.cost)}</span>
                          </div>
                          <div>
                            <span class="text-[10px] text-zinc-400 block uppercase">Lucro</span>
                            <span class="text-emerald-700 font-semibold">${brl(profit)}</span>
                          </div>
                          <div>
                            <span class="text-[10px] text-zinc-400 block uppercase">Margem</span>
                            <span class="text-indigo-700 font-bold">${margin}%</span>
                          </div>
                        </div>
                      </div>
                    `
                        : ''
                    }
                  </div>

                  <!-- WhatsApp CTA Button -->
                  <a href="${getWhatsAppUrl(p)}"
                     target="_blank" rel="noopener"
                     class="w-full inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold py-2.5 px-4 rounded-lg text-sm shadow-xs transition">
                    <span>Pedir no WhatsApp</span>
                  </a>
                </div>
              </article>
            `;
          })
          .join('')}
      </div>
    `;
  }

  return `
    <div class="space-y-4">
      <!-- Search & Filters Toolbar -->
      <div class="bg-white p-4 rounded-xl border border-zinc-200 shadow-xs space-y-3">
        <div class="flex flex-col sm:flex-row gap-3">
          <div class="relative flex-1">
            <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
              🔍
            </span>
            <input type="text"
                   id="search-input"
                   value="${escapeHtml(searchQuery)}"
                   placeholder="Buscar modelo, código ou característica (ex: Smartwatch, D20, 60h, Type-C)..."
                   class="w-full pl-9 pr-4 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0a8754] focus:border-[#0a8754]" />
            ${
              searchQuery
                ? `<button id="clear-search-btn" class="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-600">✕</button>`
                : ''
            }
          </div>

          <div class="flex gap-2">
            <select id="sort-select"
                    class="border border-zinc-300 rounded-lg px-3 py-2 text-sm bg-white text-zinc-700 focus:outline-none focus:ring-2 focus:ring-[#0a8754]">
              <option value="default" ${sortBy === 'default' ? 'selected' : ''}>Ordenação Padrão</option>
              <option value="price-asc" ${sortBy === 'price-asc' ? 'selected' : ''}>Menor Preço</option>
              <option value="price-desc" ${sortBy === 'price-desc' ? 'selected' : ''}>Maior Preço</option>
              <option value="name" ${sortBy === 'name' ? 'selected' : ''}>Nome (A-Z)</option>
              ${showCostMargins ? `<option value="margin" ${sortBy === 'margin' ? 'selected' : ''}>Maior Margem %</option>` : ''}
            </select>
          </div>
        </div>

        <!-- Category pills -->
        <div class="flex flex-wrap gap-1.5 pt-1">
          ${categoryChips}
        </div>

        <!-- Tag chips -->
        <div class="flex flex-wrap items-center gap-1.5 pt-1 border-t border-zinc-100">
          <span class="text-xs text-zinc-400 mr-1">Filtro rápido:</span>
          ${tagChips}
        </div>
      </div>

      <!-- Results info bar -->
      <div class="flex items-center justify-between text-xs text-zinc-500 px-1">
        <span>Exibindo <strong>${filtered.length}</strong> de ${totalProducts} produtos</span>
        ${
          selectedCategory !== 'all' || selectedTag !== 'all' || searchQuery
            ? `<button id="reset-all-filters-btn" class="text-emerald-700 font-semibold hover:underline">Limpar todos os filtros</button>`
            : ''
        }
      </div>

      <!-- Grid -->
      ${productsHtml}
    </div>
  `;
}

function renderTableView(): string {
  let totalCost = 0;
  let totalPrice = 0;
  let allCount = 0;

  const rows = catalog.categories.flatMap((cat) =>
    cat.products.map((p) => {
      totalCost += p.cost;
      totalPrice += p.price;
      allCount++;
      const margin = p.cost > 0 ? Math.round(((p.price - p.cost) / p.cost) * 100) : 0;
      const profit = p.price - p.cost;
      return `
        <tr class="hover:bg-zinc-50 border-b border-zinc-100 text-xs">
          <td class="p-3 font-medium text-zinc-900">${escapeHtml(p.name)}</td>
          <td class="p-3 text-zinc-500 font-mono">${escapeHtml(p.code)}</td>
          <td class="p-3 text-zinc-600">${cat.icon} ${escapeHtml(cat.name)}</td>
          <td class="p-3 font-mono text-right text-zinc-600">${brl(p.cost)}</td>
          <td class="p-3 font-mono text-right font-bold text-emerald-700">${brl(p.price)}</td>
          <td class="p-3 font-mono text-right text-zinc-700">${brl(profit)}</td>
          <td class="p-3 font-mono text-right font-semibold ${margin >= 100 ? 'text-emerald-600' : 'text-amber-600'}">${margin}%</td>
          <td class="p-3 text-right">
            <a href="${getWhatsAppUrl(p)}" target="_blank" rel="noopener" class="text-emerald-600 hover:text-emerald-800 font-semibold">
              WhatsApp ↗
            </a>
          </td>
        </tr>
      `;
    })
  );

  const avgMargin = totalCost > 0 ? Math.round(((totalPrice - totalCost) / totalCost) * 100) : 0;

  return `
    <div class="space-y-4">
      <!-- Summary metrics cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-white p-4 rounded-xl border border-zinc-200">
          <span class="text-xs text-zinc-400 uppercase font-semibold">Total de SKUs</span>
          <p class="text-2xl font-black text-zinc-900 mt-1">${allCount}</p>
        </div>
        <div class="bg-white p-4 rounded-xl border border-zinc-200">
          <span class="text-xs text-zinc-400 uppercase font-semibold">Custo Total 1 Unidade</span>
          <p class="text-2xl font-black text-zinc-900 mt-1">${brl(totalCost)}</p>
        </div>
        <div class="bg-white p-4 rounded-xl border border-zinc-200">
          <span class="text-xs text-zinc-400 uppercase font-semibold">Venda Total 1 Unidade</span>
          <p class="text-2xl font-black text-emerald-700 mt-1">${brl(totalPrice)}</p>
        </div>
        <div class="bg-white p-4 rounded-xl border border-zinc-200">
          <span class="text-xs text-zinc-400 uppercase font-semibold">Margem Média Bruta</span>
          <p class="text-2xl font-black text-indigo-700 mt-1">${avgMargin}%</p>
        </div>
      </div>

      <!-- Table Container -->
      <div class="bg-white rounded-xl border border-zinc-200 shadow-xs overflow-hidden">
        <div class="p-4 border-b border-zinc-200 flex items-center justify-between">
          <div>
            <h2 class="text-base font-bold text-zinc-900">Tabela Consolidada de Produtos & Margens</h2>
            <p class="text-xs text-zinc-500">Dados diretos de custo e preço em Manaus/AM</p>
          </div>
          <button id="copy-table-csv-btn" class="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold rounded-lg transition">
            📋 Copiar CSV
          </button>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead class="bg-zinc-50 border-b border-zinc-200 text-[11px] uppercase font-bold text-zinc-500">
              <tr>
                <th class="p-3">Produto</th>
                <th class="p-3">Código</th>
                <th class="p-3">Categoria</th>
                <th class="p-3 text-right">Custo Atacado</th>
                <th class="p-3 text-right">Preço Venda</th>
                <th class="p-3 text-right">Lucro Un.</th>
                <th class="p-3 text-right">Margem %</th>
                <th class="p-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody>
              ${rows.join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

function renderMarkdownView(): string {
  const md = buildMarkdownText();
  return `
    <div class="space-y-4">
      <div class="bg-white p-4 rounded-xl border border-zinc-200 shadow-xs flex items-center justify-between">
        <div>
          <h2 class="text-base font-bold text-zinc-900">Catálogo em Markdown</h2>
          <p class="text-xs text-zinc-500">Pronto para exportar, publicar no GitHub, Notion ou WhatsApp</p>
        </div>
        <button id="copy-markdown-btn" class="px-4 py-2 bg-[#0a8754] text-white hover:bg-emerald-700 text-xs font-bold rounded-lg shadow-xs transition">
          📋 Copiar Markdown
        </button>
      </div>

      <div class="bg-zinc-900 text-zinc-100 p-5 rounded-xl font-mono text-xs overflow-x-auto border border-zinc-800 max-h-[600px] leading-relaxed">
        <pre>${escapeHtml(md)}</pre>
      </div>
    </div>
  `;
}

function renderApiView(): string {
  const apiData = catalog.categories.flatMap((cat) =>
    cat.products.map((p) => ({
      id: p.id,
      name: p.name,
      code: p.code,
      cost: p.cost,
      price: p.price,
      price_max: p.price_max || null,
      category: cat.id,
      categoryName: cat.name,
      highlights: p.highlights,
      tags: p.tags,
      whatsappOrderUrl: getWhatsAppUrl(p),
    }))
  );

  const jsonString = JSON.stringify(apiData, null, 2);

  return `
    <div class="space-y-4">
      <div class="bg-white p-4 rounded-xl border border-zinc-200 shadow-xs flex items-center justify-between">
        <div>
          <h2 class="text-base font-bold text-zinc-900">API JSON do Catálogo (${apiData.length} itens)</h2>
          <p class="text-xs text-zinc-500">Formato consumível por chatbots (Tidio, ManyChat), apps móveis e automações</p>
        </div>
        <div class="flex gap-2">
          <a href="/catalog-api.json" target="_blank" class="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold rounded-lg transition">
            🔗 Abrir /catalog-api.json
          </a>
          <button id="copy-json-btn" class="px-4 py-2 bg-[#0a8754] text-white hover:bg-emerald-700 text-xs font-bold rounded-lg shadow-xs transition">
            📋 Copiar JSON
          </button>
        </div>
      </div>

      <div class="bg-zinc-950 text-emerald-400 p-5 rounded-xl font-mono text-xs overflow-x-auto border border-zinc-800 max-h-[600px]">
        <pre>${escapeHtml(jsonString)}</pre>
      </div>
    </div>
  `;
}

function attachEventListeners() {
  // Tabs
  document.querySelectorAll<HTMLButtonElement>('.nav-tab').forEach((btn) => {
    btn.addEventListener('click', () => {
      activeTab = btn.dataset.tab as any;
      renderApp();
    });
  });

  // Toggle margins
  const toggleBtn = document.getElementById('toggle-margins-btn');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      showCostMargins = !showCostMargins;
      renderApp();
    });
  }

  // Category filter
  document.querySelectorAll<HTMLButtonElement>('.cat-filter-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      selectedCategory = btn.dataset.cat || 'all';
      renderApp();
    });
  });

  // Tag filter
  document.querySelectorAll<HTMLButtonElement>('.tag-filter-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      selectedTag = btn.dataset.tag || 'all';
      renderApp();
    });
  });

  // Search input
  const searchInput = document.getElementById('search-input') as HTMLInputElement | null;
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = (e.target as HTMLInputElement).value;
      // Re-render without losing focus
      renderApp();
      const newSearch = document.getElementById('search-input') as HTMLInputElement | null;
      if (newSearch) {
        newSearch.focus();
        newSearch.setSelectionRange(newSearch.value.length, newSearch.value.length);
      }
    });
  }

  // Clear search
  const clearSearchBtn = document.getElementById('clear-search-btn');
  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', () => {
      searchQuery = '';
      renderApp();
    });
  }

  // Sort select
  const sortSelect = document.getElementById('sort-select') as HTMLSelectElement | null;
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      sortBy = (e.target as HTMLSelectElement).value as any;
      renderApp();
    });
  }

  // Clear all filters
  const clearFiltersBtn = document.getElementById('clear-filters-btn');
  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', () => {
      selectedCategory = 'all';
      selectedTag = 'all';
      searchQuery = '';
      renderApp();
    });
  }

  const resetAllBtn = document.getElementById('reset-all-filters-btn');
  if (resetAllBtn) {
    resetAllBtn.addEventListener('click', () => {
      selectedCategory = 'all';
      selectedTag = 'all';
      searchQuery = '';
      renderApp();
    });
  }

  // Copy buttons
  const copyMdBtn = document.getElementById('copy-markdown-btn');
  if (copyMdBtn) {
    copyMdBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(buildMarkdownText());
      showToast('Markdown copiado para a área de transferência!');
    });
  }

  const copyJsonBtn = document.getElementById('copy-json-btn');
  if (copyJsonBtn) {
    copyJsonBtn.addEventListener('click', () => {
      const apiData = catalog.categories.flatMap((cat) =>
        cat.products.map((p) => ({
          id: p.id,
          name: p.name,
          code: p.code,
          cost: p.cost,
          price: p.price,
          category: cat.id,
          categoryName: cat.name,
          tags: p.tags,
        }))
      );
      navigator.clipboard.writeText(JSON.stringify(apiData, null, 2));
      showToast('JSON da API copiado para a área de transferência!');
    });
  }

  const copyCsvBtn = document.getElementById('copy-table-csv-btn');
  if (copyCsvBtn) {
    copyCsvBtn.addEventListener('click', () => {
      const header = 'Nome,Codigo,Categoria,Custo,PrecoVenda,Lucro,MargemPercentual\n';
      const rows = catalog.categories.flatMap((cat) =>
        cat.products.map((p) => {
          const profit = (p.price - p.cost).toFixed(2);
          const margin = p.cost > 0 ? Math.round(((p.price - p.cost) / p.cost) * 100) : 0;
          return `"${p.name.replace(/"/g, '""')}","${p.code}","${cat.name}",${p.cost.toFixed(2)},${p.price.toFixed(2)},${profit},${margin}%`;
        })
      );
      navigator.clipboard.writeText(header + rows.join('\n'));
      showToast('Tabela CSV copiada para a área de transferência!');
    });
  }
}

// Initial mount
renderApp();
