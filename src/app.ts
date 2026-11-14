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

// Produtos já visualizados em detalhe nesta sessão (evita eventos "view" duplicados)
const viewedDetailProducts = new Set<string>();
// Produtos já contabilizados como impressão nesta sessão
const impressedProducts = new Set<string>();

// Drawer de detalhes do produto
let detailProductId: string | null = null;
let detailOpen = false;

// State
let activeTab: 'catalog' | 'table' | 'engagement' = 'catalog';
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

// ── Engajamento de produtos ──
let engagementSessionId: string;

function getEngagementSessionId(): string {
  if (!engagementSessionId) {
    engagementSessionId = localStorage.getItem('eng-session-v1') || crypto.randomUUID();
    localStorage.setItem('eng-session-v1', engagementSessionId);
  }
  return engagementSessionId;
}

async function trackEvent(productId: string, eventType: 'view' | 'impression' | 'whatsapp_click' | 'cart_add' | 'cart_remove' | 'order_wa'): Promise<void> {
  try {
    const res = await fetch('/api/engagement', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product_id: productId,
        event_type: eventType,
        session_id: getEngagementSessionId(),
      }),
    });
    if (!res.ok) {
      console.warn(`[Engajamento] Falha ao rastrear ${eventType} para ${productId}: HTTP ${res.status}`);
    } else {
      console.log(`[Engajamento] Evento rastreado: ${eventType} - ${productId}`);
    }
  } catch (err) {
    console.error(`[Engajamento] Erro de rede ao rastrear ${eventType} para ${productId}:`, err);
    // Silencioso — não quebra a UX se o endpoint estiver indisponível
  }
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
    // Rastreamento: primeiro adiciono do produto no carrinho
    trackEvent(id, 'cart_add');
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
  // Rastreamento: remoção do carrinho
  trackEvent(id, 'cart_remove');
  renderApp();
}

function openProductDetail(id: string): void {
  detailProductId = id;
  detailOpen = true;
  // View = abertura do detalhe (1x por produto por sessão)
  if (!viewedDetailProducts.has(id)) {
    viewedDetailProducts.add(id);
    trackEvent(id, 'view');
  }
  renderApp();
}

function closeProductDetail(): void {
  detailOpen = false;
  detailProductId = null;
  renderApp();
}

function clearCart(): void {
  cart = [];
  releaseOrderNumber();
  persistCart();
  renderApp();
}

// 559285617019 → +55 (92) 8561-7019
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

  // Preserva a rolagem dos drawers entre re-renders
  const prevDrawerBody = document.getElementById('cart-drawer-body');
  const drawerScroll = prevDrawerBody ? prevDrawerBody.scrollTop : 0;
  const prevDetailBody = document.getElementById('product-detail-body');
  const detailScroll = prevDetailBody ? prevDetailBody.scrollTop : 0;

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
              <img src="images/Loja_img.png" alt="Logo da loja" class="w-9 h-9 rounded-full object-cover ring-2 ring-white/50 shadow-lg" onerror="this.remove()" />
              <span>${escapeHtml(store.name || 'Catálogo de Eletrônicos')}</span>
            </h1>
            <p class="text-emerald-50/90 text-sm mt-2 max-w-xl leading-relaxed">
              Catálogo centralizado com estoque, especificações, preços de atacado e venda local em Manaus.
            </p>
          </div>

          <div class="flex flex-col sm:flex-row gap-2">
            ${perfil === 'lojista'
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
              <button type="button"
                      class="nav-tab px-4 py-1.5 rounded-md text-sm font-medium transition whitespace-nowrap ${
                        activeTab === 'engagement'
                          ? 'bg-emerald-50 text-[#0a8754] font-bold shadow-sm'
                          : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                      }" data-tab="engagement">
                📈 Engajamento
              </button>
            </div>
            <button id="toggle-margins-btn"
                    class="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-emerald-400/40 hover:bg-emerald-700/50 transition">
              ${showCostMargins ? '👁️ Ocultar Custos/Margens' : '📈 Exibir Custos/Margens'}
            </button>
            <button id="logout-btn"
                    class="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-red-600/40 text-red-600 hover:bg-red-600 hover:text-white transition">
              🔒 Sair
            </button>`
              : `
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
              <img src="images/Loja_img.png" alt="" class="w-4 h-4 rounded-full object-cover" onerror="this.remove()" />
              <span>Atendimento WhatsApp</span>
            </a>`
            }
          </div>
          </div>
        </div>

        ${perfil === 'cliente' ? `
        <!-- Info Badges -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-6 pt-4 border-t border-white/15 font-mono text-[11px] text-emerald-50/90">
          <div class="flex items-center gap-2 bg-black/20 border border-white/10 px-3 py-2 rounded">
            <span>🚚</span>
            <span><strong class="text-emerald-200">Entrega:</strong> ${escapeHtml(store.delivery || 'Entrega via motoboy (taxa a combinar) • Retirada em loja sob consulta')}</span>
          </div>
          <div class="flex items-center gap-2 bg-black/20 border border-white/10 px-3 py-2 rounded">
            <span>✅</span>
            <span><strong class="text-emerald-200">Garantia:</strong> ${escapeHtml(store.warranty || 'Atendimento para defeitos conforme garantia legal. Consulte condições.')}</span>
          </div>
          <div class="flex items-center gap-2 bg-black/20 border border-white/10 px-3 py-2 rounded">
            <span>💳</span>
            <span><strong class="text-emerald-200">Pagamento:</strong> ${escapeHtml(store.payment || 'Pagamento do pedido: PIX (comprovante para confirmação).')}</span>
          </div>
        </div>
        ` : ''}
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

    ${perfil === 'cliente' ? renderCartDrawer() : ''}
    ${renderProductDrawer()}

    <!-- Relatório do pedido (só aparece na impressão → Salvar como PDF) -->
    <div id="order-report" class="hidden print:block">${cart.length > 0 ? buildOrderReportInner() : ''}</div>
  `;

  const nextDrawerBody = document.getElementById('cart-drawer-body');
  if (nextDrawerBody) nextDrawerBody.scrollTop = drawerScroll;
  const nextDetailBody = document.getElementById('product-detail-body');
  if (nextDetailBody) nextDetailBody.scrollTop = detailScroll;

  document.body.style.overflow = cartOpen || detailOpen ? 'hidden' : '';

  attachEventListeners();
}

function renderTabContent(filtered: { category: Category; product: Product }[]): string {
  if (activeTab === 'table' && perfil === 'lojista') {
    return renderTableView();
  }
  if (activeTab === 'engagement' && perfil === 'lojista') {
    return renderEngagementView();
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
        <p class="text-3xl mb-2" aria-hidden="true">🔍</p>
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
              <article style="--i:${idx}" class="bg-white rounded-xl border border-zinc-200 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col overflow-hidden cursor-pointer group" data-product-id="${p.id}" data-open-product="${p.id}" data-track-impression="${p.id}">
                <div class="card-media relative h-44 border-b border-zinc-100 flex items-center justify-center overflow-hidden">
                  <span class="text-5xl opacity-40 select-none">${category.icon}</span>
                  ${
                    p.image
                      ? `<img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.name)}" loading="lazy" class="absolute inset-0 w-full h-full object-contain p-3" onerror="this.remove()" />`
                      : ''
                  }
                  <div class="absolute bottom-2 right-2 bg-white/90 text-zinc-700 text-[10px] font-semibold px-2 py-1 rounded shadow-sm opacity-0 group-hover:opacity-100 transition">Ver detalhes</div>
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
                      ${perfil !== 'lojista' ? `<span class="eng-badge" data-eng-badge="${p.id}" style="display:none">💬 <span class="eng-count">0</span></span>` : ''}
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

                  ${perfil === 'cliente' ? `
                  <!-- Cart CTA Button -->
                  <button type="button"
                          data-add-to-cart="${p.id}"
                          class="w-full inline-flex items-center justify-center gap-2 bg-[#0a8754] hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-lg text-sm shadow-xs transition">
                    <span>🛒 Adicionar no carrinho</span>
                  </button>

                  <!-- WhatsApp do produto -->
                  <a href="${getWhatsAppUrl(p)}" target="_blank" rel="noopener"
                     data-track-wa="${p.id}"
                     class="w-full inline-flex items-center justify-center gap-2 mt-2 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold py-2 px-4 rounded-lg text-sm shadow-xs transition">
                    <img src="images/Loja_img.png" alt="" class="w-4 h-4 rounded-full object-cover" onerror="this.remove()" />
                    <span>WhatsApp</span>
                  </a>
                  ` : ''}
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
          ${perfil === 'cliente' ? `<td class="p-3 text-right">
            <a href="${getWhatsAppUrl(p)}" target="_blank" rel="noopener" class="text-emerald-600 hover:text-emerald-800 font-semibold">
              WhatsApp ↗
            </a>
          </td>` : '<td></td>'}
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

// ── Engajamento (lojista) ──────────────────────────────────────────────

function renderEngagementView(): string {
  const categories = catalog.categories.map((c) => c.id);
  const categoryOptions = categories
    .map((id) => {
      const cat = catalog.categories.find((c) => c.id === id);
      return `<option value="${escapeHtml(id)}">${escapeHtml(cat?.name || id)}</option>`;
    })
    .join('');

  return `
    <div class="space-y-6">
      <!-- Header -->
      <div class="bg-white p-6 rounded-xl border border-zinc-200 shadow-xs">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-2xl font-black text-zinc-900 mb-1">📈 Engajamento de Produtos</h2>
            <p class="text-zinc-500 text-sm">Acompanhe impressões, visualizações de detalhes, cliques no WhatsApp, carrinho e pedidos.</p>
          </div>
          <div class="flex items-center gap-3">
            <button id="eng-refresh" class="bg-[#0a8754] hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-xs transition flex items-center gap-2" aria-label="Atualizar métricas de engajamento">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                <path d="M3 3v5h5"/>
                <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
                <path d="M16 21v-5h-5"/>
              </svg>
              Atualizar
            </button>
            <button id="eng-export-csv" class="bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:text-emerald-700 px-4 py-2 rounded-lg text-sm font-semibold shadow-xs transition flex items-center gap-2" aria-label="Exportar dados de engajamento em CSV">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Exportar CSV
            </button>
          </div>
        </div>
      </div>

      <!-- Filtros -->
      <div class="bg-white p-4 rounded-xl border border-zinc-200 shadow-xs">
        <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div class="flex items-center gap-2">
            <label for="eng-period" class="text-xs font-semibold text-zinc-500">Período</label>
            <select id="eng-period" class="border border-zinc-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-[#0a8754]">
              <option value="7">Últimos 7 dias</option>
              <option value="30" selected>Últimos 30 dias</option>
              <option value="90">Últimos 90 dias</option>
            </select>
          </div>
          <div class="flex items-center gap-2 w-full sm:w-auto">
            <label for="eng-category" class="text-xs font-semibold text-zinc-500">Categoria</label>
            <select id="eng-category" class="border border-zinc-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-[#0a8754] flex-1 sm:flex-auto">
              <option value="">Todas as categorias</option>
              ${categoryOptions}
            </select>
          </div>
        </div>
      </div>

      <!-- Filtros secundários: métrica do gráfico, Top N e busca -->
      <div class="bg-white p-4 rounded-xl border border-zinc-200 shadow-xs">
        <div class="flex flex-col sm:flex-row gap-3 items-start sm:items-center flex-wrap">
          <div class="flex items-center gap-2">
            <label for="eng-chart-metric" class="text-xs font-semibold text-zinc-500">Exibir gráfico por</label>
            <select id="eng-chart-metric" class="border border-zinc-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-[#0a8754]">
              <option value="views">Visualizações (detalhe)</option>
              <option value="impressions">Impressões</option>
              <option value="whatsapp_clicks">Cliques WhatsApp</option>
              <option value="cart_adds">Adicionou Carrinho</option>
              <option value="orders">Pedidos via WA</option>
            </select>
          </div>
          <div class="flex items-center gap-2">
            <label for="eng-top-n" class="text-xs font-semibold text-zinc-500">Top</label>
            <select id="eng-top-n" class="border border-zinc-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-[#0a8754]">
              <option value="5">5</option>
              <option value="10" selected>10</option>
              <option value="20">20</option>
            </select>
          </div>
          <div class="flex items-center gap-2 w-full sm:w-auto">
            <label for="eng-search" class="text-xs font-semibold text-zinc-500">Buscar produto</label>
            <input id="eng-search" type="text" placeholder="Nome do produto…" class="border border-zinc-300 rounded-lg px-3 py-2 text-sm bg-white w-full sm:w-48 focus:ring-2 focus:ring-[#0a8754]" autocomplete="off"/>
          </div>
        </div>
      </div>

      <!-- Métricas resumo — agrupadas por funil -->
      <div id="eng-metrics" class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <!-- Grupo: Exposição -->
        <div class="bg-zinc-50 p-4 rounded-xl border border-zinc-200 text-center">
          <span class="text-[10px] text-zinc-500 uppercase font-semibold tracking-wider">Exposição</span>
          <div class="mt-2 space-y-1">
            <span class="text-xs text-zinc-400 uppercase font-semibold">Impressões</span>
            <p id="eng-metric-impressions" class="text-2xl font-black text-zinc-900 tabular-nums mt-0.5">—</p>
          </div>
        </div>
        <!-- Grupo: Interesse -->
        <div class="bg-zinc-50 p-4 rounded-xl border border-zinc-200 text-center">
          <span class="text-[10px] text-zinc-500 uppercase font-semibold tracking-wider">Interesse</span>
          <div class="mt-2 space-y-1">
            <span class="text-xs text-zinc-400 uppercase font-semibold">Visualizações (detalhe)</span>
            <p id="eng-metric-views" class="text-2xl font-black text-zinc-900 tabular-nums mt-0.5">—</p>
          </div>
        </div>
        <!-- Grupo: Ação -->
        <div class="bg-zinc-50 p-4 rounded-xl border border-zinc-200 text-center">
          <span class="text-[10px] text-zinc-500 uppercase font-semibold tracking-wider">Ação</span>
          <div class="mt-2 space-y-1">
            <span class="text-xs text-zinc-400 uppercase font-semibold">Cliques WhatsApp</span>
            <p id="eng-metric-wa" class="text-2xl font-black text-emerald-700 tabular-nums mt-0.5">—</p>
          </div>
          <div class="mt-1.5 space-y-1">
            <span class="text-xs text-zinc-400 uppercase font-semibold">Adicionou Carrinho</span>
            <p id="eng-metric-cart" class="text-xl font-black text-amber-700 tabular-nums mt-0.5">—</p>
          </div>
        </div>
        <!-- Grupo: Conversão (hero) -->
        <div class="bg-[#0a8754] p-4 rounded-xl text-center text-white shadow-sm">
          <span class="text-[10px] text-emerald-200 uppercase font-semibold tracking-wider">Conversão</span>
          <div class="mt-2 space-y-1">
            <span class="text-xs text-emerald-200 uppercase font-semibold">Pedidos via WhatsApp</span>
            <p id="eng-metric-orders" class="text-3xl font-black tabular-nums mt-0.5">—</p>
          </div>
        </div>
      </div>

      <!-- Gráfico de tendência -->
      <div class="bg-white p-6 rounded-xl border border-zinc-200 shadow-xs">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-bold text-zinc-900">📊 Top produtos por visualizações de detalhe</h3>
          <span id="eng-chart-period" class="text-xs text-zinc-500 font-mono"></span>
        </div>
        <div id="eng-chart-container" class="h-64 w-full flex items-end justify-between gap-2 px-4 pb-6" role="status" aria-live="polite" aria-busy="true">
          <!-- Skeleton do gráfico -->
          <div class="w-full flex items-end justify-between gap-2 px-4 pb-6 h-full">
            <div class="w-1/5 skeleton-bar"></div>
            <div class="w-1/4 skeleton-bar"></div>
            <div class="w-1/3 skeleton-bar"></div>
            <div class="w-1/4 skeleton-bar"></div>
            <div class="w-1/5 skeleton-bar"></div>
            <div class="w-1/4 skeleton-bar"></div>
            <div class="w-1/3 skeleton-bar"></div>
            <div class="w-1/4 skeleton-bar"></div>
            <div class="w-1/5 skeleton-bar"></div>
            <div class="w-1/4 skeleton-bar"></div>
          </div>
        </div>
      </div>

      <!-- Tabela de ranking -->
      <div class="bg-white rounded-xl border border-zinc-200 shadow-xs overflow-hidden">
        <div class="p-4 border-b border-zinc-200 bg-zinc-50">
          <h3 class="text-lg font-bold text-zinc-900">🏆 Ranking de Produtos</h3>
        </div>
        <div class="overflow-x-auto">
          <table id="eng-table" class="w-full text-sm">
            <caption class="sr-only">Ranking de produtos por período e categoria selecionada</caption>
            <thead class="bg-zinc-50 border-b border-zinc-200 text-[11px] uppercase font-bold text-zinc-500">
              <tr>
                <th scope="col" class="p-3 text-left">Produto</th>
                <th scope="col" class="p-3 text-left">Categoria</th>
                <th scope="col" class="p-3 text-right">Impressões</th>
                <th scope="col" class="p-3 text-right">Views (detalhe)</th>
                <th scope="col" class="p-3 text-right">Cliques WA</th>
                <th scope="col" class="p-3 text-right">Carrinho</th>
                <th scope="col" class="p-3 text-right">Pedidos</th>
                <th scope="col" class="p-3 text-right">CTR %</th>
                <th scope="col" class="p-3 text-right">Última Interação</th>
              </tr>
            </thead>
            <tbody id="eng-table-body">
              <!-- Skeleton da tabela de ranking -->
              <tr class="skeleton-row animate-pulse">
                <td class="p-3"><div class="skeleton-text" style="width:60%"></div></td>
                <td class="p-3"><div class="skeleton-text" style="width:40%"></div></td>
                <td class="p-3 text-right"><div class="skeleton-number"></div></td>
                <td class="p-3 text-right"><div class="skeleton-number"></div></td>
                <td class="p-3 text-right"><div class="skeleton-number"></div></td>
                <td class="p-3 text-right"><div class="skeleton-number"></div></td>
                <td class="p-3 text-right"><div class="skeleton-number"></div></td>
                <td class="p-3 text-right"><div class="skeleton-number" style="width:40%"></div></td>
                <td class="p-3 text-right"><div class="skeleton-text" style="width:50%"></div></td>
              </tr>
              <tr class="skeleton-row animate-pulse">
                <td class="p-3"><div class="skeleton-text" style="width:60%"></div></td>
                <td class="p-3"><div class="skeleton-text" style="width:40%"></div></td>
                <td class="p-3 text-right"><div class="skeleton-number"></div></td>
                <td class="p-3 text-right"><div class="skeleton-number"></div></td>
                <td class="p-3 text-right"><div class="skeleton-number"></div></td>
                <td class="p-3 text-right"><div class="skeleton-number"></div></td>
                <td class="p-3 text-right"><div class="skeleton-number"></div></td>
                <td class="p-3 text-right"><div class="skeleton-number" style="width:40%"></div></td>
                <td class="p-3 text-right"><div class="skeleton-text" style="width:50%"></div></td>
              </tr>
              <tr class="skeleton-row animate-pulse">
                <td class="p-3"><div class="skeleton-text" style="width:60%"></div></td>
                <td class="p-3"><div class="skeleton-text" style="width:40%"></div></td>
                <td class="p-3 text-right"><div class="skeleton-number"></div></td>
                <td class="p-3 text-right"><div class="skeleton-number"></div></td>
                <td class="p-3 text-right"><div class="skeleton-number"></div></td>
                <td class="p-3 text-right"><div class="skeleton-number"></div></td>
                <td class="p-3 text-right"><div class="skeleton-number"></div></td>
                <td class="p-3 text-right"><div class="skeleton-number" style="width:40%"></div></td>
                <td class="p-3 text-right"><div class="skeleton-text" style="width:50%"></div></td>
              </tr>
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


// 📄 Pedido: mensagem do WhatsApp ─────────────────────────────────────────────

function deliveryLabel(tipo: 'motoboy' | 'retirada'): string {
  return tipo === 'retirada'
    ? 'Retirada em loja: a partir de 24h após confirmação do pagamento (dias úteis; não conta sábados e domingos), com teste e embalagem. Valor/condições sob consulta.'
    : 'Entrega via motoboy (mesmo dia, taxa a combinar/consultar).';
}

function orderPaymentLabel(): string {
  return 'Pagamento do pedido: PIX (enviar comprovante para confirmação). Dinheiro e cartão (crédito/débito) somente presenciais (in loco), mediante acordo.';
}

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
  const entrega = deliveryLabel(clientInfo.entrega);

  const lines: string[] = [
    'Olá! Quero fazer um pedido:',
    '',
    `📄 Pedido: ${formatOrderNo()} - ${dateStr}`,
    '',
  ];

  for (const it of cart) {
    const found = findProduct(it.id);
    const name = found ? found.product.name : it.id;
    const code = found ? found.product.code : '-';
    lines.push(
      `• ${it.qty}x ${name} (${code}) - ${brl(it.price)} = ${brl(it.price * it.qty)}`
    );
  }

  lines.push(
    '',
    `💰 Subtotal: ${brl(cartSubtotal())}`,
    `🚚 Entrega: ${entrega}`,
    `💳 ${orderPaymentLabel()}`,
    '',
    `👤 Cliente: ${clientInfo.nome.trim()}`,
    `📞 Telefone: ${clientInfo.telefone.trim()}`
  );

  if (clientInfo.bairro.trim()) {
    lines.push(`📍 Bairro/endereço: ${clientInfo.bairro.trim()}`);
  }
  if (clientInfo.obs.trim()) {
    lines.push(`📝 Obs: ${clientInfo.obs.trim()}`);
  }

  lines.push(
    '',
    'Pode confirmar a disponibilidade, as condições de entrega/retirada em Manaus e os dados para pagamento via PIX?'
  );

  return lines.join('\n');
}


function buildOrderReportInner(): string {
  const store = catalog.store || {};
  const now = new Date();
  const dateStr = `${now.toLocaleDateString('pt-BR')} às ${now.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
  const entrega = deliveryLabel(clientInfo.entrega);
  const pagamento = orderPaymentLabel();

  const rows = cart
    .map((it) => {
      const found = findProduct(it.id);
      const name = found ? found.product.name : `${it.id} (fora do catálogo)`;
      const code = found ? found.product.code : '-';
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
      <div class="text-sm text-zinc-900">${value || '-'}</div>
    </div>`;

  return `
    <div class="max-w-[190mm] mx-auto text-zinc-900">
      <!-- Cabeçalho -->
      <div class="flex items-start justify-between gap-4 border-b-[3px] border-[#0a8754] pb-3">
        <div class="flex items-center gap-3">
          <img src="images/Loja_img.png" alt="" class="w-12 h-12 rounded-full object-cover border-2 border-[#0a8754]" onerror="this.remove()" />
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
          ${field('Entrega/Retirada', escapeHtml(entrega))}
          ${field('Pagamento do pedido', escapeHtml(pagamento))}
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
        <div class="w-72 border border-zinc-300 rounded p-3 text-sm">
          <div class="flex justify-between">
            <span>Subtotal</span>
            <strong>${brl(cartSubtotal())}</strong>
          </div>
          <div class="mt-1 text-xs text-zinc-600 border-t border-zinc-200 pt-1.5 space-y-1">
            <div><strong>Entrega/Retirada:</strong> ${escapeHtml(entrega)}</div>
            <div><strong>Pagamento:</strong> ${escapeHtml(pagamento)}</div>
          </div>
          <div class="flex justify-between border-t border-zinc-300 mt-2 pt-2 text-base font-black">
            <span>TOTAL</span>
            <span class="text-[#0a8754]">${brl(cartSubtotal())}</span>
          </div>
        </div>
      </div>

      <!-- Condições da loja -->
      <div class="mt-4 text-[11px] text-zinc-700 border-t border-zinc-300 pt-3 leading-relaxed space-y-1">
        <div><strong>Entrega:</strong> ${escapeHtml(store.delivery || 'Entrega e retirada sob consulta.')}</div>
        <div><strong>Garantia:</strong> ${escapeHtml(store.warranty || 'Consulte condições de garantia.')}</div>
        <div><strong>Pagamento:</strong> ${escapeHtml(store.payment || 'Pagamento do pedido via PIX.')}</div>
        ${store.minOrder ? `<div><strong>Pedido mínimo:</strong> ${brl(store.minOrder)}</div>` : ''}
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
            <p class="text-4xl mb-3" aria-hidden="true">🛒</p>
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
          <div class="text-xs text-zinc-500 border-t border-emerald-200 pt-1.5 space-y-1">
            <div class="flex justify-between gap-2"><span>Entrega/Retirada</span><span class="text-right">Taxa/condições a consultar conforme modalidade</span></div>
            <div class="flex justify-between gap-2"><span>Pagamento do pedido</span><span class="text-right font-semibold text-emerald-700">PIX (comprovante para confirmação)</span></div>
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
            <label class="block text-[11px] font-semibold text-zinc-600 mb-1" for="client-entrega">Entrega/Retirada</label>
            <select id="client-entrega" class="${fieldClass}">
              <option value="motoboy" ${clientInfo.entrega !== 'retirada' ? 'selected' : ''}>Entrega via motoboy (mesmo dia, taxa a combinar/consultar)</option>
              <option value="retirada" ${clientInfo.entrega === 'retirada' ? 'selected' : ''}>Retirada em loja — a partir de 24h após confirmação do pagamento (dias úteis; não conta sáb. e dom.), com teste e embalagem</option>
            </select>
            <p class="mt-1 text-[11px] text-zinc-500">Retirada: valor/condições sob consulta. O prazo conta a partir da confirmação do pagamento (PIX), sem contar sábados e domingos, para teste e embalagem.</p>
          </div>
          <div>
            <label class="block text-[11px] font-semibold text-zinc-600 mb-1">Pagamento do pedido (plataforma)</label>
            <div class="w-full border border-emerald-200 rounded-lg px-3 py-2 text-sm bg-emerald-50 text-emerald-900 font-medium">PIX — envie o comprovante para confirmação</div>
            <p class="mt-1 text-[11px] text-zinc-500">Dinheiro e cartão (crédito/débito) são aceitos somente presencialmente (in loco), mediante acordo prévio.</p>
          </div>
          <div>
            <label class="block text-[11px] font-semibold text-zinc-600 mb-1" for="client-obs">Observações</label>
            <textarea id="client-obs" rows="2" placeholder="Cor desejada, horário, referência..." class="${fieldClass} resize-none">${escapeHtml(clientInfo.obs)}</textarea>
          </div>
        </div>
      </div>

      <!-- Ações -->
      <div class="border-t border-zinc-200 p-3 space-y-2 bg-zinc-50 shrink-0">
        ${perfil === 'cliente' ? `
        <button type="button" id="cart-send-wa" class="w-full inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold py-2.5 px-4 rounded-lg text-sm shadow-xs transition">
          <img src="images/Loja_img.png" alt="" class="w-4 h-4 rounded-full object-cover" onerror="this.remove()" />
          <span>Enviar pedido no WhatsApp</span>
        </button>
        ` : ''}
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

// ── Drawer lateral de detalhes do produto ────────────────────────────────────

function renderProductDrawer(): string {
  if (!detailOpen || !detailProductId) return '';

  const found = findProduct(detailProductId);
  if (!found) return '';

  const { category, product: p } = found;
  const isKit = (p.tags || []).includes('kit');
  const isTop = (p.tags || []).includes('mais-vendido');
  const cost = p.cost ?? 0;
  const margin = cost > 0 ? Math.round(((p.price - cost) / cost) * 100) : 0;
  const profit = p.price - cost;

  const tagsHtml = (p.tags || []).length
    ? `<div class="flex flex-wrap gap-1.5">${(p.tags || [])
        .map(
          (t) =>
            `<span class="bg-zinc-100 text-zinc-700 text-[11px] font-semibold px-2 py-0.5 rounded">${escapeHtml(t)}</span>`
        )
        .join('')}</div>`
    : '<span class="text-xs text-zinc-400">Sem tags</span>';

  const highlightsHtml = (p.highlights || []).length
    ? `<ul class="text-sm text-zinc-700 space-y-2">${(p.highlights || [])
        .map(
          (h) => `
        <li class="flex items-start gap-2">
          <span class="text-emerald-600 mt-0.5 font-bold">✓</span>
          <span>${escapeHtml(h)}</span>
        </li>`
        )
        .join('')}</ul>`
    : '<p class="text-sm text-zinc-500">Sem destaques informados.</p>';

  return `
    <div id="product-detail-overlay" class="fixed inset-0 bg-black/50 z-40 cart-drawer-overlay print:hidden"></div>
    <aside id="product-detail-drawer" class="fixed top-0 right-0 h-full w-full sm:w-[430px] bg-white z-50 shadow-2xl flex flex-col cart-drawer-panel print:hidden" role="dialog" aria-modal="true" aria-label="Detalhes do produto">
      <div class="flex items-center justify-between px-4 py-3 bg-[#0a8754] text-white shrink-0">
        <h2 class="font-bold text-sm flex items-center gap-2">
          <span>${category.icon}</span>
          <span>Detalhes do produto</span>
        </h2>
        <button type="button" data-close-product-detail class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition font-bold" aria-label="Fechar detalhes">✕</button>
      </div>

      <div id="product-detail-body" class="flex-1 overflow-y-auto p-4 space-y-4">
        <div class="bg-zinc-50 border border-zinc-200 rounded-xl overflow-hidden">
          <div class="relative h-56 flex items-center justify-center bg-white">
            <span class="text-6xl opacity-30 select-none">${category.icon}</span>
            ${
              p.image
                ? `<img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.name)}" class="absolute inset-0 w-full h-full object-contain p-4" onerror="this.remove()" />`
                : ''
            }
          </div>
        </div>

        <div class="space-y-2">
          <div class="flex items-center justify-between gap-2">
            <span class="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">${category.icon} ${escapeHtml(category.name)}</span>
            <div class="flex gap-1">
              ${isTop ? '<span class="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded">🔥 TOP</span>' : ''}
              ${isKit ? '<span class="bg-orange-100 text-orange-800 text-[10px] font-bold px-1.5 py-0.5 rounded">🎁 KIT</span>' : ''}
            </div>
          </div>
          <h3 class="text-xl font-black text-zinc-900 leading-tight">${escapeHtml(p.name)}</h3>
          <p><span class="font-mono text-xs tracking-wide text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded">Cód ${escapeHtml(p.code)}</span></p>
        </div>

        <div class="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
          <div class="flex items-baseline justify-between">
            <span class="text-xs text-zinc-500 font-mono">à vista</span>
            <div class="text-right">
              <span class="display-text text-2xl tabular-nums text-[#0a8754]">${brl(p.price)}</span>
              ${
                p.price_max && p.price_max > p.price
                  ? `<span class="block text-xs text-zinc-500 tabular-nums">até ${brl(p.price_max)}</span>`
                  : ''
              }
            </div>
          </div>
          ${
            perfil === 'lojista' && showCostMargins
              ? `
            <div class="mt-3 pt-3 border-t border-emerald-200 grid grid-cols-3 gap-2 text-center text-xs font-mono">
              <div><span class="block text-[10px] uppercase text-zinc-500">Custo</span><span class="font-semibold text-zinc-800">${brl(p.cost)}</span></div>
              <div><span class="block text-[10px] uppercase text-zinc-500">Lucro</span><span class="font-semibold text-emerald-700">${brl(profit)}</span></div>
              <div><span class="block text-[10px] uppercase text-zinc-500">Margem</span><span class="font-bold text-indigo-700">${margin}%</span></div>
            </div>`
              : ''
          }
        </div>

        <div>
          <h4 class="text-xs font-black uppercase text-zinc-500 mb-2">Destaques</h4>
          ${highlightsHtml}
        </div>

        <div>
          <h4 class="text-xs font-black uppercase text-zinc-500 mb-2">Tags</h4>
          ${tagsHtml}
        </div>
      </div>

      ${perfil === 'cliente' ? `
      <div class="border-t border-zinc-200 p-3 space-y-2 bg-zinc-50 shrink-0">
        <button type="button"
                data-add-to-cart="${p.id}"
                class="w-full inline-flex items-center justify-center gap-2 bg-[#0a8754] hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-lg text-sm shadow-xs transition">
          <span>🛒 Adicionar no carrinho</span>
        </button>
        <a href="${getWhatsAppUrl(p)}" target="_blank" rel="noopener"
           data-track-wa="${p.id}"
           class="w-full inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold py-2.5 px-4 rounded-lg text-sm shadow-xs transition">
          <img src="images/Loja_img.png" alt="" class="w-4 h-4 rounded-full object-cover" onerror="this.remove()" />
          <span>Falar no WhatsApp</span>
        </a>
      </div>
      ` : ''}
    </aside>
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

  // ── Rastreamento de engajamento ──
  // Clique no card abre detalhes do produto (view = abertura do detalhe, 1x por sessão/produto)
  document.querySelectorAll<HTMLElement>('[data-open-product]').forEach((el) => {
    el.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      // Evita abrir detalhes ao clicar em botões/links de ação dentro do card
      if (target.closest('[data-add-to-cart], [data-track-wa], a, button')) return;
      const pid = el.dataset.openProduct || '';
      if (pid) openProductDetail(pid);
    });
  });

  // Impressão: produto visível na viewport (1x por sessão/produto)
  if ('IntersectionObserver' in window) {
    const impressionObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const pid = (entry.target as HTMLElement).dataset.trackImpression || '';
          if (pid && !impressedProducts.has(pid)) {
            impressedProducts.add(pid);
            trackEvent(pid, 'impression');
          }
          impressionObserver.unobserve(entry.target);
        }
      },
      { threshold: 0.35 }
    );
    document.querySelectorAll<HTMLElement>('[data-track-impression]').forEach((el) => {
      const pid = el.dataset.trackImpression || '';
      if (pid && !impressedProducts.has(pid)) impressionObserver.observe(el);
    });
  }

  // WhatsApp do produto
  document.querySelectorAll<HTMLElement>('[data-track-wa]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const pid = el.dataset.trackWa || '';
      if (pid) trackEvent(pid, 'whatsapp_click');
    });
  });

  // Drawer de detalhes do produto
  document.querySelectorAll<HTMLElement>('[data-close-product-detail]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      closeProductDetail();
    });
  });
  const detailOverlay = document.getElementById('product-detail-overlay');
  if (detailOverlay) detailOverlay.addEventListener('click', closeProductDetail);

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
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      addToCart(btn.dataset.addToCart || '');
    });
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
      // Rastreamento: pedido via WhatsApp (um evento por produto no carrinho)
      for (const item of cart) {
        trackEvent(item.id, 'order_wa');
      }
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

  // ── Engajamento: buscar e renderizar dados da aba Engajamento ──
  if (activeTab === 'engagement' && perfil === 'lojista') {
    const periodSelect = document.getElementById('eng-period') as HTMLSelectElement | null;
    const categorySelect = document.getElementById('eng-category') as HTMLSelectElement | null;
    const chartMetricSelect = document.getElementById('eng-chart-metric') as HTMLSelectElement | null;
    const topNSelect = document.getElementById('eng-top-n') as HTMLSelectElement | null;
    const searchInput = document.getElementById('eng-search') as HTMLInputElement | null;
    const refreshBtn = document.getElementById('eng-refresh') as HTMLButtonElement | null;

    // Retenção dos últimos dados filtrados para exportação
    let lastEngagementStats: any[] = [];
    let lastEngagementFiltered: any[] = [];
    let lastEngagementParams: { period: string; category: string; chartMetric: string; topN: number } = {
      period: '30',
      category: '',
      chartMetric: 'views',
      topN: 10,
    };

    async function loadEngagementStats() {
      const period = periodSelect?.value || '30';
      const category = categorySelect?.value || '';
      const chartMetric = chartMetricSelect?.value || 'views';
      const topN = parseInt(topNSelect?.value || '10', 10);
      const search = searchInput?.value?.toLowerCase().trim() || '';
      const chartPeriodEl = document.getElementById('eng-chart-period');
      const btn = document.getElementById('eng-refresh') as HTMLButtonElement | null;
      const originalBtnHtml = btn?.innerHTML || '🔄 Atualizar';

      if (btn) {
        btn.disabled = true;
        btn.setAttribute('aria-busy', 'true');
        btn.innerHTML = '<span class="inline-block animate-spin" aria-hidden="true">↻</span><span>Atualizando…</span>';
        btn.classList.add('opacity-70', 'cursor-not-allowed');
      }

      if (chartPeriodEl) {
        chartPeriodEl.textContent = `Período: últimos ${period} dias`;
      }

      try {
        const res = await fetch(
          `/api/engagement/stats?period=${period}&category=${encodeURIComponent(category)}`
        );

        // Verifica se a resposta é JSON (evita quebrar se o servidor retornar HTML/404)
        const contentType = res.headers.get('content-type') || '';
        if (!res.ok || !contentType.includes('application/json')) {
          const text = await res.text();
          console.error('[Engajamento] Resposta não-JSON do servidor:', res.status, text.substring(0, 200));
          throw new Error(`Endpoint não disponível (HTTP ${res.status}). Verifique se o servidor foi redeployado.`);
        }

        const { stats, periodDays } = await res.json();
        lastEngagementStats = stats || [];
        lastEngagementParams = { period, category, chartMetric, topN };
        renderEngagementData(lastEngagementStats, parseInt(period, 10), chartMetric, topN, search);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error('[Engajamento] Erro:', msg);
        const tableBody = document.getElementById('eng-table-body');
        const metrics = ['eng-metric-impressions', 'eng-metric-views', 'eng-metric-wa', 'eng-metric-cart', 'eng-metric-orders'];
        if (tableBody) {
          tableBody.innerHTML =
            `<tr><td colspan="9" class="p-4 text-center"><div class="flex flex-col items-center gap-2"><span class="text-red-600 font-medium">${escapeHtml(msg)}</span><button id="eng-retry" class="text-xs bg-zinc-100 hover:bg-zinc-200 text-zinc-900 px-3 py-1 rounded border border-zinc-300 transition">Tentar novamente</button></div></td></tr>`;
          const retryBtn = document.getElementById('eng-retry');
          if (retryBtn) retryBtn.addEventListener('click', loadEngagementStats);
        }
        metrics.forEach((id) => {
          const el = document.getElementById(id);
          if (el) el.textContent = '—';
        });
        const chartContainer = document.getElementById('eng-chart-container');
        if (chartContainer) {
          chartContainer.innerHTML = '<div class="text-center text-red-500 text-sm">Erro ao carregar gráfico</div>';
        }
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.removeAttribute('aria-busy');
          btn.innerHTML = originalBtnHtml;
          btn.classList.remove('opacity-70', 'cursor-not-allowed');
        }
      }
    }

    function renderEngagementData(
      stats: any[],
      periodDays: number,
      chartMetric: string = 'views',
      topN: number = 10,
      search: string = ''
    ) {
      const METRIC_FIELD: Record<string, string> = {
        views: 'views',
        impressions: 'impressions',
        whatsapp_clicks: 'whatsapp_clicks',
        cart_adds: 'cart_adds',
        orders: 'orders',
      };
      const field = METRIC_FIELD[chartMetric] || 'views';

      // Busca por produto (case-insensitive)
      const filtered = search
        ? stats.filter((s) => String(s.product_name || s.product_id || '').toLowerCase().includes(search))
        : stats;

      // Ordena pela métrica selecionada (desc)
      filtered.sort((a, b) => (b[field] || 0) - (a[field] || 0));

      // Retenção para exportação
      lastEngagementFiltered = filtered;

      // Métricas resumo (sobre todos os stats do período/filtro de categoria)
      const totals = stats.reduce(
        (acc, s) => ({
          impressions: acc.impressions + (s.impressions || 0),
          views: acc.views + (s.views || 0),
          wa: acc.wa + (s.whatsapp_clicks || 0),
          cart: acc.cart + (s.cart_adds || 0),
          orders: acc.orders + (s.orders || 0),
        }),
        { impressions: 0, views: 0, wa: 0, cart: 0, orders: 0 }
      );

      const elImpressions = document.getElementById('eng-metric-impressions');
      const elViews = document.getElementById('eng-metric-views');
      const elWa = document.getElementById('eng-metric-wa');
      const elCart = document.getElementById('eng-metric-cart');
      const elOrders = document.getElementById('eng-metric-orders');
      if (elImpressions) elImpressions.textContent = totals.impressions.toLocaleString();
      if (elViews) elViews.textContent = totals.views.toLocaleString();
      if (elWa) elWa.textContent = totals.wa.toLocaleString();
      if (elCart) elCart.textContent = totals.cart.toLocaleString();
      if (elOrders) elOrders.textContent = totals.orders.toLocaleString();

      // Tabela de ranking
      const tableBody = document.getElementById('eng-table-body');
      if (tableBody) {
        if (filtered.length === 0) {
          const emptyMsg = search ? 'Nenhum produto encontrado com esse termo.' : 'Sem dados no período';
          const emptySub = search ? 'Tente outro termo de busca ou limpe o filtro.' : 'Ajuste o período ou a categoria e tente novamente.';
          tableBody.innerHTML = `<tr><td colspan="9" class="p-4 text-center"><div class="flex flex-col items-center gap-2"><p class="text-2xl">📭</p><p class="text-sm font-medium text-zinc-800">${emptyMsg}</p><p class="text-xs text-zinc-500 mt-1">${emptySub}</p></div></td></tr>`;
        } else {
          tableBody.innerHTML = filtered
          .map(
            (s) => `
            <tr class="hover:bg-zinc-50 border-b border-zinc-100 text-xs">
              <td class="p-3 font-medium text-zinc-900 min-w-[140px]"><div class="truncate">${escapeHtml(
                s.product_name || s.product_id
              )}</div></td>
              <td class="p-3 text-zinc-600">${escapeHtml(s.category || '-')}</td>
              <td class="p-3 text-right font-mono text-zinc-700">${(s.impressions || 0).toLocaleString()}</td>
              <td class="p-3 text-right font-mono text-zinc-700">${(s.views || 0).toLocaleString()}</td>
              <td class="p-3 text-right font-mono text-zinc-700">${(s.whatsapp_clicks || 0).toLocaleString()}</td>
              <td class="p-3 text-right font-mono text-zinc-700">${(s.cart_adds || 0).toLocaleString()}</td>
              <td class="p-3 text-right font-mono text-zinc-700">${(s.orders || 0).toLocaleString()}</td>
              <td class="p-3 text-right font-mono text-zinc-700">${(s.ctr || 0)}%</td>
              <td class="p-3 text-right font-mono text-zinc-500">${s.last_interaction ? new Date(s.last_interaction).toLocaleDateString('pt-BR') : '—'}</td>
            </tr>
          `
          )
          .join('');
        }
      }

      // Gráfico de barras (top produtos pela métrica selecionada)
      renderEngagementChart(filtered.slice(0, topN), periodDays, field);
    }

    function renderEngagementChart(stats: any[], periodDays: number, metricField: string = 'views') {
      const container = document.getElementById('eng-chart-container');
      if (!container) return;

      const topStats = stats;
      if (topStats.length === 0) {
        container.innerHTML =
          '<div class="text-center text-zinc-400 text-sm">Sem dados no período</div>';
        return;
      }

      const maxViews = Math.max(...topStats.map((s) => s[metricField] || 0), 1);
      const chartHeight = 260;
      const padding = { top: 30, right: 20, bottom: 60, left: 70 };
      const barWidth = 36;
      const gap = 14;
      // Largura do viewBox cresce com o número de barras (evita comprimir em telas pequenas)
      const svgWidth = Math.max(720, padding.left + padding.right + topStats.length * (barWidth + gap));

      let svg = `<svg width="100%" height="${chartHeight}" viewBox="0 0 ${svgWidth} ${chartHeight}" xmlns="http://www.w3.org/2000/svg" class="w-full" role="img" aria-labelledby="eng-chart-title">
        <title id="eng-chart-title">Top produtos por ${metricField.replace(/_/g, ' ')} no período selecionado</title>
        <defs>
          <linearGradient id="gradViews" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#0a8754" stop-opacity="0.85"/>
            <stop offset="100%" stop-color="#0a8754" stop-opacity="0.25"/>
          </linearGradient>
        </defs>

        <!-- Eixo Y -->
        <text x="15" y="24" class="text-[10px] text-zinc-500 font-mono">${maxViews}</text>
        <text x="15" y="${chartHeight - 12}" class="text-[10px] text-zinc-500 font-mono">0</text>

        <!-- Barras -->
        ${topStats
          .map((s, i) => {
            const value = s[metricField] || 0;
            const x = padding.left + i * (barWidth + gap);
            const h = (value / maxViews) * (chartHeight - padding.top - padding.bottom);
            const y = chartHeight - padding.bottom - h;
            const label = escapeHtml(String(s.product_name || s.product_id));
            return `
              <rect x="${x}" y="${y}" width="${barWidth - 4}" height="${h}" fill="url(#gradViews)" rx="2" title="${label}: ${value}"/>
              <text x="${x + (barWidth - 4) / 2}" y="${chartHeight - padding.bottom + 18}" 
                    class="text-[10px] text-zinc-500 font-mono" text-anchor="middle" transform="rotate(-45 ${x + (barWidth - 4) / 2},${chartHeight - padding.bottom + 18})">${escapeHtml(String(s.product_name || s.product_id).substring(0, 14))}</text>
              <text x="${x + (barWidth - 4) / 2}" y="${y - 6}" 
                    class="text-[10px] text-[#0a8754] font-bold font-mono" text-anchor="middle">${value}</text>
            `;
          })
          .join('')
        }
      </svg>`;

      container.innerHTML = svg;
    }

    function exportEngagementToCsv() {
      const data = lastEngagementFiltered.length ? lastEngagementFiltered : lastEngagementStats;
      const { period, category, chartMetric, topN } = lastEngagementParams;
      const METRIC_LABEL: Record<string, string> = {
        views: 'Visualizações (detalhe)',
        impressions: 'Impressões',
        whatsapp_clicks: 'Cliques WhatsApp',
        cart_adds: 'Adicionou Carrinho',
        orders: 'Pedidos via WA',
      };
      const metricLabel = METRIC_LABEL[chartMetric] || chartMetric;
      const rows: string[][] = [];
      rows.push(['Período', 'Categoria filtro', 'Métrica gráfico', 'Produto', 'Categoria', 'Impressões', 'Views (detalhe)', 'Cliques WhatsApp', 'Carrinho', 'Pedidos', 'CTR %', 'Última interação']);
      for (const s of data) {
        rows.push([
          `Últimos ${period} dias`,
          category || 'Todas',
          metricLabel,
          s.product_name || s.product_id,
          s.category || '-',
          String(s.impressions || 0),
          String(s.views || 0),
          String(s.whatsapp_clicks || 0),
          String(s.cart_adds || 0),
          String(s.orders || 0),
          String(s.ctr || 0),
          s.last_interaction ? new Date(s.last_interaction).toLocaleDateString('pt-BR') : '—',
        ]);
      }
      const csv = rows.map((r) =>
        r.map((v) => {
          const s = String(v);
          return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
        }).join(';')
      ).join('\n');
      const bom = '\uFEFF';
      const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `engajamento-${period}dias-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('CSV exportado com sucesso!');
    }

    // Carregar dados iniciais
    loadEngagementStats();

    // Wire filtros
    periodSelect?.addEventListener('change', loadEngagementStats);
    categorySelect?.addEventListener('change', loadEngagementStats);
    chartMetricSelect?.addEventListener('change', loadEngagementStats);
    topNSelect?.addEventListener('change', loadEngagementStats);
    searchInput?.addEventListener('input', loadEngagementStats);
    refreshBtn?.addEventListener('click', loadEngagementStats);
    const exportBtn = document.getElementById('eng-export-csv');
    exportBtn?.addEventListener('click', () => exportEngagementToCsv());
  }
}

// Fecha drawers com Esc (listener único, fora do re-render)
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if (detailOpen) {
    detailOpen = false;
    detailProductId = null;
    renderApp();
    return;
  }
  if (cartOpen) {
    cartOpen = false;
    renderApp();
  }
});
