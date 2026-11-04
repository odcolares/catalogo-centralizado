'use strict';

const fs = require('fs');
const path = require('path');
// const puppeteer = require('puppeteer'); // STRIPPED: puppeteer browser unavailable in container

const ROOT = __dirname;
const DATA_FILE = path.join(ROOT, 'catalog-data.json');
const OUT_DIR = path.join(ROOT, 'generated');

function brl(value) {
  if (value === null || value === undefined) return '—';
  return 'R$ ' + Number(value).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function loadData() {
  const raw = fs.readFileSync(DATA_FILE, 'utf8');
  let data;
  try {
    data = JSON.parse(raw);
  } catch (err) {
    throw new Error('catalog-data.json não é um JSON válido: ' + err.message);
  }
  if (!data || !Array.isArray(data.categories) || data.categories.length === 0) {
    throw new Error('catalog-data.json precisa ter ao menos uma categoria em "categories".');
  }
  return data;
}

function validate(data) {
  const required = ['id', 'name', 'code', 'cost', 'price', 'highlights', 'tags'];
  const problems = [];
  for (const cat of data.categories) {
    if (!cat.id || !cat.name) {
      problems.push(`Categoria inválida: precisa de id e name (${JSON.stringify(cat)}).`);
    }
    if (!Array.isArray(cat.products)) {
      problems.push(`Categoria "${cat.id || cat.name}" não tem array de produtos.`);
      continue;
    }
    for (const p of cat.products) {
      for (const field of required) {
        if (p[field] === undefined || p[field] === null || p[field] === '') {
          problems.push(`Produto ${p.id || '(sem id)'} (categoria ${cat.id}): campo obrigatório ausente — "${field}".`);
        }
      }
      if (typeof p.price !== 'number' || p.price <= 0) {
        problems.push(`Produto ${p.id || '(sem id)'} (categoria ${cat.id}): price deve ser > 0.`);
      }
      if (typeof p.cost !== 'number' || p.cost < 0) {
        problems.push(`Produto ${p.id || '(sem id)'} (categoria ${cat.id}): cost deve ser >= 0.`);
      }
      if (!Array.isArray(p.highlights) || p.highlights.length === 0) {
        problems.push(`Produto ${p.id || '(sem id)'} (categoria ${cat.id}): highlights[] não pode ser vazio.`);
      }
      if (!Array.isArray(p.tags) || p.tags.length === 0) {
        problems.push(`Produto ${p.id || '(sem id)'} (categoria ${cat.id}): tags[] não pode ser vazio.`);
      }
    }
  }
  if (problems.length) {
    throw new Error('Validação falhou:\n- ' + problems.join('\n- '));
  }
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeMd(s) {
  return String(s).replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

// ---------- Markdown output ----------
function buildMarkdown(data) {
  const store = data.store || {};
  const lines = [];
  lines.push(`# Catálogo Consolidado — ${store.name || '[Nome da Loja]'}`);
  lines.push('');
  lines.push(`> **Fonte custo:** ${store.supplier || 'luizeletronicos.com.br'} | **Cidade:** ${store.city || 'Manaus/AM'}`);
  lines.push(`> **Entrega:** ${store.delivery || ''}`);
  lines.push(`> **Garantia:** ${store.warranty || ''}`);
  lines.push(`> **Pagamento:** ${store.payment || ''}`);
  lines.push(`> **Pedido mínimo:** ${brl(store.minOrder)}`);
  lines.push('');

  let total = 0;
  const summary = ['| Categoria | Qtd Produtos | Faixa de Preço (venda) |', '|-----------|-------------|------------------------|'];
  for (const cat of data.categories) {
    const prices = cat.products.map((p) => p.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = min === max ? brl(min) : `${brl(min)} – ${brl(max)}`;
    summary.push(`| ${cat.icon || ''} ${cat.name} | ${cat.products.length} | ${range} |`);
    total += cat.products.length;
  }
  summary.push(`| **TOTAL** | **${total} produtos** | — |`);
  lines.push(...summary, '');

  for (const cat of data.categories) {
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
        `| ${escapeMd(p.name)}${kit} | ${escapeMd(p.code)} | ${brl(p.cost)} | ${priceCell} | ${margin}% | ${escapeMd(p.highlights.join(', '))} |`
      );
    }
    lines.push('');
  }

  lines.push('---');
  lines.push('');
  lines.push('Gerado automaticamente a partir de `catalog-data.json`. Não editar manualmente.');
  lines.push('');
  return lines.join('\n');
}

// ---------- HTML output ----------
function buildHtml(data) {
  const store = data.store || {};
  const waNumber = (store.whatsapp || '').replace(/\D/g, '');
  const waLink = `https://wa.me/${waNumber}`;

  const cards = data.categories.map((cat) => {
    const items = cat.products.map((p) => {
      const isKit = (p.tags || []).includes('kit');
      const kitBadge = isKit ? '<span class="badge kit">🎁 Kit</span>' : '';
      let price = `<span class="price">${brl(p.price)}</span>`;
      if (p.price_max && p.price_max > p.price) {
        price += ` <span class="price-max">até ${brl(p.price_max)}</span>`;
      }
      const highlights = p.highlights
        .map((h) => `<li>${escapeHtml(h)}</li>`)
        .join('');
      const msg = encodeURIComponent(`Olá! Vi o catálogo da ${store.name || 'loja'} e tenho interesse no produto: ${p.name} (${p.code}).`);
      return `
        <article class="product">
          <div class="product-head">
            <h3>${escapeHtml(p.name)} ${kitBadge}</h3>
            <div class="price-block">${price}</div>
          </div>
          <p class="code">Código: ${escapeHtml(p.code)}</p>
          <ul class="highlights">${highlights}</ul>
          <a class="wa-btn" href="${waLink}?text=${msg}" target="_blank" rel="noopener">Pedir no WhatsApp</a>
        </article>`;
    }).join('');

    return `
      <details class="category" open>
        <summary>${cat.icon || ''} ${escapeHtml(cat.name)} <span class="count">${cat.products.length}</span></summary>
        <div class="grid">${items}</div>
      </details>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Catálogo Centralizado Eletrônicos Manaus</title>
<meta name="description" content="Catálogo centralizado de eletrônicos em Manaus com fonte única em JSON que gera catálogo digital interativo, Markdown e API.">
<meta property="og:title" content="Catálogo Centralizado Eletrônicos Manaus">
<meta property="og:description" content="Catálogo centralizado de eletrônicos em Manaus com fonte única em JSON que gera catálogo digital interativo, Markdown e API.">
<style>
  :root { --primary:#0a8754; --bg:#f5f7f6; --card:#fff; --ink:#1c1c1c; --muted:#666; }
  * { box-sizing: border-box; }
  body { margin:0; font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; background:var(--bg); color:var(--ink); }
  header { background:var(--primary); color:#fff; padding:24px 16px; text-align:center; }
  header h1 { margin:0 0 8px; font-size:1.5rem; }
  header p { margin:4px 0; font-size:.9rem; opacity:.95; }
  main { max-width:980px; margin:0 auto; padding:16px; }
  .category { background:var(--card); border-radius:12px; margin:12px 0; box-shadow:0 1px 4px rgba(0,0,0,.08); overflow:hidden; }
  .category > summary { cursor:pointer; padding:16px; font-size:1.1rem; font-weight:600; list-style:none; display:flex; align-items:center; gap:8px; }
  .category > summary::-webkit-details-marker { display:none; }
  .count { background:var(--primary); color:#fff; border-radius:999px; padding:1px 9px; font-size:.8rem; margin-left:auto; }
  .grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(240px,1fr)); gap:12px; padding:0 16px 16px; }
  .product { border:1px solid #e6e6e6; border-radius:10px; padding:14px; display:flex; flex-direction:column; }
  .product-head { display:flex; justify-content:space-between; align-items:flex-start; gap:8px; }
  .product h3 { margin:0; font-size:1rem; line-height:1.3; }
  .price-block { text-align:right; white-space:nowrap; }
  .price { font-weight:700; color:var(--primary); }
  .price-max { display:block; font-size:.75rem; color:var(--muted); }
  .code { color:var(--muted); font-size:.8rem; margin:6px 0; }
  .highlights { margin:0 0 12px; padding-left:18px; font-size:.85rem; color:#333; flex:1; }
  .badge.kit { background:#ffe7b3; color:#8a5a00; border-radius:6px; padding:1px 6px; font-size:.7rem; font-weight:600; margin-left:6px; }
  .wa-btn { display:block; text-align:center; background:#25D366; color:#fff; text-decoration:none; padding:10px; border-radius:8px; font-weight:600; font-size:.9rem; }
  footer { text-align:center; color:var(--muted); font-size:.8rem; padding:24px 16px; }
</style>
</head>
<body>
<header>
  <h1>${escapeHtml(store.name || '[Nome da Loja]')}</h1>
  <p>📍 ${escapeHtml(store.city || 'Manaus/AM')}</p>
  <p>🚚 ${escapeHtml(store.delivery || '')}</p>
  <p>✅ ${escapeHtml(store.warranty || '')}</p>
  <p>💳 ${escapeHtml(store.payment || '')}</p>
</header>
<main>
${cards}
</main>
<footer>Catálogo gerado automaticamente a partir de <code>catalog-data.json</code>.</footer>
</body>
</html>`;
}

// ---------- API JSON output ----------
function buildApiJson(data) {
  const STOPWORDS = new Set(['de', 'da', 'do', 'para', 'com', 'sem', 'em', 'no', 'na', 'e']);
  const out = [];
  for (const cat of data.categories) {
    for (const p of cat.products) {
      const tags = new Set(p.tags || []);
      tags.add(cat.id);
      if (p.code) tags.add(p.code.toLowerCase().replace(/\s+/g, '-'));
      const nameTokens = String(p.name).toLowerCase().split(/[^a-z0-9]+/i);
      for (const t of nameTokens) {
        if (t.length >= 2 && !STOPWORDS.has(t)) tags.add(t);
      }
      if (p.price_max && p.price_max > p.price) tags.add('com-faixa');
      out.push({
        id: p.id,
        name: p.name,
        price: p.price,
        price_max: p.price_max || null,
        category: cat.id,
        categoryName: cat.name,
        tags: Array.from(tags),
      });
    }
  }
  return out;
}

async function buildPdf(html) {
  // Puppeteer is stripped in container environments
  throw new Error('Puppeteer desativado no ambiente de container.');
}

async function main() {
  const data = loadData();
  validate(data);

  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const md = buildMarkdown(data);
  const html = buildHtml(data);
  const api = buildApiJson(data);

  fs.writeFileSync(path.join(OUT_DIR, 'catalogo-consolidado.md'), md, 'utf8');
  fs.writeFileSync(path.join(OUT_DIR, 'catalogo-digital.html'), html, 'utf8');
  fs.writeFileSync(path.join(OUT_DIR, 'index.html'), html, 'utf8');
  fs.writeFileSync(path.join(ROOT, 'index.html'), html, 'utf8');
  fs.writeFileSync(path.join(OUT_DIR, 'catalog-api.json'), JSON.stringify(api, null, 2), 'utf8');

  let pdfNote = '';
  try {
    const pdf = await buildPdf(html);
    fs.writeFileSync(path.join(OUT_DIR, 'catalogo-digital.pdf'), pdf);
    pdfNote = 'PDF gerado via Puppeteer.';
  } catch (err) {
    pdfNote = 'AVISO: PDF não pôde ser gerado (Puppeteer/Chromium indisponível): ' + err.message;
    console.warn(pdfNote);
  }

  const total = data.categories.reduce((n, c) => n + c.products.length, 0);
  console.log(`OK. ${data.categories.length} categorias, ${total} produtos.`);
  console.log(`Arquivos em: ${OUT_DIR}`);
  console.log(`- catalogo-consolidado.md`);
  console.log(`- catalogo-digital.html`);
  console.log(`- catalog-api.json (${api.length} itens)`);
  console.log(`- catalogo-digital.pdf ${pdfNote ? '(' + pdfNote + ')' : ''}`);

  return { data, total, outDir: OUT_DIR };
}

if (require.main === module) {
  main().catch((err) => {
    console.error('ERRO ao gerar catálogo:');
    console.error(err.message);
    process.exit(1);
  });
}

module.exports = { main, loadData, validate, buildMarkdown, buildHtml, buildApiJson };
