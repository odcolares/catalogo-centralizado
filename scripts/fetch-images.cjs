'use strict';

/**
 * Coleta imagens de produtos no site do fornecedor (luizeletronicos.com.br)
 * e grava em public/images/ + campo "image"/"sourceUrl" no catalog-data.json.
 *
 * Uso:
 *   node scripts/fetch-images.cjs            (busca, baixa e atualiza o JSON)
 *   node scripts/fetch-images.cjs --dry-run  (só mostra o casamento, não altera nada)
 *   node scripts/fetch-images.cjs --force    (rebaixa mesmo já tendo imagem)
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DATA_FILE = path.join(ROOT, 'catalog-data.json');
const IMG_DIR = path.join(ROOT, 'public', 'images');
const REPORT_FILE = path.join(ROOT, 'generated', 'imagens-relatorio.md');
const BASE = 'https://www.luizeletronicos.com.br';
const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';
const DELAY_MS = 400;
const MIN_SCORE = 0.5;
const STOPWORDS = new Set(['de', 'da', 'do', 'para', 'com', 'sem', 'em', 'no', 'na', 'e', 'un', 'unidade']);

const args = new Set(process.argv.slice(2));
const DRY_RUN = args.has('--dry-run');
const FORCE = args.has('--force');

// Queries extras por produto (id) quando código/nome não bastam
const EXTRA_QUERIES = {
  'caixa-mini': ['caixa som mini'],
  'cabo-v8-3a': ['cabo v8'],
};

// Casos em que o score automático não basta mas o SKU equivalente é conhecido
const SKU_OVERRIDES = {
  // fornecedor lista como "caixa som mini clorido qualidade 5W" (typo: colorido)
  'caixa-mini': 'R146',
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchWithRetry(url, tries = 3) {
  let lastErr;
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res;
    } catch (err) {
      lastErr = err;
      await sleep(800 * (i + 1));
    }
  }
  throw lastErr;
}

async function fetchText(url, tries = 3) {
  const res = await fetchWithRetry(url, tries);
  return res.text();
}

function norm(s) {
  return String(s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function tokens(s) {
  return new Set(norm(s).split(' ').filter((t) => t.length >= 2 && !STOPWORDS.has(t)));
}

function overlapRatio(a, b) {
  const A = tokens(a);
  const B = tokens(b);
  if (!A.size || !B.size) return 0;
  let inter = 0;
  for (const t of A) if (B.has(t)) inter++;
  return inter / Math.min(A.size, B.size);
}

function rawFirstToken(code) {
  return String(code || '').trim().split(/\s+/)[0] || '';
}

function decodeEntities(s) {
  return String(s)
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

/** Parseia os cards de uma página de busca/listagem. */
function parseCards(html) {
  const chunks = html.split(/<div class="product-card[\s>]/).slice(1);
  return chunks
    .map((chunk) => {
      const name = (chunk.match(/product-card__name">([^<]+)<\/h3>/) || [])[1];
      const sku = (chunk.match(/product-card__sku">([^<]+)<\/div>/) || [])[1];
      const img = (chunk.match(/data-src="(https:[^"]+\/uploads\/[^"]+)"/) || [])[1];
      const href = (chunk.match(/href="(\/products\/[^"]+)"/) || [])[1];
      return {
        name: name ? decodeEntities(name).trim() : '',
        sku: sku ? decodeEntities(sku).trim() : '',
        img: img || '',
        href: href ? href.split('?')[0] : '',
      };
    })
    .filter((c) => c.name && c.img);
}

function codeSegments(code) {
  return String(code || '')
    .trim()
    .split(/\s+/)
    .filter((s) => s.length >= 2);
}

/** Pontua quanto o card do fornecedor corresponde ao produto do catálogo. */
function scoreCard(card, product) {
  let s = 0;
  const segs = codeSegments(product.code).map((t) => norm(t)).filter((t) => t.length >= 3);
  const skuNorm = norm(card.sku);
  const nameNorm = norm(card.name);

  if (segs.length && skuNorm.includes(norm(rawFirstToken(product.code))) && rawFirstToken(product.code).length >= 3) s += 0.6;
  if (segs.some((seg) => skuNorm.includes(seg))) s += 0.3;
  if (segs.some((seg) => nameNorm.includes(seg))) s += 0.4;

  s += 0.4 * overlapRatio(product.name, card.name);
  if (norm(product.name) === nameNorm) s += 0.2;
  return Math.min(Number(s.toFixed(2)), 1);
}

function buildQueries(product) {
  const qs = [];
  const push = (q) => {
    const v = String(q || '').trim();
    if (v && !qs.includes(v)) qs.push(v);
  };
  push(product.code);
  for (const seg of codeSegments(product.code)) push(seg);
  for (const q of EXTRA_QUERIES[product.id] || []) push(q);
  push(product.name);
  return qs;
}

async function findBestMatch(product) {
  const queries = buildQueries(product);
  const seen = new Set();
  const candidates = [];
  const hasOverride = Boolean(SKU_OVERRIDES[product.id]);

  for (const q of queries) {
    let cards = [];
    try {
      const html = await fetchText(`${BASE}/buscar?q=${encodeURIComponent(q)}`);
      cards = parseCards(html);
    } catch (err) {
      console.warn(`  ! busca falhou para "${q}": ${err.message}`);
    }
    for (const card of cards) {
      const key = card.href || card.img;
      if (seen.has(key)) continue;
      seen.add(key);
      candidates.push({ card, score: scoreCard(card, product), query: q });
    }
    await sleep(DELAY_MS);
    if (!hasOverride && candidates.some((c) => c.score >= MIN_SCORE)) break;
  }

  candidates.sort((a, b) => b.score - a.score);
  if (hasOverride) {
    const ov = norm(SKU_OVERRIDES[product.id]);
    const hit = candidates.find((c) => norm(c.card.sku).includes(ov));
    if (hit) return { ...hit, override: true };
  }
  return candidates[0] || null;
}

function upgradeImageUrl(url) {
  return url.replace(/\/w_\d+\//, '/w_800/');
}

async function downloadImage(url, destPath) {
  const res = await fetchWithRetry(url);
  const type = res.headers.get('content-type') || '';
  if (!type.startsWith('image/')) throw new Error(`conteúdo não é imagem (${type || 'sem content-type'})`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 1500) throw new Error(`imagem suspeita pequena (${buf.length} bytes)`);
  fs.writeFileSync(destPath, buf);
  return { bytes: buf.length, type };
}

function loadCatalog() {
  const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  return data;
}

function enabledProducts(data) {
  return data.categories.flatMap((cat) =>
    cat.products.filter((p) => p.enabled !== false).map((p) => ({ cat, product: p }))
  );
}

function saveCatalog(data) {
  const json = JSON.stringify(data, null, 2) + '\n';
  // NÃO copiar para public/ — catalog-data.json contém custos e não pode ser público.
  // Após alterar, rode `node generator.cjs` para atualizar catalog-public.json.
  fs.writeFileSync(DATA_FILE, json, 'utf8');
}

function writeReport(results) {
  const ok = results.filter((r) => r.status === 'ok');
  const miss = results.filter((r) => r.status === 'miss');
  const fail = results.filter((r) => r.status === 'fail');
  const lines = [
    '# Relatório de imagens dos produtos',
    '',
    `> Gerado: ${new Date().toISOString()} | Automáticas: **${ok.length}** | Sem match: **${miss.length}** | Falha no download: **${fail.length}**`,
    '',
    '## ✅ Imagens coletadas automaticamente',
    '',
    '| Produto | Código | Query usada | Score | SKU fornecedor | Arquivo |',
    '|---------|--------|-------------|-------|----------------|---------|',
    ...ok.map(
      (r) =>
        `| ${r.name} | ${r.code} | \`${r.query}\` | ${r.score} | ${r.sku || '—'} | \`${r.file}\` |`
    ),
    '',
    '## ⚠️ Sem imagem — revisar manualmente',
    '',
    ...(miss.length
      ? miss.map((r) => `- **${r.name}** (${r.code}) — nenhuma query atingiu score >= ${MIN_SCORE}`)
      : ['- nenhum 🎉']),
    '',
    '## ❌ Falha no download',
    '',
    ...(fail.length ? fail.map((r) => `- **${r.name}**: ${r.error}`) : ['- nenhum 🎉']),
    '',
  ];
  fs.mkdirSync(path.dirname(REPORT_FILE), { recursive: true });
  fs.writeFileSync(REPORT_FILE, lines.join('\n'), 'utf8');
}

async function main() {
  const data = loadCatalog();
  const targets = enabledProducts(data);
  console.log(`Produtos ativos: ${targets.length} | dry-run: ${DRY_RUN} | force: ${FORCE}`);

  if (!DRY_RUN) fs.mkdirSync(IMG_DIR, { recursive: true });

  const results = [];
  for (const { cat, product } of targets) {
    if (product.image && !FORCE && !DRY_RUN) {
      results.push({ status: 'ok', name: product.name, code: product.code, query: '—', score: '—', sku: '—', file: product.image });
      console.log(`= ${product.name} já tem imagem, pulando`);
      continue;
    }

    console.log(`> ${product.name} (${product.code})`);
    let match = null;
    try {
      match = await findBestMatch(product);
    } catch (err) {
      console.warn(`  ! erro na busca: ${err.message}`);
    }

    if (!match || (match.score < MIN_SCORE && !match.override)) {
      results.push({
        status: 'miss',
        name: product.name,
        code: product.code,
        best: match ? `${match.score} (${match.query} → ${match.card.name})` : 'nenhum resultado',
      });
      console.warn(`  x sem match (melhor: ${match ? match.score : 'n/a'})`);
      continue;
    }

    const ext = /\.png($|\?)/i.test(match.card.img) ? 'png' : 'jpg';
    const fileName = `${product.id}.${ext}`;
    const entry = {
      status: 'ok',
      name: product.name,
      code: product.code,
      query: match.override ? `${match.query} [override sku]` : match.query,
      score: match.score,
      sku: match.card.sku,
      file: `images/${fileName}`,
      product,
      imgUrl: upgradeImageUrl(match.card.img),
      sourceUrl: match.card.href ? BASE + match.card.href : '',
    };

    if (DRY_RUN) {
      console.log(`  + match ${match.score} via "${match.query}" → ${match.card.name} [${match.card.sku || 'sem sku'}]`);
      results.push(entry);
      continue;
    }

    try {
      const { bytes } = await downloadImage(entry.imgUrl, path.join(IMG_DIR, fileName));
      product.image = `images/${fileName}`;
      if (entry.sourceUrl) product.sourceUrl = entry.sourceUrl;
      console.log(`  ✓ ${product.image} (${bytes} bytes) via "${match.query}" [${match.card.sku || 'sem sku'}]`);
      results.push(entry);
    } catch (err) {
      console.warn(`  x falha no download: ${err.message}`);
      results.push({ status: 'fail', name: product.name, code: product.code, error: err.message });
    }
    await sleep(DELAY_MS);
  }

  if (!DRY_RUN) {
    saveCatalog(data);
    writeReport(results);
    console.log(`\nJSON atualizado + relatório em ${path.relative(ROOT, REPORT_FILE)}`);
  }

  const counts = results.reduce((acc, r) => ((acc[r.status] = (acc[r.status] || 0) + 1), acc), {});
  console.log(`Resumo: ${JSON.stringify(counts)}`);
}

main().catch((err) => {
  console.error('ERRO:', err.message);
  process.exit(1);
});
