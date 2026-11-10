import './style.css';

export interface Product {
  id: string;
  name: string;
  code: string;
  cost?: number; // presente só na fonte do lojista (o JSON público não traz)
  price: number;
  price_max?: number;
  highlights: string[];
  tags: string[];
  enabled?: boolean;
  image?: string;
  sourceUrl?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  products: Product[];
}

export interface Store {
  name: string;
  city: string;
  delivery: string;
  warranty: string;
  payment: string;
  whatsapp: string;
  supplier?: string;
  minOrder?: number;
}

export interface CatalogData {
  store: Store;
  categories: Category[];
}

export type Perfil = 'cliente' | 'lojista';

// Injetado por initApp() — placeholder vazio até o entry fornecer os dados
let catalog: CatalogData = {
  store: { name: '', city: '', delivery: '', warranty: '', payment: '', whatsapp: '' },
  categories: [],
};
let perfil: Perfil = 'cliente';
let firstRender = true;

// State
let activeTab: 'catalog' | 'table' = 'catalog';
let searchQuery = '';
let selectedCategory = 'all';
let selectedTag = 'all';
let showCostMargins = false;
let sortBy: 'default' | 'price-asc' | 'price-desc' | 'name' | 'margin' = 'default';

// Products are shown only when explicitly enabled (enabled !== false)
function isEnabled(p: Product): boolean {
  return p.enabled !== false;
}

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
    'fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-zinc-900 text-white px-4 py-2.5 rounded-lg shadow-xl text-sm font-medium transition-all animate-fade-in border border-zinc-700 print:hidden';
  toast.innerHTML = `<span>✓</span><span>${escapeHtml(message)}</span>`;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 2200);
}

// Generate WhatsApp link with structured order message for the clicked product
function getWhatsAppUrl(product: Product): string {
  const store = catalog.store || {};
  const waNumber = (store.whatsapp || '').replace(/\D/g, '');
  const priceRange =
    product.price_max && product.price_max > product.price
      ? ` (até ${brl(product.price_max)})`
      : '';
  const msg = encodeURIComponent(
    `Olá! Quero fazer um pedido:\n\n🛍️ Produto: ${product.name}\n📌 Código: ${product.code}\n💰 Preço: ${brl(product.price)}${priceRange}\n\nPode confirmar a disponibilidade e o prazo de entrega em Manaus?`
  );
  return `https://wa.me/${waNumber}?text=${msg}`;
}

// ── Carrinho de compras ──────────────────────────────────────────────────────

interface CartItem {
  id: string;
  qty: number;
  price: number; // snapshot do preço no momento da adição
}

interface ClientInfo {
  nome: string;
  telefone: string;
  bairro: string;
  entrega: 'motoboy' | 'retirada';
  obs: string;
}

const CART_KEY = 'carrinho-v1';
const CLIENT_KEY = 'dados-cliente-v1';
const SEQ_KEY = 'pedido-seq-v1';
const ORDER_KEY = 'pedido-atual-v1';

function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage indisponível — estado permanece só em memória
  }
}

const loadedCart = loadJson<CartItem[]>(CART_KEY, []);
let cart: CartItem[] = Array.isArray(loadedCart)
  ? loadedCart.filter(
      (it) =>
        it &&
        typeof it.id === 'string' &&
        typeof it.qty === 'number' &&
        typeof it.price === 'number'
    )
  : [];
const asStr = (v: unknown): string => (typeof v === 'string' ? v : '');
const loadedClient = loadJson<Record<string, unknown>>(CLIENT_KEY, {});
let clientInfo: ClientInfo = {
  nome: asStr(loadedClient.nome),
  telefone: asStr(loadedClient.telefone),
  bairro: asStr(loadedClient.bairro),
  entrega: loadedClient.entrega === 'retirada' ? 'retirada' : 'motoboy',
  obs: asStr(loadedClient.obs),
};
const loadedSeq = loadJson<number>(SEQ_KEY, 0);
let orderSeq: number = Number.isFinite(loadedSeq) ? loadedSeq : 0;
const loadedOrder = loadJson<number | null>(ORDER_KEY, null);
let currentOrder: number | null =
  typeof loadedOrder === 'number' && Number.isFinite(loadedOrder) ? loadedOrder : null;
let cartOpen = false;

// Carrinho vazio não mantém número de pedido
if (cart.length === 0 && currentOrder !== null) {
  currentOrder = null;
  saveJson(ORDER_KEY, null);
}

function findProduct(id: string): { category: Category; product: Product } | undefined {
  for (const cat of catalog.categories) {
    const p = cat.products.find((x) => x.id === id);
    if (p) return { category: cat, product: p };
  }
  return undefined;
}

function cartCount(): number {
  return cart.reduce((acc, it) => acc + it.qty, 0);
}

function cartSubtotal(): number {
  return cart.reduce((acc, it) => acc + it.price * it.qty, 0);
}

function formatOrderNo(): string {
  return currentOrder !== null ? `#${String(currentOrder).padStart(4, '0')}` : '—';
}

function persistCart(): void {
  saveJson(CART_KEY, cart);
}

function assignOrderNumber(): void {
  if (currentOrder !== null) return;
  orderSeq += 1;
  currentOrder = orderSeq;
  saveJson(SEQ_KEY, orderSeq);
  saveJson(ORDER_KEY, currentOrder);
}

function releaseOrderNumber(): void {
  if (currentOrder === null) return;
  currentOrder = null;
  saveJson(ORDER_KEY, null);
}

function addToCart(id: string): void {
  const found = findProduct(id);
  if (!found) return;
  const existing = cart.find((it) => it.id === id);
  if (existing) {
    existing.qty = Math.min(existing.qty + 1, 99);
  } else {
    if (cart.length === 0) assignOrderNumber();
    cart.push({ id, qty: 1, price: found.product.price });
  }
  persistCart();
  showToast(`${found.product.name} adicionado ao carrinho!`);
  renderApp();
}

function changeCartQty(id: string, delta: number): void {
  const item = cart.find((it) => it.id === id);
  if (!item) return;
  item.qty = Math.max(1, Math.min(item.qty + delta, 99));
  persistCart();
  renderApp();
}

function removeCartItem(id: string): void {
  cart = cart.filter((it) => it.id !== id);
  if (cart.length === 0) releaseOrderNumber();
  persistCart();
  renderApp();
}

function clearCart(): void {
  cart = [];
  releaseOrderNumber();
  persistCart();
  renderApp();
}

// 559281240562 → +55 (92) 8124-0562
function formatWhatsAppNumber(digits: string): string {
  const d = (digits || '').replace(/\D/g, '');
  if (d.length < 12) return d ? `+${d}` : '';
  const country = d.slice(0, 2);
  const ddd = d.slice(2, 4);
  const rest = d.slice(4);
  const local = rest.length >= 8 ? `${rest.slice(0, rest.length - 4)}-${rest.slice(-4)}` : rest;
  return `+${country} (${ddd}) ${local}`;
}

let totalProducts = 0;

// Chamado pelo entry (cliente ou lojista): injeta dados, define o perfil e monta a UI
export function initApp(data: CatalogData, p: Perfil): void {
  catalog = data;
  perfil = p;
  totalProducts = catalog.categories.reduce(
    (acc, c) => acc + c.products.filter(isEnabled).length,
    0
  );
  renderApp();
}

function getFilteredProducts(): { category: Category; product: Product }[] {
  const query = searchQuery.trim().toLowerCase();
  const results: { category: Category; product: Product }[] = [];

  for (const cat of catalog.categories) {
    if (selectedCategory !== 'all' && cat.id !== selectedCategory) continue;

    for (const p of cat.products) {
      if (!isEnabled(p)) continue;

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
      const costA = a.product.cost ?? 0;
      const costB = b.product.cost ?? 0;
      const marginA = costA > 0 ? (a.product.price - costA) / costA : 0;
      const marginB = costB > 0 ? (b.product.price - costB) / costB : 0;
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
    const prices = cat.products.filter(isEnabled).map((p) => p.price);
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
    for (const p of cat.products.filter(isEnabled)) {
      const cost = p.cost ?? 0;
      const margin = cost > 0 ? Math.round(((p.price - cost) / cost) * 100) : 0;
      let priceCell = brl(p.price);
      if (p.price_max && p.price_max > p.price) priceCell += ` – ${brl(p.price_max)}`;
      const kit = (p.tags || []).includes('kit') ? ' 🎁 Kit' : '';
      lines.push(
        `| ${p.name.replace(/\|/g, '\\|')}${kit} | ${p.code.replace(/\|/g, '\\|')} | ${brl(cost)} | ${priceCell} | ${margin}% | ${p.highlights.join(', ').replace(/\|/g, '\\|')} |`
      );
    }
    lines.push('');
  }

  lines.push('---');
  lines.push('');
  lines.push('Gerado automaticamente a partir de `catalog-data.json`.');
  return lines.join('\n');
}

// Resumo financeiro no topo — exclusivo do perfil lojista
function renderFinanceSummary(): string {
  let totalCost = 0;
  let totalPrice = 0;
  for (const cat of catalog.categories) {
    for (const p of cat.products.filter(isEnabled)) {
      totalCost += p.cost ?? 0;
      totalPrice += p.price;
    }
  }
  const profit = totalPrice - totalCost;
  const avgMargin = totalCost > 0 ? Math.round(((totalPrice - totalCost) / totalCost) * 100) : 0;

  const card = (label: string, value: string, tone: string) => `
    <div class="bg-white p-3.5 rounded-xl border border-zinc-200 shadow-xs">
      <span class="text-[11px] text-zinc-400 uppercase font-semibold">${label}</span>
      <p class="text-xl font-black ${tone} mt-1">${value}</p>
    </div>`;

  return `
    <div class="max-w-6xl mx-auto px-4 pt-4 print:hidden">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-[11px] font-black uppercase text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">📈 Resumo financeiro</span>
        <span class="text-[11px] text-zinc-400">base: 1 unidade por produto</span>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        ${card('Custo Total (1un)', brl(totalCost), 'text-zinc-900')}
        ${card('Venda Total (1un)', brl(totalPrice), 'text-emerald-700')}
        ${card('Lucro Potencial', brl(profit), 'text-indigo-700')}
        ${card('Margem Média', avgMargin + '%', 'text-amber-600')}
      </div>
    </div>
  `;
}

function renderApp() {
  const app = document.querySelector<HTMLDivElement>('#app')!;
  const store = catalog.store || {};
  const filtered = getFilteredProducts();

  // Revealed orquestrado apenas no primeiro render (busca re-renderiza a cada tecla)
  const revealAttr = firstRender ? ' data-reveal' : '';
  firstRender = false;

  // Preserva a rolagem do drawer entre re-renders
  const prevDrawerBody = document.getElementById('cart-drawer-body');
  const drawerScroll = prevDrawerBody ? prevDrawerBody.scrollTop : 0;

  const cartQty = cartCount();

  app.innerHTML = `
    <!-- Header -->
    <header class="site-header text-white shadow-md print:hidden"${revealAttr}>
      <div class="max-w-6xl mx-auto px-4 py-7 relative z-[1]">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div class="inline-flex items-center gap-2 bg-black/25 border border-white/15 text-emerald-50 font-mono text-[11px] tracking-wider px-2.5 py-1 rounded mb-3">
              <span class="led" aria-hidden="true"></span>
              <span>📍 ${escapeHtml(store.city || 'Manaus/AM')}</span>
              <span class="opacity-50">/</span>
              <span>${totalProducts} produtos</span>
            </div>
            <h1 class="display-text text-3xl md:text-4xl flex items-center gap-3">
              <img src="images/whatsapp-label.jpg" alt="WhatsApp" class="w-9 h-9 rounded-full object-cover ring-2 ring-white/50 shadow-lg" onerror="this.remove()" />
              <span>${escapeHtml(store.name || 'Catálogo de Eletrônicos')}</span>
            </h1>
            <p class="text-emerald-50/90 text-sm mt-2 max-w-xl leading-relaxed">
              Catálogo centralizado com estoque, especificações, preços de atacado e venda local em Manaus.
            </p>
          </div>

          <div class="flex flex-col sm:flex-row gap-2">
            <button type="button" id="open-cart-btn"
                    class="relative inline-flex items-center justify-center gap-2 bg-white text-[#0a8754] hover:bg-emerald-50 font-bold px-4 py-2.5 rounded-lg shadow transition text-sm">
              <span>🛒 Carrinho${cartQty > 0 ? ` (${cartQty})` : ''}</span>
              ${
                cartQty > 0
                  ? `<span class="absolute -top-1.5 -right-1.5 bg-amber-500 text-white text-[10px] font-black min-w-[20px] h-5 px-1 rounded-full flex items-center justify-center ring-2 ring-[#0a8754]">${cartQty}</span>`
                  : ''
              }
            </button>
            <a href="https://wa.me/${(store.whatsapp || '').replace(/\D/g, '')}?text=${encodeURIComponent('Olá! Vi o catálogo e quero fazer um pedido — pode me atender?')}"
               target="_blank" rel="noopener"
               class="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold px-4 py-2.5 rounded-lg shadow transition text-sm">
              <img src="images/whatsapp-label.jpg" alt="" class="w-4 h-4 rounded-full object-cover" onerror="this.remove()" />
              <span>Atendimento WhatsApp</span>
            </a>
            ${
              perfil === 'lojista'
                ? `
            <span class="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-2.5 rounded-lg border border-emerald-300 whitespace-nowrap">
              🟢 MODO LOJISTA
            </span>
            <div class="inline-flex items-center gap-1 bg-white border border-zinc-300 rounded-lg p-0.5 shadow-sm" role="segmented-control">
              <button type="button"
                      class="nav-tab px-4 py-1.5 rounded-md text-sm font-medium transition whitespace-nowrap ${
                        activeTab === 'catalog'
                          ? 'bg-emerald-50 text-[#0a8754] font-bold shadow-sm'
                        : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                      }" data-tab="catalog">
                🛍️ Vitrine
              </button>
              <button type="button"
                      class="nav-tab px-4 py-1.5 rounded-md text-sm font-medium transition whitespace-nowrap ${
                        activeTab === 'table'
                          ? 'bg-emerald-50 text-[#0a8754] font-bold shadow-sm'
                        : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                      }" data-tab="table">
                📊 Tabela &amp; Margens
              </button>
            </div>
            <button id="toggle-margins-btn"
                    class="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-emerald-400/40 hover:bg-emerald-700/50 transition">
              ${showCostMargins ? '👁️ Ocultar Custos/Margens' : '📈 Exibir Custos/Margens'}
            </button>
            <button id="logout-btn"
                    class="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-emerald-400/40 hover:bg-emerald-700/50 transition">
              🔒 Sair
            </button>`
                : ''
            }
          </div>
        </div>

        <!-- Info Badges -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-6 pt-4 border-t border-white/15 font-mono text-[11px] text-emerald-50/90">
          <div class="flex items-center gap-2 bg-black/20 border border-white/10 px-3 py-2 rounded">
            <span>🚚</span>
            <span><strong class="text-emerald-200">Entrega:</strong> ${escapeHtml(store.delivery || 'Motoboy no mesmo dia')}</span>
          </div>
          <div class="flex items-center gap-2 bg-black/20 border border-white/10 px-3 py-2 rounded">
            <span>✅</span>
            <span><strong class="text-emerald-200">Garantia:</strong> ${escapeHtml(store.warranty || 'Garantia local 30 dias')}</span>
          </div>
          <div class="flex items-center gap-2 bg-black/20 border border-white/10 px-3 py-2 rounded">
            <span>💳</span>
            <span><strong class="text-emerald-200">Pagamento:</strong> ${escapeHtml(store.payment || 'PIX ou dinheiro')}</span>
          </div>
        </div>
      </div>
    </header>

    ${perfil === 'lojista' ? renderFinanceSummary() : ''}

    <!-- Main Content Area -->
    <main class="max-w-6xl mx-auto px-4 py-6 print:hidden"${revealAttr}>
      ${renderTabContent(filtered)}
    </main>

    <!-- Footer -->
    <footer class="site-footer mt-12 py-8 text-center text-xs print:hidden">
      <div class="max-w-6xl mx-auto px-4 space-y-1.5">
        <p class="text-emerald-100/85">Catálogo centralizado de eletrônicos em Manaus/AM • Fonte única em <code class="font-mono bg-white/10 px-1.5 py-0.5 rounded text-emerald-50">catalog-data.json</code></p>
        <p class="text-emerald-100/60">Gera simultaneamente HTML responsivo, Markdown consolidado e API JSON estruturada.</p>
      </div>
    </footer>

    ${renderCartDrawer()}

    <!-- Relatório do pedido (só aparece na impressão → Salvar como PDF) -->
    <div id="order-report" class="hidden print:block">${cart.length > 0 ? buildOrderReportInner() : ''}</div>
  `;

  const nextDrawerBody = document.getElementById('cart-drawer-body');
  if (nextDrawerBody) nextDrawerBody.scrollTop = drawerScroll;

  document.body.style.overflow = cartOpen ? 'hidden' : '';

  attachEventListeners();
}

function renderTabContent(filtered: { category: Category; product: Product }[]): string {
  if (activeTab === 'table' && perfil === 'lojista') {
    return renderTableView();
  }
  return renderCatalogView(filtered);
}

function renderCatalogView(filtered: { category: Category; product: Product }[]): string {
  // Dados das categorias (compartilhados entre chips mobile e sidebar desktop)
  const categories = [
    { id: 'all', name: 'Todas', icon: '🌐', count: totalProducts },
    ...catalog.categories.map((c) => ({
      id: c.id,
      name: c.name,
      icon: c.icon,
      count: c.products.filter(isEnabled).length,
    })),
  ];

  // Category quick filter chips (mobile — somem no desktop, vira sidebar)
  const categoryChips = categories
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

  // Sidebar vertical de categorias (desktop ≥lg) — mesma classe p/ listeners
  const categoryList = categories
    .map((cat) => {
      const active = selectedCategory === cat.id;
      return `
      <button class="cat-filter-btn w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition border ${
        active
          ? 'bg-[#0a8754] text-white border-[#0a8754] shadow-xs font-semibold'
          : 'text-zinc-700 border-transparent hover:bg-zinc-50'
      }" data-cat="${cat.id}">
        <span class="shrink-0">${cat.icon}</span>
        <span class="flex-1 text-left truncate">${escapeHtml(cat.name)}</span>
        <span class="font-mono text-[11px] tabular-nums ${active ? 'text-emerald-100' : 'text-zinc-400'}">${cat.count}</span>
      </button>`;
    })
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
          .map(({ category, product: p }, idx) => {
            const isKit = (p.tags || []).includes('kit');
            const isTop = (p.tags || []).includes('mais-vendido');
            const cost = p.cost ?? 0;
            const margin =
              cost > 0 ? Math.round(((p.price - cost) / cost) * 100) : 0;
            const profit = p.price - cost;

            return `
              <article style="--i:${idx}" class="bg-white rounded-xl border border-zinc-200 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col overflow-hidden">
                <div class="card-media relative h-44 border-b border-zinc-100 flex items-center justify-center overflow-hidden">
                  <span class="text-5xl opacity-40 select-none">${category.icon}</span>
                  ${
                    p.image
                      ? `<img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.name)}" loading="lazy" class="absolute inset-0 w-full h-full object-contain p-3" onerror="this.remove()" />`
                      : ''
                  }
                </div>
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
                  <p class="mt-1 mb-3">
                    <span class="font-mono text-[11px] tracking-wide text-zinc-400 bg-zinc-100 px-1.5 py-0.5 rounded">Cód ${escapeHtml(p.code)}</span>
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
                      <span class="font-mono text-[11px] text-zinc-400">à vista</span>
                      <div class="text-right">
                        <span class="display-text text-xl tabular-nums text-[#0a8754]">${brl(p.price)}</span>
                        ${
                          p.price_max && p.price_max > p.price
                            ? `<span class="block text-[11px] text-zinc-400 tabular-nums">até ${brl(p.price_max)}</span>`
                            : ''
                        }
                      </div>
                    </div>

                    ${
                      perfil === 'lojista' && showCostMargins
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

                  <!-- Cart CTA Button -->
                  <button type="button"
                          data-add-to-cart="${p.id}"
                          class="w-full inline-flex items-center justify-center gap-2 bg-[#0a8754] hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-lg text-sm shadow-xs transition">
                    <span>🛒 Adicionar no carrinho</span>
                  </button>
                </div>
              </article>
            `;
          })
          .join('')}
      </div>
    `;
  }

  return `
    <div class="lg:grid lg:grid-cols-[230px_minmax(0,1fr)] lg:gap-5 lg:items-start">
      <!-- Sidebar de categorias (desktop ≥lg) -->
      <aside class="hidden lg:block sticky top-16 bg-white rounded-xl border border-zinc-200 shadow-xs p-2 max-h-[75vh] overflow-y-auto print:hidden">
        ${categoryList}
      </aside>

      <div class="space-y-4 min-w-0">
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
              ${perfil === 'lojista' ? `<option value="margin" ${sortBy === 'margin' ? 'selected' : ''}>Maior Margem %</option>` : ''}
            </select>
          </div>
        </div>

        <!-- Category pills (mobile/tablet — no desktop é a sidebar) -->
        <div class="flex flex-wrap gap-1.5 pt-1 lg:hidden">
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
    </div>
  `;
}

function renderTableView(): string {
  let totalCost = 0;
  let totalPrice = 0;
  let allCount = 0;

  const rows = catalog.categories.flatMap((cat) =>
    cat.products.filter(isEnabled).map((p) => {
      const cost = p.cost ?? 0;
      totalCost += cost;
      totalPrice += p.price;
      allCount++;
      const margin = cost > 0 ? Math.round(((p.price - cost) / cost) * 100) : 0;
      const profit = p.price - cost;
      return `
        <tr class="hover:bg-zinc-50 border-b border-zinc-100 text-xs">
          <td class="p-3 font-medium text-zinc-900">${escapeHtml(p.name)}</td>
          <td class="p-3 text-zinc-500 font-mono">${escapeHtml(p.code)}</td>
          <td class="p-3 text-zinc-600">${cat.icon} ${escapeHtml(cat.name)}</td>
          <td class="p-3 font-mono text-right text-zinc-600">${brl(cost)}</td>
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
    cat.products.filter(isEnabled).map((p) => ({
      id: p.id,
      name: p.name,
      code: p.code,
      price: p.price,
      price_max: p.price_max || null,
      category: cat.id,
      categoryName: cat.name,
      highlights: p.highlights,
      tags: p.tags,
      image: p.image || null,
      sourceUrl: p.sourceUrl || null,
      whatsappOrderUrl: getWhatsAppUrl(p),
      // Dados de custo exclusivos do perfil lojista
      ...(perfil === 'lojista' && p.cost !== undefined
        ? {
            cost: p.cost,
            lucro: Math.round((p.price - p.cost) * 100) / 100,
            margem: p.cost > 0 ? Math.round(((p.price - p.cost) / p.cost) * 100) : 0,
          }
        : {}),
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

// ── Pedido: mensagem do WhatsApp ─────────────────────────────────────────────

function buildOrderMessage(): string | null {
  if (cart.length === 0) {
    showToast('Carrinho vazio — adicione produtos primeiro.');
    return null;
  }
  if (!clientInfo.nome.trim() || !clientInfo.telefone.trim()) {
    showToast('Preencha nome e telefone do cliente.');
    return null;
  }

  const now = new Date();
  const dateStr = now.toLocaleDateString('pt-BR');
  const entrega =
    clientInfo.entrega === 'retirada'
      ? 'Retirada na loja'
      : 'Motoboy mesmo dia (R$ 15–20)';

  const lines: string[] = [
    'Olá! Quero fazer um pedido:',
    '',
    `📋 Pedido: ${formatOrderNo()} — ${dateStr}`,
    '',
  ];

  for (const it of cart) {
    const found = findProduct(it.id);
    const name = found ? found.product.name : it.id;
    const code = found ? found.product.code : '—';
    lines.push(
      `🛍️ ${it.qty}x ${name} (${code}) — ${brl(it.price)} → ${brl(it.price * it.qty)}`
    );
  }

  lines.push(
    '',
    `💰 Subtotal: ${brl(cartSubtotal())}`,
    `🚚 Entrega: ${entrega}`,
    '',
    `👤 Cliente: ${clientInfo.nome.trim()}`,
    `📱 Telefone: ${clientInfo.telefone.trim()}`
  );

  if (clientInfo.bairro.trim()) {
    lines.push(`📍 Bairro/endereço: ${clientInfo.bairro.trim()}`);
  }
  if (clientInfo.obs.trim()) {
    lines.push(`📝 Obs: ${clientInfo.obs.trim()}`);
  }

  lines.push(
    '',
    'Pode confirmar a disponibilidade e o prazo de entrega em Manaus?'
  );

  return lines.join('\n');
}

// ── Pedido: relatório para impressão / Salvar como PDF ───────────────────────

function buildOrderReportInner(): string {
  const store = catalog.store || {};
  const now = new Date();
  const dateStr = `${now.toLocaleDateString('pt-BR')} às ${now.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
  const entrega =
    clientInfo.entrega === 'retirada'
      ? 'Retirada na loja'
      : 'Motoboy mesmo dia (R$ 15–20)';

  const rows = cart
    .map((it) => {
      const found = findProduct(it.id);
      const name = found ? found.product.name : `${it.id} (fora do catálogo)`;
      const code = found ? found.product.code : '—';
      return `
        <tr>
          <td>${escapeHtml(name)}</td>
          <td>${escapeHtml(code)}</td>
          <td class="text-center">${it.qty}</td>
          <td class="text-right">${brl(it.price)}</td>
          <td class="text-right">${brl(it.price * it.qty)}</td>
        </tr>`;
    })
    .join('');

  const field = (label: string, value: string) => `
    <div>
      <div class="text-[10px] uppercase font-bold text-zinc-500">${label}</div>
      <div class="text-sm text-zinc-900">${value || '—'}</div>
    </div>`;

  return `
    <div class="max-w-[190mm] mx-auto text-zinc-900">
      <!-- Cabeçalho: logo tipográfico + selo WhatsApp -->
      <div class="flex items-start justify-between gap-4 border-b-[3px] border-[#0a8754] pb-3">
        <div class="flex items-center gap-3">
          <img src="images/whatsapp-label.jpg" alt="" class="w-12 h-12 rounded-full object-cover border-2 border-[#0a8754]" onerror="this.remove()" />
          <div>
            <div class="text-2xl font-black leading-none text-[#0a8754]">${escapeHtml(store.name || '[Nome da Loja]')}</div>
            <div class="text-[11px] text-zinc-600 mt-1 font-semibold">Eletrônicos • ${escapeHtml(store.city || 'Manaus/AM')}</div>
          </div>
        </div>
        <div class="text-right">
          <div class="text-lg font-black leading-none">PEDIDO ${escapeHtml(formatOrderNo())}</div>
          <div class="text-[11px] text-zinc-600 mt-1">${dateStr}</div>
        </div>
      </div>

      <!-- Dados do cliente -->
      <div class="mt-4 border border-zinc-300 rounded p-3">
        <div class="text-[11px] font-black uppercase text-[#0a8754] mb-2">Dados do cliente</div>
        <div class="grid grid-cols-2 gap-x-4 gap-y-2">
          ${field('Nome', escapeHtml(clientInfo.nome.trim()))}
          ${field('Telefone', escapeHtml(clientInfo.telefone.trim()))}
          ${field('Entrega', escapeHtml(entrega))}
          ${field('Bairro / Endereço', escapeHtml(clientInfo.bairro.trim()))}
        </div>
        ${
          clientInfo.obs.trim()
            ? `<div class="mt-2 pt-2 border-t border-zinc-200">${field(
                'Observações',
                escapeHtml(clientInfo.obs.trim()).replace(/\n/g, '<br>')
              )}</div>`
            : ''
        }
      </div>

      <!-- Itens do pedido -->
      <table class="w-full mt-4 border-collapse text-sm">
        <thead>
          <tr class="bg-[#0a8754] text-white text-[11px] uppercase">
            <th class="p-2 text-left">Produto</th>
            <th class="p-2 text-left">Código</th>
            <th class="p-2 text-center">Qtd</th>
            <th class="p-2 text-right">Unitário</th>
            <th class="p-2 text-right">Subtotal</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>

      <!-- Totais -->
      <div class="flex justify-end mt-3">
        <div class="w-64 border border-zinc-300 rounded p-3 text-sm">
          <div class="flex justify-between">
            <span>Subtotal</span>
            <strong>${brl(cartSubtotal())}</strong>
          </div>
          <div class="flex justify-between text-xs text-zinc-600 mt-1">
            <span>Entrega</span>
            <span>${escapeHtml(entrega)}</span>
          </div>
          <div class="flex justify-between border-t border-zinc-300 mt-2 pt-2 text-base font-black">
            <span>TOTAL</span>
            <span class="text-[#0a8754]">${brl(cartSubtotal())}</span>
          </div>
        </div>
      </div>

      <!-- Condições da loja -->
      <div class="mt-4 text-[11px] text-zinc-700 border-t border-zinc-300 pt-3 leading-relaxed">
        <strong>Condições:</strong>
        Entrega: ${escapeHtml(store.delivery || 'Motoboy no mesmo dia')} •
        Garantia: ${escapeHtml(store.warranty || 'Garantia local 30 dias')} •
        Pagamento: ${escapeHtml(store.payment || 'PIX ou dinheiro')}
        ${store.minOrder ? `<br /><strong>Pedido mínimo:</strong> ${brl(store.minOrder)}` : ''}
      </div>

      <!-- Rodapé -->
      <div class="mt-4 border-t-2 border-[#0a8754] pt-2 text-center text-[10px] text-zinc-500">
        WhatsApp: ${escapeHtml(formatWhatsAppNumber(store.whatsapp))} • Relatório gerado pelo catálogo digital em ${dateStr}
      </div>
    </div>
  `;
}

// ── Drawer lateral do carrinho ───────────────────────────────────────────────

function renderCartDrawer(): string {
  if (!cartOpen) return '';

  const count = cartCount();

  if (cart.length === 0) {
    return `
      <div id="cart-overlay" class="fixed inset-0 bg-black/50 z-40 cart-drawer-overlay print:hidden"></div>
      <aside id="cart-drawer" class="fixed top-0 right-0 h-full w-full sm:w-[430px] bg-white z-50 shadow-2xl flex flex-col cart-drawer-panel print:hidden" role="dialog" aria-modal="true" aria-label="Carrinho de compras">
        <div class="flex items-center justify-between px-4 py-3 bg-[#0a8754] text-white shrink-0">
          <h2 class="font-bold text-sm flex items-center gap-2">
            🛒 Carrinho
            <span class="bg-white/20 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">vazio</span>
          </h2>
          <button type="button" data-close-cart class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition font-bold" aria-label="Fechar carrinho">✕</button>
        </div>
        <div id="cart-drawer-body" class="flex-1 overflow-y-auto p-4">
          <div class="text-center py-10 px-4">
            <p class="text-4xl mb-3">🛒</p>
            <p class="font-bold text-zinc-800">Seu carrinho está vazio</p>
            <p class="text-sm text-zinc-500 mt-1">Adicione produtos do catálogo para montar seu pedido.</p>
            <button type="button" data-close-cart class="mt-4 px-4 py-2 bg-[#0a8754] text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition">
              Continuar comprando
            </button>
          </div>
        </div>
      </aside>
    `;
  }

  const items = cart
    .map((it) => {
      const found = findProduct(it.id);
      const p = found?.product;
      const name = p ? p.name : `${it.id}`;
      const code = p ? p.code : '';
      const icon = found ? found.category.icon : '📦';
      const img = p?.image
        ? `<img src="${escapeHtml(p.image)}" alt="" class="absolute inset-0 w-full h-full object-contain p-1.5" onerror="this.remove()" />`
        : '';
      return `
        <div class="flex gap-3 p-2.5 border border-zinc-200 rounded-lg bg-white">
          <div class="relative w-14 h-14 shrink-0 bg-zinc-50 rounded-md flex items-center justify-center overflow-hidden">
            <span class="text-xl opacity-60">${icon}</span>
            ${img}
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0">
                <p class="text-sm font-bold text-zinc-900 leading-tight">${escapeHtml(name)}</p>
                ${
                  code
                    ? `<p class="text-[11px] text-zinc-500 font-mono mt-0.5">${escapeHtml(code)}</p>`
                    : `<p class="text-[11px] text-amber-600 mt-0.5">Produto fora do catálogo</p>`
                }
              </div>
              <button type="button" data-cart-remove="${it.id}" class="text-zinc-400 hover:text-red-600 text-sm shrink-0" aria-label="Remover item">✕</button>
            </div>
            <div class="flex items-center justify-between mt-2">
              <div class="flex items-center border border-zinc-200 rounded-md">
                <button type="button" data-cart-dec="${it.id}" class="w-7 h-7 flex items-center justify-center text-zinc-600 hover:bg-zinc-100 rounded-l-md font-bold disabled:opacity-40 disabled:cursor-not-allowed" ${it.qty <= 1 ? 'disabled' : ''}>−</button>
                <span class="w-7 text-center text-sm font-bold text-zinc-900">${it.qty}</span>
                <button type="button" data-cart-inc="${it.id}" class="w-7 h-7 flex items-center justify-center text-zinc-600 hover:bg-zinc-100 rounded-r-md font-bold disabled:opacity-40 disabled:cursor-not-allowed" ${it.qty >= 99 ? 'disabled' : ''}>+</button>
              </div>
              <div class="text-right">
                <span class="text-sm font-black text-[#0a8754]">${brl(it.price * it.qty)}</span>
                <span class="block text-[10px] text-zinc-400">${brl(it.price)} un.</span>
              </div>
            </div>
          </div>
        </div>`;
    })
    .join('');

  const fieldClass =
    'w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0a8754] focus:border-[#0a8754]';

  return `
    <div id="cart-overlay" class="fixed inset-0 bg-black/50 z-40 cart-drawer-overlay print:hidden"></div>
    <aside id="cart-drawer" class="fixed top-0 right-0 h-full w-full sm:w-[430px] bg-white z-50 shadow-2xl flex flex-col cart-drawer-panel print:hidden" role="dialog" aria-modal="true" aria-label="Carrinho de compras">
      <div class="flex items-center justify-between px-4 py-3 bg-[#0a8754] text-white shrink-0">
        <h2 class="font-bold text-sm flex items-center gap-2">
          🛒 Carrinho
          <span class="bg-white/20 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">${count} ${count === 1 ? 'item' : 'itens'}</span>
        </h2>
        <button type="button" data-close-cart class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition font-bold" aria-label="Fechar carrinho">✕</button>
      </div>

      <div id="cart-drawer-body" class="flex-1 overflow-y-auto p-4 space-y-4">
        <!-- Itens -->
        <div class="space-y-2.5">${items}</div>

        <!-- Totais -->
        <div class="bg-emerald-50 border border-emerald-200 rounded-lg p-3 space-y-1.5 text-sm">
          <div class="flex justify-between items-baseline">
            <span class="text-zinc-600 font-medium">Subtotal (${count} ${count === 1 ? 'item' : 'itens'})</span>
            <strong class="text-lg font-black text-zinc-900">${brl(cartSubtotal())}</strong>
          </div>
          <div class="flex justify-between text-xs text-zinc-500 border-t border-emerald-200 pt-1.5">
            <span>🚚 Entrega motoboy</span>
            <span>R$ 15–20 (pago na entrega)</span>
          </div>
        </div>

        <!-- Formulário do cliente -->
        <div class="border border-zinc-200 rounded-lg p-3 space-y-3 bg-zinc-50">
          <div class="flex items-center justify-between">
            <h3 class="text-xs font-black uppercase text-zinc-500">Dados do cliente</h3>
            <span class="text-[10px] text-zinc-400">salvos automaticamente</span>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block text-[11px] font-semibold text-zinc-600 mb-1" for="client-nome">Nome *</label>
              <input id="client-nome" type="text" value="${escapeHtml(clientInfo.nome)}" placeholder="Nome completo" class="${fieldClass}" />
            </div>
            <div>
              <label class="block text-[11px] font-semibold text-zinc-600 mb-1" for="client-telefone">Telefone *</label>
              <input id="client-telefone" type="tel" value="${escapeHtml(clientInfo.telefone)}" placeholder="(92) 9xxxx-xxxx" class="${fieldClass}" />
            </div>
          </div>
          <div>
            <label class="block text-[11px] font-semibold text-zinc-600 mb-1" for="client-bairro">Bairro / Endereço</label>
            <input id="client-bairro" type="text" value="${escapeHtml(clientInfo.bairro)}" placeholder="Bairro, rua e número" class="${fieldClass}" />
          </div>
          <div>
            <label class="block text-[11px] font-semibold text-zinc-600 mb-1" for="client-entrega">Tipo de entrega</label>
            <select id="client-entrega" class="${fieldClass}">
              <option value="motoboy" ${clientInfo.entrega !== 'retirada' ? 'selected' : ''}>Motoboy mesmo dia (R$ 15–20)</option>
              <option value="retirada" ${clientInfo.entrega === 'retirada' ? 'selected' : ''}>Retirada na loja</option>
            </select>
          </div>
          <div>
            <label class="block text-[11px] font-semibold text-zinc-600 mb-1" for="client-obs">Observações</label>
            <textarea id="client-obs" rows="2" placeholder="Cor desejada, horário, referência..." class="${fieldClass} resize-none">${escapeHtml(clientInfo.obs)}</textarea>
          </div>
        </div>
      </div>

      <!-- Ações -->
      <div class="border-t border-zinc-200 p-3 space-y-2 bg-zinc-50 shrink-0">
        <button type="button" id="cart-send-wa" class="w-full inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold py-2.5 px-4 rounded-lg text-sm shadow-xs transition">
          <img src="images/whatsapp-label.jpg" alt="" class="w-4 h-4 rounded-full object-cover" onerror="this.remove()" />
          <span>Enviar pedido no WhatsApp</span>
        </button>
        <div class="grid grid-cols-2 gap-2">
          <button type="button" id="cart-print-pdf" class="inline-flex items-center justify-center gap-1.5 bg-[#0a8754] hover:bg-emerald-700 text-white font-bold py-2.5 px-3 rounded-lg text-xs shadow-xs transition">
            📄 Gerar PDF
          </button>
          <button type="button" id="cart-copy" class="inline-flex items-center justify-center gap-1.5 bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-300 font-bold py-2.5 px-3 rounded-lg text-xs transition">
            📋 Copiar resumo
          </button>
        </div>
        <button type="button" id="cart-clear" class="w-full text-red-600 hover:text-red-700 hover:bg-red-50 text-xs font-semibold py-1.5 rounded-lg transition">
          🗑 Esvaziar carrinho
        </button>
      </div>
    </aside>
  `;
}

// Salva o campo sem re-render (preserva o foco do usuário)
function bindClientField(id: string, apply: (value: string) => void): void {
  const el = document.getElementById(id);
  if (!el) return;
  el.addEventListener('input', () => {
    apply((el as HTMLInputElement).value);
    saveJson(CLIENT_KEY, clientInfo);
  });
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

  // Logout do modo lojista (limpa cookie no servidor)
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      fetch('/api/logout', { method: 'POST' }).finally(() => {
        window.location.href = '/';
      });
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
        cat.products.filter(isEnabled).map((p) => ({
          id: p.id,
          name: p.name,
          code: p.code,
          price: p.price,
          category: cat.id,
          categoryName: cat.name,
          tags: p.tags,
          image: p.image || null,
          ...(perfil === 'lojista' && p.cost !== undefined ? { cost: p.cost } : {}),
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
        cat.products.filter(isEnabled).map((p) => {
          const cost = p.cost ?? 0;
          const profit = (p.price - cost).toFixed(2);
          const margin = cost > 0 ? Math.round(((p.price - cost) / cost) * 100) : 0;
          return `"${p.name.replace(/"/g, '""')}","${p.code}","${cat.name}",${cost.toFixed(2)},${p.price.toFixed(2)},${profit},${margin}%`;
        })
      );
      navigator.clipboard.writeText(header + rows.join('\n'));
      showToast('Tabela CSV copiada para a área de transferência!');
    });
  }

  // ── Carrinho ──
  const openCartBtn = document.getElementById('open-cart-btn');
  if (openCartBtn) {
    openCartBtn.addEventListener('click', () => {
      cartOpen = true;
      renderApp();
    });
  }

  const closeCart = () => {
    cartOpen = false;
    renderApp();
  };
  document.querySelectorAll<HTMLElement>('[data-close-cart]').forEach((el) => {
    el.addEventListener('click', closeCart);
  });
  const cartOverlay = document.getElementById('cart-overlay');
  if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

  document.querySelectorAll<HTMLButtonElement>('[data-add-to-cart]').forEach((btn) => {
    btn.addEventListener('click', () => addToCart(btn.dataset.addToCart || ''));
  });
  document.querySelectorAll<HTMLButtonElement>('[data-cart-inc]').forEach((btn) => {
    btn.addEventListener('click', () => changeCartQty(btn.dataset.cartInc || '', 1));
  });
  document.querySelectorAll<HTMLButtonElement>('[data-cart-dec]').forEach((btn) => {
    btn.addEventListener('click', () => changeCartQty(btn.dataset.cartDec || '', -1));
  });
  document.querySelectorAll<HTMLButtonElement>('[data-cart-remove]').forEach((btn) => {
    btn.addEventListener('click', () => removeCartItem(btn.dataset.cartRemove || ''));
  });

  // Formulário do cliente — persiste sem re-render (mantém foco)
  bindClientField('client-nome', (v) => {
    clientInfo.nome = v;
  });
  bindClientField('client-telefone', (v) => {
    clientInfo.telefone = v;
  });
  bindClientField('client-bairro', (v) => {
    clientInfo.bairro = v;
  });
  bindClientField('client-entrega', (v) => {
    clientInfo.entrega = v === 'retirada' ? 'retirada' : 'motoboy';
  });
  bindClientField('client-obs', (v) => {
    clientInfo.obs = v;
  });

  const sendWaBtn = document.getElementById('cart-send-wa');
  if (sendWaBtn) {
    sendWaBtn.addEventListener('click', () => {
      const msg = buildOrderMessage();
      if (msg === null) return;
      const store = catalog.store || {};
      const waNumber = (store.whatsapp || '').replace(/\D/g, '');
      window.open(
        `https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`,
        '_blank',
        'noopener'
      );
      showToast('Pedido aberto no WhatsApp — revise e envie!');
    });
  }

  const printBtn = document.getElementById('cart-print-pdf');
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      if (cart.length === 0) {
        showToast('Carrinho vazio!');
        return;
      }
      // Atualiza o relatório com os dados atuais do formulário antes de imprimir
      const report = document.getElementById('order-report');
      if (report) report.innerHTML = buildOrderReportInner();
      window.print();
    });
  }

  const copyOrderBtn = document.getElementById('cart-copy');
  if (copyOrderBtn) {
    copyOrderBtn.addEventListener('click', () => {
      const msg = buildOrderMessage();
      if (msg === null) return;
      navigator.clipboard.writeText(msg);
      showToast('Resumo do pedido copiado!');
    });
  }

  const clearCartBtn = document.getElementById('cart-clear');
  if (clearCartBtn) {
    clearCartBtn.addEventListener('click', () => {
      if (window.confirm('Esvaziar o carrinho? Os itens serão removidos.')) {
        clearCart();
        showToast('Carrinho esvaziado.');
      }
    });
  }
}

// Fecha o drawer com Esc (listener único, fora do re-render)
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && cartOpen) {
    cartOpen = false;
    renderApp();
  }
});
