'use strict';

const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { main: runGenerator } = require('./generator.cjs');

// ── Supabase (opcional; se não configurado, usa arquivo JSON local como fallback) ──
let supabase = null;
let supabaseEnabled = false;
let SUPABASE_URL_GLOBAL = '';
let SUPABASE_SERVICE_KEY_GLOBAL = '';
try {
  const { createClient } = require('@supabase/supabase-js');
  // Lê .env diretamente (parseEnvFile definido mais abaixo)
  const _envLines = require('fs').readFileSync(require('path').join(__dirname, '.env'), 'utf8').split(/\r?\n/);
  const _envMap = {};
  for (const _l of _envLines) {
    const _m = _l.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (_m) _envMap[_m[1]] = _m[2].replace(/^["']|["']$/g, '');
  }
  const SUPABASE_URL = process.env.SUPABASE_URL || _envMap.SUPABASE_URL;
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || _envMap.SUPABASE_SERVICE_ROLE_KEY;
  SUPABASE_URL_GLOBAL = SUPABASE_URL;
  SUPABASE_SERVICE_KEY_GLOBAL = SUPABASE_SERVICE_KEY;
  if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
    supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    supabaseEnabled = true;
    console.log('[Supabase] Conectado para rastreamento de engajamento');
    // Garante que o bucket pedidos existe (público, para URLs de PDF)
    (async () => {
      try {
        const { data, error } = await supabase.storage.createBucket('pedidos', { public: true });
        if (error && !error.message.includes('already exists')) {
          console.error('[Supabase] Erro ao criar bucket pedidos:', error.message);
        } else {
          console.log('[Supabase] Bucket pedidos pronto');
        }
      } catch (e) {
        console.error('[Supabase] Erro ao verificar bucket pedidos:', e.message);
      }
    })();
  } else {
    console.log('[Supabase] Credenciais não encontradas — usando fallback JSON local');
  }
} catch {
  console.log('[Supabase] Pacote não instalado — usando fallback JSON local');
}

function ensureEngagementDir() {
  const dir = path.dirname(ENGAGEMENT_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function readEngagementFallback() {
  try {
    if (!fs.existsSync(ENGAGEMENT_FILE)) return [];
    return JSON.parse(fs.readFileSync(ENGAGEMENT_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function writeEngagementFallback(data) {
  ensureEngagementDir();
  fs.writeFileSync(ENGAGEMENT_FILE, JSON.stringify(data, null, 2), 'utf8');
}

async function trackEngagementEvent({ productId, eventType, sessionId }) {
  const record = {
    product_id: productId,
    event_type: eventType,
    session_id: sessionId || null,
    created_at: new Date().toISOString(),
  };

  console.log(`[Engajamento] Recebido evento: ${eventType} - ${productId} - session: ${sessionId}`);

  if (supabaseEnabled && supabase) {
    try {
      await supabase.from('product_engagement').insert([record]);
      console.log(`[Engajamento] Salvo no Supabase: ${eventType} - ${productId}`);
      return;
    } catch (err) {
      console.error('[Supabase] Erro ao inserir engajamento:', err.message);
      // Fallback para JSON local
    }
  }

  try {
    const data = readEngagementFallback();
    data.push(record);
    writeEngagementFallback(data);
    console.log(`[Engajamento] Salvo em JSON local: ${eventType} - ${productId} (total: ${data.length})`);
  } catch (err) {
    console.error('[Engajamento] Erro ao salvar em JSON local:', err.message);
  }
}

async function getEngagementStats({ periodDays = 30, category = null } = {}) {
  const cutoff = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000).toISOString();

  console.log(`[Engajamento] Buscando stats: period=${periodDays}d, category=${category}, cutoff=${cutoff}`);

  if (supabaseEnabled && supabase) {
    try {
      let query = supabase
        .from('product_engagement')
        .select('product_id, event_type, created_at')
        .gte('created_at', cutoff);

      const { data, error } = await query;
      if (error) throw error;
      console.log(`[Engajamento] Supabase retornou ${data?.length || 0} eventos`);
      return aggregateEngagement(data || [], category);
    } catch (err) {
      console.error('[Supabase] Erro ao ler engajamento:', err.message);
      // Fallback para JSON local
    }
  }

  const allData = readEngagementFallback();
  const filtered = allData.filter((r) => r.created_at >= cutoff);
  console.log(`[Engajamento] JSON local: ${allData.length} total, ${filtered.length} no período`);
  return aggregateEngagement(filtered, category);
}

function aggregateEngagement(events, categoryFilter) {
  // Monta mapa de produto → contagens por tipo de evento
  const map = {};
  const catalog = loadCatalogForStats();

  for (const ev of events) {
    if (!map[ev.product_id]) {
      map[ev.product_id] = { impressions: 0, views: 0, whatsapp_clicks: 0, cart_adds: 0, orders: 0, last_interaction: ev.created_at };
    }
    // Mapeia event_type do frontend para os campos de contagem
    if (ev.event_type === 'impression') {
      map[ev.product_id].impressions += 1;
    } else if (ev.event_type === 'view') {
      map[ev.product_id].views += 1;
    } else if (ev.event_type === 'whatsapp_click') {
      map[ev.product_id].whatsapp_clicks += 1;
    } else if (ev.event_type === 'cart_add') {
      map[ev.product_id].cart_adds += 1;
    } else if (ev.event_type === 'order_wa') {
      map[ev.product_id].orders += 1;
    }
    // cart_remove não é contabilizado nas métricas principais
    if (ev.created_at > map[ev.product_id].last_interaction) {
      map[ev.product_id].last_interaction = ev.created_at;
    }
  }

  const result = [];
  for (const [productId, counts] of Object.entries(map)) {
    const product = findProductInCatalog(catalog, productId);
    if (!product) continue;
    if (categoryFilter && product.category !== categoryFilter) continue;

    const ctr = counts.views > 0 ? Math.round((counts.whatsapp_clicks / counts.views) * 100) : 0;
    result.push({
      product_id: productId,
      product_name: product.name,
      category: product.category,
      category_id: product.categoryId,
      impressions: counts.impressions,
      views: counts.views,
      whatsapp_clicks: counts.whatsapp_clicks,
      cart_adds: counts.cart_adds,
      orders: counts.orders,
      ctr,
      last_interaction: counts.last_interaction,
    });
  }

  // Ordena por visualizações decrescente
  result.sort((a, b) => b.views - a.views);
  return result;
}

function loadCatalogForStats() {
  try {
    const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'catalog-data.json'), 'utf8'));
    return data.categories || [];
  } catch {
    return [];
  }
}

function findProductInCatalog(categories, productId) {
  for (const cat of categories) {
    const p = (cat.products || []).find((x) => x.id === productId);
    if (p) return { name: p.name, category: cat.name, categoryId: cat.id };
  }
  return null;
}

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';
const ROOT = __dirname;
const OUT_DIR = path.join(ROOT, 'generated');
const DIST_DIR = path.join(ROOT, 'dist');
const ENGAGEMENT_FILE = path.join(ROOT, 'data', 'engagement.json');

// ── .env: credenciais do lojista (fora de qualquer bundle, bloqueado no HTTP) ──
const ENV_FILE = path.join(ROOT, '.env');

function parseEnvFile() {
  const env = {};
  if (!fs.existsSync(ENV_FILE)) return env;
  for (const line of fs.readFileSync(ENV_FILE, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
  return env;
}

function ensureEnv() {
  const env = parseEnvFile();
  let created = false;
  // fallback: variáveis de ambiente do processo (Render, containers) — arquivo .env tem prioridade
  if (!env.LOJISTA_USER && process.env.LOJISTA_USER) env.LOJISTA_USER = process.env.LOJISTA_USER;
  if (!env.LOJISTA_PASS && process.env.LOJISTA_PASS) env.LOJISTA_PASS = process.env.LOJISTA_PASS;
  if (!env.SESSION_SECRET && process.env.SESSION_SECRET) env.SESSION_SECRET = process.env.SESSION_SECRET;
  if (!env.LOJISTA_USER) { env.LOJISTA_USER = 'admin'; created = true; }
  if (!env.LOJISTA_PASS) { env.LOJISTA_PASS = '1234'; created = true; }
  if (!env.SESSION_SECRET) { env.SESSION_SECRET = crypto.randomBytes(32).toString('hex'); created = true; }
  if (created && process.env.RENDER) {
    console.error('[ENV] Credenciais ausentes no Render! Defina LOJISTA_USER, LOJISTA_PASS e SESSION_SECRET no painel.');
  } else if (created) {
    const content =
      Object.entries(env)
        .map(([k, v]) => `${k}=${v}`)
        .join('\n') + '\n';
    fs.writeFileSync(ENV_FILE, content, 'utf8');
    console.warn('[.env] criado com credenciais padrão (admin/1234) — TROQUE LOJISTA_PASS antes de publicar!');
  }
  return env;
}

const env = ensureEnv();

// ── Sessão via cookie assinado (HMAC-SHA256, sem dependências externas) ──
function sign(value) {
  return crypto.createHmac('sha256', env.SESSION_SECRET).update(String(value)).digest('hex');
}

// Comparação segura mesmo com tamanhos diferentes (hash antes do timingSafeEqual)
function safeEqual(a, b) {
  const ha = crypto.createHash('sha256').update(String(a ?? '')).digest();
  const hb = crypto.createHash('sha256').update(String(b ?? '')).digest();
  return crypto.timingSafeEqual(ha, hb);
}

function getSessionUser(req) {
  const header = req.headers.cookie || '';
  const m = header.match(/(?:^|;\s*)lojista=([^;]+)/);
  if (!m) return null;
  const dot = decodeURIComponent(m[1]).indexOf('.');
  if (dot < 0) return null;
  const raw = decodeURIComponent(m[1]);
  const user = raw.slice(0, dot);
  const sig = raw.slice(dot + 1);
  const expected = sign(user);
  if (sig.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  const prestadorUser = process.env.PRESTADOR_USER || parseEnvFile().PRESTADOR_USER || 'prestador';
  if (!safeEqual(user, env.LOJISTA_USER) && !safeEqual(user, prestadorUser)) return null;
  return user;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Tela de login (standalone, sem bundle do app) ──
// Estatísticas reais do catálogo para o readout do login (best-effort)
function catalogStats() {
  try {
    const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'catalog-data.json'), 'utf8'));
    const cats = Array.isArray(data.categories) ? data.categories : [];
    let total = 0;
    let active = 0;
    for (const c of cats) {
      const ps = Array.isArray(c.products) ? c.products : [];
      total += ps.length;
      active += ps.filter((p) => p && p.enabled !== false).length;
    }
    return { active, categories: cats.length, total };
  } catch {
    return null;
  }
}

function loginPage(error) {
  const stats = catalogStats();
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Entrar — Área do Lojista</title>
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%230a8754' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='4' y='11' width='16' height='10' rx='2'/%3E%3Cpath d='M8 11V7a4 4 0 0 1 8 0v4'/%3E%3C/svg%3E">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,100..900&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<style>
  :root {
    --sans: "Archivo", "Trebuchet MS", "Segoe UI", sans-serif;
    --mono: "IBM Plex Mono", "Consolas", monospace;
    --emerald: #0a8754;
    --emerald-deep: #04402a;
    --ink: #101413;
    --paper: #f5f7f6;
  }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body {
    font-family: var(--sans); color: var(--ink); background: var(--paper);
    -webkit-font-smoothing: antialiased;
  }
  .stage {
    display: grid;
    grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr);
    min-height: 100vh; min-height: 100dvh;
  }

  /* ── Painel da marca ── */
  .brand-panel {
    position: relative; overflow: hidden;
    display: flex; flex-direction: column; justify-content: space-between; gap: 34px;
    padding: clamp(30px, 4vw, 56px);
    padding-right: calc(clamp(30px, 4vw, 56px) + 34px);
    color: #fff;
    background:
      radial-gradient(120% 90% at 12% 8%, rgba(255,255,255,.15), transparent 55%),
      linear-gradient(158deg, #0b9a5f 0%, #077047 42%, var(--emerald-deep) 100%);
  }
  .brand-panel::before {
    content: ""; position: absolute; inset: 0;
    background-image:
      linear-gradient(rgba(255,255,255,.07) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,.07) 1px, transparent 1px);
    background-size: 46px 46px;
    -webkit-mask-image: radial-gradient(130% 100% at 25% 15%, #000 30%, transparent 90%);
    mask-image: radial-gradient(130% 100% at 25% 15%, #000 30%, transparent 90%);
  }
  .brand-panel::after {
    content: ""; position: absolute; inset: 0; pointer-events: none;
    opacity: .35; mix-blend-mode: overlay;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='grain'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23grain)'/%3E%3C/svg%3E");
  }
  .brand-top, .brand-core, .readout { position: relative; z-index: 1; }
  .brand-top { display: flex; align-items: center; gap: 10px; font-family: var(--mono); font-size: 11px; color: rgba(255,255,255,.88); }
  .brand-top .right { margin-left: auto; color: rgba(255,255,255,.85); }
  .led { width: 8px; height: 8px; border-radius: 50%; background: #7dffc2; animation: pulse 2.6s ease-out infinite; }
  @keyframes pulse {
    0% { box-shadow: 0 0 0 0 rgba(125,255,194,.55); }
    70% { box-shadow: 0 0 0 8px rgba(125,255,194,0); }
    100% { box-shadow: 0 0 0 0 rgba(125,255,194,0); }
  }
  .kicker { font-family: var(--mono); font-size: 11px; letter-spacing: .22em; color: rgba(255,255,255,.88); margin: 0 0 14px; }
  .display {
    margin: 0; font-weight: 800; font-stretch: 115%;
    font-size: clamp(2.7rem, 4.6vw, 4.4rem); line-height: .97; letter-spacing: -.025em;
  }
  .hollow { color: rgba(255,255,255,.3); }
  @supports (-webkit-text-stroke: 2px #fff) {
    .hollow { -webkit-text-stroke: 1.75px rgba(255,255,255,.92); color: transparent; }
  }
  .lede { max-width: 36ch; font-size: 14.5px; line-height: 1.6; color: rgba(255,255,255,.92); margin: 18px 0 0; }
  .readout { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; border-top: 1px solid rgba(255,255,255,.2); padding-top: 18px; }
  .readout .cell { display: flex; flex-direction: column; gap: 4px; }
  .readout .cell + .cell { border-left: 1px solid rgba(255,255,255,.16); padding-left: 16px; }
  .readout .num { font-weight: 750; font-size: 26px; letter-spacing: -.01em; font-variant-numeric: tabular-nums; }
  .readout .cap { font-family: var(--mono); font-size: 10.5px; color: rgba(255,255,255,.78); }
  .tape {
    position: absolute; z-index: 2; top: 0; right: 0; bottom: 0; width: 34px;
    display: flex; align-items: center; justify-content: center;
    writing-mode: vertical-rl; text-orientation: mixed;
    font-family: var(--mono); font-size: 10px; letter-spacing: .34em; color: rgba(255,255,255,.7);
    background: rgba(0,0,0,.14); border-left: 1px solid rgba(255,255,255,.14);
    user-select: none;
  }

  /* ── Painel do formulário ── */
  .form-panel {
    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px;
    padding: clamp(26px, 5vw, 48px);
    background: radial-gradient(90% 65% at 85% 0%, rgba(10,135,84,.08), transparent 60%), var(--paper);
  }
  .card {
    width: 100%; max-width: 386px; background: #fff;
    border: 1px solid #e6e9e8; border-radius: 18px; padding: 32px 30px 28px;
    box-shadow: 0 1px 2px rgba(16,24,20,.04), 0 22px 55px -20px rgba(4,64,42,.25);
    animation: rise .7s .08s cubic-bezier(.2,.7,.2,1) both;
  }
  .head { display: flex; align-items: center; gap: 13px; margin-bottom: 20px; }
  .seal {
    width: 40px; height: 40px; border-radius: 12px; flex: none;
    display: flex; align-items: center; justify-content: center;
    background: #e7f6ef; color: var(--emerald);
  }
  .head h2 { margin: 0; font-size: 19px; font-weight: 700; letter-spacing: -.01em; }
  .head .sub { margin: 2px 0 0; font-family: var(--mono); font-size: 11px; color: #6b7280; }
  .err {
    display: flex; align-items: center; gap: 8px; margin: 0 0 6px;
    background: #fdf1f1; border: 1px solid #f5cfcf; border-left: 3px solid #d64545;
    color: #a42626; border-radius: 9px; padding: 10px 12px; font-size: 12.5px;
    animation: shake .5s .7s cubic-bezier(.36,.07,.19,.97) both;
  }
  .err .dot { width: 6px; height: 6px; border-radius: 50%; background: #d64545; flex: none; }
  label { display: block; font-family: var(--mono); font-size: 11.5px; color: #52525b; margin: 15px 0 6px; }
  input {
    width: 100%; height: 45px; padding: 0 13px;
    border: 1px solid #d8dcdb; border-radius: 9px;
    font-family: var(--mono); font-size: 14px; color: #18181b; background: #fcfdfd;
    transition: border-color .18s, box-shadow .18s, background .18s;
  }
  input::placeholder { color: #9aa09d; }
  input:hover { border-color: #c2c8c6; }
  input:focus { outline: none; border-color: var(--emerald); background: #fff; box-shadow: 0 0 0 3px rgba(10,135,84,.15); }
  button {
    width: 100%; height: 47px; margin-top: 22px; border: 0; border-radius: 10px;
    background: var(--emerald); color: #fff; cursor: pointer;
    font-family: var(--sans); font-size: 14.5px; font-weight: 700; letter-spacing: .01em;
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    transition: background .18s, transform .18s, box-shadow .18s;
    box-shadow: 0 10px 22px -12px rgba(10,135,84,.8);
  }
  button:hover { background: #087346; transform: translateY(-1px); box-shadow: 0 14px 26px -12px rgba(10,135,84,.9); }
  button:active { transform: translateY(0); }
  button:disabled { opacity: .82; cursor: default; transform: none; box-shadow: none; }
  button:disabled:hover { background: var(--emerald); transform: none; box-shadow: none; }
  .arr { transition: transform .18s; }
  button:hover .arr { transform: translateX(4px); }
  .foot { text-align: center; font-family: var(--mono); font-size: 11.5px; line-height: 1.5; color: #52525b; margin: 14px 0 0; }
  .foot a { color: var(--emerald); text-decoration: none; display: inline-block; padding: 13px 18px; margin: 0 -18px; border-radius: 8px; transition: background .18s; }
  .foot a:hover { background: #eef7f2; text-decoration: none; }
  .legal { font-family: var(--mono); font-size: 10.5px; color: #6b7280; margin: 0; text-align: center; }
  a:focus-visible, button:focus-visible { outline: 2px solid var(--emerald); outline-offset: 2px; }

  /* ── Movimento: um único reveal orquestrado na carga ── */
  @keyframes rise { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }
  @keyframes shake {
    10%, 90% { transform: translateX(-2px); }
    20%, 80% { transform: translateX(3px); }
    30%, 50%, 70% { transform: translateX(-5px); }
    40%, 60% { transform: translateX(5px); }
  }
  .brand-top { animation: rise .7s .05s both; }
  .brand-core { animation: rise .7s .18s both; }
  .readout { animation: rise .7s .34s both; }
  .form-panel .legal { animation: rise .7s .3s both; }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { animation: none !important; transition: none !important; }
  }

  @media (max-width: 900px) {
    .stage { grid-template-columns: 1fr; }
    .brand-panel { gap: 26px; padding: 30px 26px 34px; }
    .tape { display: none; }
    .display { font-size: clamp(2.4rem, 11vw, 3.4rem); }
    .lede { font-size: 16px; }
    .readout { gap: 12px; }
    .readout .cell + .cell { padding-left: 12px; }
    .form-panel { padding: 32px 20px 44px; }
    input { font-size: 16px; }
  }
</style>
</head>
<body>
  <main class="stage">
    <section class="brand-panel">
      <div class="tape" aria-hidden="true">acesso restrito</div>
      <div class="brand-top">
        <span class="led" aria-hidden="true"></span>
        <span>sessão segura</span>
        <span class="right">manaus · am</span>
      </div>
      <div class="brand-core">
        <p class="kicker">catálogo centralizado · eletrônicos</p>
        <h1 class="display">Área do<br><span class="hollow">Lojista</span></h1>
        <p class="lede">Custos, margens e relatórios internos do catálogo — acesso exclusivo da loja.</p>
      </div>
      ${stats ? `<div class="readout" aria-label="Resumo do catálogo">
        <div class="cell"><span class="num">${stats.active}</span><span class="cap">produtos ativos</span></div>
        <div class="cell"><span class="num">${stats.categories}</span><span class="cap">categorias</span></div>
        <div class="cell"><span class="num">${stats.total}</span><span class="cap">itens no catálogo</span></div>
      </div>` : ''}
    </section>

    <section class="form-panel">
      <form class="card" method="post" action="/api/login">
        <div class="head">
          <div class="seal" aria-hidden="true">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>
          </div>
          <div>
            <h2>Entrar</h2>
            <p class="sub">área restrita · custos e margens</p>
          </div>
        </div>
        <label for="user">Usuário</label>
        <input id="user" name="user" type="text" autocomplete="username" required autofocus placeholder="seu usuário">
        <label for="pass">Senha</label>
        <input id="pass" name="pass" type="password" autocomplete="current-password" required placeholder="••••••••">
        ${error ? `<p class="err" role="alert"><span class="dot" aria-hidden="true"></span><span>${escapeHtml(error)} Verifique os dados e tente novamente.</span></p>` : ''}
        <button type="submit">Entrar <span class="arr" aria-hidden="true">→</span></button>
        <p class="foot"><a href="/">← voltar ao catálogo da loja</a></p>
      </form>
      <p class="legal">cookie httpOnly · sessão assinada · expira em 7 dias</p>
    </section>
  </main>
  <script>
    // Feedback de submit: desabilita o botão e mostra estado de carregamento
    document.querySelector('form').addEventListener('submit', function () {
      var b = this.querySelector('button[type="submit"]');
      b.disabled = true;
      b.textContent = 'Entrando…';
    });
  </script>
</body>
</html>`;
}

app.use(express.urlencoded({ extended: false }));

// ── Bloqueio de arquivos sensíveis (belt & suspenders; a raiz nem é servida) ──
app.use((req, res, next) => {
  const p = req.path;
  if (p === '/catalog-data.json' || p === '/.env' || p === '/plano.md' || p.startsWith('/interno')) {
    return res.status(404).send('Not found');
  }
  next();
});

// ── Rotas de autenticação ──
app.get('/lojista', (req, res) => {
  if (!getSessionUser(req)) return res.redirect('/entrar');
  const file = path.join(DIST_DIR, 'lojista.html');
  if (fs.existsSync(file)) return res.sendFile(file);
  res.status(503).send('Área do lojista não encontrada. Execute: npm run build');
});

app.get('/prestador', (req, res) => {
  if (!getSessionUser(req)) return res.redirect('/entrar');
  const file = path.join(DIST_DIR, 'lojista.html');
  if (fs.existsSync(file)) return res.sendFile(file);
  res.status(503).send('Área do prestador não encontrada. Execute: npm run build');
});

app.get('/entrar', (req, res) => {
  const user = getSessionUser(req);
  if (user) {
    const prestadorUser = process.env.PRESTADOR_USER || parseEnvFile().PRESTADOR_USER || 'prestador';
    const redirect = (user === prestadorUser) ? '/prestador' : '/lojista';
    return res.redirect(redirect);
  }
  res.type('html').send(loginPage());
});

app.post('/api/login', (req, res) => {
  const { user, pass } = req.body || {};
  const prestadorUser = process.env.PRESTADOR_USER || parseEnvFile().PRESTADOR_USER || 'prestador';
  const prestadorPass = process.env.PRESTADOR_PASS || parseEnvFile().PRESTADOR_PASS || '';
  
  let authenticatedUser = null;
  
  if (safeEqual(user, env.LOJISTA_USER) && safeEqual(pass, env.LOJISTA_PASS)) {
    authenticatedUser = env.LOJISTA_USER;
  } else if (safeEqual(user, prestadorUser) && safeEqual(pass, prestadorPass)) {
    authenticatedUser = prestadorUser;
  }
  
  if (authenticatedUser) {
    const token = `${authenticatedUser}.${sign(authenticatedUser)}`;
    res.cookie('lojista', token, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });
    const prestadorUser = process.env.PRESTADOR_USER || parseEnvFile().PRESTADOR_USER || 'prestador';
    const redirectTo = (authenticatedUser === prestadorUser) ? '/prestador' : '/lojista';
    return res.redirect(redirectTo);
  }
  res.status(401).type('html').send(loginPage('Usuário ou senha inválidos.'));
});

app.post('/api/logout', (req, res) => {
  res.clearCookie('lojista', { path: '/' });
  res.redirect('/');
});

// �� Identidade do usuário logado (role) ��
app.get('/api/me', (req, res) => {
  const user = getSessionUser(req);
  if (!user) return res.status(401).json({ error: 'Não autorizado' });
  // Role: se o usuário for o prestador (configurado via env), retorna 'prestador'
  const prestadorUser = process.env.PRESTADOR_USER || parseEnvFile().PRESTADOR_USER || 'prestador';
  const role = (user === prestadorUser) ? 'prestador' : 'lojista';
  return res.json({ user, role });
});

// ── Engajamento de produtos ──
app.use(express.json());

app.post('/api/engagement', async (req, res) => {
  try {
    const { product_id, event_type, session_id } = req.body || {};
    if (!product_id || !event_type) {
      return res.status(400).json({ error: 'product_id and event_type are required' });
    }
    await trackEngagementEvent({ productId: product_id, eventType: event_type, sessionId: session_id });
    return res.json({ ok: true });
  } catch (err) {
    console.error('[Engajamento] Erro no POST /api/engagement:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

app.get('/api/engagement/stats', async (req, res) => {
  try {
    const sessionUser = getSessionUser(req);
    console.log(`[Engajamento] GET /api/engagement/stats - usuário autenticado: ${sessionUser ? 'sim' : 'não'}`);

    // Apenas lojista autenticado pode ler estatísticas
    if (!sessionUser) {
      return res.status(401).json({ error: 'Não autorizado' });
    }
    const periodDays = parseInt(req.query.period || '30', 10);
    const category = req.query.category || null;
    const stats = await getEngagementStats({ periodDays, category });
    console.log(`[Engajamento] GET /api/engagement/stats retornando ${stats.length} produtos`);
    return res.json({ stats, periodDays });
  } catch (err) {
    console.error('[Engajamento] Erro no GET /api/engagement/stats:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// ── App cliente (público) ──
app.get('/', (req, res) => {
  const file = path.join(DIST_DIR, 'index.html');
  if (fs.existsSync(file)) return res.sendFile(file);
  res.status(503).send('App não encontrado. Execute: npm run build');
});

// ── Catálogo estático (o antigo "/") ──
app.get('/catalogo', (req, res) => {
  const file = path.join(OUT_DIR, 'catalogo-digital.html');
  if (fs.existsSync(file)) return res.sendFile(file);
  res.status(404).send('Catálogo não encontrado. Execute npm run generate.');
});

// ── APIs públicas (sempre as versões SEM custo) ──


app.get('/api/markdown', (req, res) => {
  const mdFile = path.join(OUT_DIR, 'catalogo-consolidado.md');
  if (fs.existsSync(mdFile)) {
    res.type('text/markdown');
    return res.sendFile(mdFile);
  }
  res.status(404).send('Markdown catalog not found');
});

const { execSync } = require('child_process');

app.post('/api/regenerate', async (req, res) => {
  try {
    const result = await runGenerator();
    // Rebuild do bundle para que a página cliente reflita as alterações do lojista
    try {
      execSync('npm run build', { cwd: ROOT, stdio: 'pipe' });
    } catch (buildErr) {
      console.error('[Regenerate] build falhou:', buildErr.message);
    }
    res.json({ success: true, message: 'Catálogo gerado e publicado com sucesso!', total: result?.total });
  } catch (err) {
    console.error('[Regenerate] erro:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Estáticos seletivos (NUNCA a raiz do projeto; *.html de dist só via rotas) ──
app.use('/assets', express.static(path.join(DIST_DIR, 'assets')));
app.use('/images', express.static(path.join(DIST_DIR, 'images')));
app.use('/images', express.static(path.join(ROOT, 'public', 'images')));
app.use(express.static(OUT_DIR));
app.use(express.static(path.join(ROOT, 'public')));

// �� APIs Admin (Supabase CRUD) ��
// Middleware: apenas lojista autenticado
function requireAuth(req, res, next) {
  const user = getSessionUser(req);
  if (!user) return res.status(401).json({ error: 'Não autorizado' });
  req.sessionUser = user;
  next();
}

// GET /api/admin/products — lista paginada + filtros
app.get('/api/admin/products', requireAuth, async (req, res) => {
  try {
    if (!supabaseEnabled || !supabase) return res.status(503).json({ error: 'Supabase não configurado' });
    const { category, status, search, page = 1, limit = 50 } = req.query;
    let query = supabase.from('products').select('*, categories(name)', { count: 'exact' });
    if (category) query = query.eq('category_id', category);
    if (status) query = query.eq('status', status);
    if (search) query = query.ilike('name', `%${search}%`);
    const offset = (parseInt(page) - 1) * parseInt(limit);
    query = query.range(offset, offset + parseInt(limit) - 1).order('created_at', { ascending: false });
    const { data, error, count } = await query;
    if (error) throw error;
    return res.json({ products: data || [], total: count || 0, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    console.error('[Admin] GET products:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/products/export — export CSV
app.get('/api/admin/products/export', requireAuth, async (req, res) => {
    try {
      if (!supabaseEnabled || !supabase) return res.status(503).json({ error: 'Supabase not configured' });
      const { data, error } = await supabase.from('products').select('id, code, name, category_id, cost, price, price_max, status, visible_to_client');
      if (error) throw error;
      const headers = ['id', 'code', 'name', 'category_id', 'cost', 'price', 'price_max', 'status', 'visible_to_client'];
      const csvRows = [headers.join(',')];
      for (const p of (data || [])) {
        csvRows.push(headers.map(h => {
          const v = p[h];
          if (v === null || v === undefined) return '';
          const s = String(v);
          return s.includes(',') ? '"' + s + '"' : s;
        }).join(','));
      }
      res.type('text/csv').set('Content-Disposition', 'attachment; filename="catalogo-export.csv"').send(csvRows.join('\n'));
    } catch (err) {
      console.error('[Admin] EXPORT:', err.message);
      return res.status(500).json({ error: err.message });
    }
  });

// GET /api/admin/products/:id — detalhe
app.get('/api/admin/products/:id', requireAuth, async (req, res) => {
  try {
    if (!supabaseEnabled || !supabase) return res.status(503).json({ error: 'Supabase não configurado' });
    const { data, error } = await supabase.from('products').select('*, categories(name)').eq('id', req.params.id).single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Produto não encontrado' });
    return res.json(data);
  } catch (err) {
    console.error('[Admin] GET product:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/products — criar
app.post('/api/admin/products', requireAuth, async (req, res) => {
  try {
    if (!supabaseEnabled || !supabase) return res.status(503).json({ error: 'Supabase não configurado' });
    const product = { ...req.body, updated_by: req.sessionUser };
    const { data, error } = await supabase.from('products').insert([product]).select().single();
    if (error) throw error;
    return res.status(201).json(data);
  } catch (err) {
    console.error('[Admin] POST product:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// PUT /api/admin/products/:id — atualizar
app.put('/api/admin/products/:id', requireAuth, async (req, res) => {
  try {
    if (!supabaseEnabled || !supabase) return res.status(503).json({ error: 'Supabase não configurado' });
    const updates = { ...req.body, updated_by: req.sessionUser, updated_at: new Date().toISOString() };
    const { data, error } = await supabase.from('products').update(updates).eq('id', req.params.id).select().single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Produto não encontrado' });
    return res.json(data);
  } catch (err) {
    console.error('[Admin] PUT product:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// DELETE /api/admin/products/:id - soft delete


// POST /api/admin/products/bulk — import CSV (bulk upsert)
app.post('/api/admin/products/bulk', requireAuth, async (req, res) => {
  try {
    if (!supabaseEnabled || !supabase) return res.status(503).json({ error: 'Supabase não configurado' });
    const { products } = req.body || {};
    if (!Array.isArray(products) || products.length === 0) return res.status(400).json({ error: 'products array required' });
    const rows = products.map(p => ({ ...p, updated_by: req.sessionUser }));
    const { data, error } = await supabase.from('products').upsert(rows, { onConflict: 'id' }).select();
    if (error) throw error;
    return res.json({ ok: true, count: data?.length || 0 });
  } catch (err) {
    console.error('[Admin] BULK import:', err.message);
    return res.status(500).json({ error: err.message });
  }
});


// GET /api/admin/categories — listar
app.get('/api/admin/categories', requireAuth, async (req, res) => {
  try {
    if (!supabaseEnabled || !supabase) return res.status(503).json({ error: 'Supabase não configurado' });
    const { data, error } = await supabase.from('categories').select('*').order('sort_order');
    if (error) throw error;
    return res.json({ categories: data || [] });
  } catch (err) {
    console.error('[Admin] GET categories:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/categories — criar
app.post('/api/admin/categories', requireAuth, async (req, res) => {
  try {
    if (!supabaseEnabled || !supabase) return res.status(503).json({ error: 'Supabase não configurado' });
    const { data, error } = await supabase.from('categories').insert([req.body]).select().single();
    if (error) throw error;
    return res.status(201).json(data);
  } catch (err) {
    console.error('[Admin] POST category:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// PUT /api/admin/categories/:id — atualizar
app.put('/api/admin/categories/:id', requireAuth, async (req, res) => {
  try {
    if (!supabaseEnabled || !supabase) return res.status(503).json({ error: 'Supabase não configurado' });
    const { data, error } = await supabase.from('categories').update(req.body).eq('id', req.params.id).select().single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Categoria não encontrada' });
    return res.json(data);
  } catch (err) {
    console.error('[Admin] PUT category:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// DELETE /api/admin/categories/:id — deletar
app.delete('/api/admin/categories/:id', requireAuth, async (req, res) => {
  try {
    if (!supabaseEnabled || !supabase) return res.status(503).json({ error: 'Supabase não configurado' });
    const { error } = await supabase.from('categories').delete().eq('id', req.params.id);
    if (error) throw error;
    return res.json({ ok: true });
  } catch (err) {
    console.error('[Admin] DELETE category:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/sync-whatsapp — placeholder (Fase 5)
app.post('/api/admin/sync-whatsapp', requireAuth, async (req, res) => {
  const { url, category_id } = req.body || {};
  if (!url) return res.status(400).json({ error: 'url required' });
  // TODO: Fase 5 — Playwright scraper + image downloader + catalog merger
  return res.json({ ok: true, message: 'Sync enfileirado (Fase 5 — em desenvolvimento)', url, category_id });
});

// GET /api/catalog — leitura pública (cliente) do Supabase
app.get('/api/catalog', async (req, res) => {
  try {
    if (supabaseEnabled && supabase) {
      const { data: cats, error: catErr } = await supabase.from('categories').select('*').order('sort_order');
      if (catErr) throw catErr;
      const { data: prods, error: prodErr } = await supabase.from('products').select('*').eq('status', 'active').eq('visible_to_client', true);
      if (prodErr) throw prodErr;
      // Agrupa produtos por categoria
      const catalog = (cats || []).map(c => ({
        id: c.id,
        name: c.name,
        products: (prods || []).filter(p => p.category_id === c.id).map(p => ({
          id: p.id,
          code: p.code,
          name: p.name,
          price: p.price,
          price_max: p.price_max,
          highlights: p.highlights,
          tags: p.tags,
          image_url: p.image_url,
        }))
      })).filter(c => c.products.length > 0);
      return res.json({ categories: catalog });
    }
    // Fallback: arquivo estático
    const jsonFile = path.join(OUT_DIR, 'catalog-api.json');
    if (fs.existsSync(jsonFile)) return res.sendFile(jsonFile);
    res.status(404).json({ error: 'Catalog data not found' });
  } catch (err) {
    console.error('[Catalog] GET:', err.message);
    // Fallback
    const jsonFile = path.join(OUT_DIR, 'catalog-api.json');
    if (fs.existsSync(jsonFile)) return res.sendFile(jsonFile);
    res.status(500).json({ error: err.message });
  }
});

// ── Startup ──
if (!fs.existsSync(path.join(OUT_DIR, 'catalogo-digital.html'))) {
  try {
    console.log('Gerando arquivos do catálogo inicial...');
    runGenerator();
  } catch (err) {
    console.error('Falha ao gerar catálogo na inicialização:', err.message);
  }
}

app.get('/api/admin/products/test', (req, res) => res.json({ ok: true }));
// DELETE /api/admin/products/:id - soft delete
app.delete('/api/admin/products/:id', requireAuth, async (req, res) => {
  try {
    if (!supabaseEnabled || !supabase) return res.status(503).json({ error: 'Supabase nao configurado' });
    const { data, error } = await supabase.from('products').update({ status: 'discontinued', updated_by: req.sessionUser, updated_at: new Date().toISOString() }).eq('id', req.params.id).select().single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Produto nao encontrado' });
    return res.json({ ok: true, product: data });
  } catch (err) {
    console.error('[Admin] DELETE product:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/temp-pdf - recebe PDF e faz upload para Supabase Storage, retorna URL pública
app.post('/api/temp-pdf', express.raw({ type: 'application/pdf', limit: '10mb' }), async (req, res) => {
  try {
    if (!supabaseEnabled || !supabase) return res.status(503).json({ error: 'Supabase não configurado' });
    const orderNo = req.query.orderNo || 'pedido-' + Date.now();
    const fileName = `pedidos/pedido-${orderNo}.pdf`;
    const buffer = Buffer.from(req.body);
    const { error: uploadErr } = await supabase.storage.from('pedidos').upload(fileName, buffer, {
      contentType: 'application/pdf',
      upsert: true,
    });
    if (uploadErr) throw uploadErr;
    const { data: urlData } = supabase.storage.from('pedidos').getPublicUrl(fileName);
    return res.json({ ok: true, url: urlData.publicUrl, fileName });
  } catch (err) {
    console.error('[Temp PDF] erro:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, HOST, () => {
  console.log(`Catálogo Centralizado rodando em http://${HOST}:${PORT}`);
  console.log(`  /         → app cliente (público)`);
  console.log(`  /catalogo → catálogo estático`);
  console.log(`  /entrar   → login do lojista (credenciais em .env)`);
});
