'use strict';

const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { main: runGenerator } = require('./generator.cjs');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';
const ROOT = __dirname;
const OUT_DIR = path.join(ROOT, 'generated');
const DIST_DIR = path.join(ROOT, 'dist');

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
  if (!env.LOJISTA_USER) { env.LOJISTA_USER = 'admin'; created = true; }
  if (!env.LOJISTA_PASS) { env.LOJISTA_PASS = '1234'; created = true; }
  if (!env.SESSION_SECRET) { env.SESSION_SECRET = crypto.randomBytes(32).toString('hex'); created = true; }
  if (created) {
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
  if (!safeEqual(user, env.LOJISTA_USER)) return null;
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

app.get('/entrar', (req, res) => {
  if (getSessionUser(req)) return res.redirect('/lojista');
  res.type('html').send(loginPage());
});

app.post('/api/login', (req, res) => {
  const { user, pass } = req.body || {};
  if (safeEqual(user, env.LOJISTA_USER) && safeEqual(pass, env.LOJISTA_PASS)) {
    const token = `${env.LOJISTA_USER}.${sign(env.LOJISTA_USER)}`;
    res.cookie('lojista', token, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });
    return res.redirect('/lojista');
  }
  res.status(401).type('html').send(loginPage('Usuário ou senha inválidos.'));
});

app.post('/api/logout', (req, res) => {
  res.clearCookie('lojista', { path: '/' });
  res.redirect('/');
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
app.get('/api/catalog', (req, res) => {
  const jsonFile = path.join(OUT_DIR, 'catalog-api.json');
  if (fs.existsSync(jsonFile)) return res.sendFile(jsonFile);
  res.status(404).json({ error: 'Catalog data not found' });
});

app.get('/api/markdown', (req, res) => {
  const mdFile = path.join(OUT_DIR, 'catalogo-consolidado.md');
  if (fs.existsSync(mdFile)) {
    res.type('text/markdown');
    return res.sendFile(mdFile);
  }
  res.status(404).send('Markdown catalog not found');
});

app.post('/api/regenerate', async (req, res) => {
  try {
    const result = await runGenerator();
    res.json({ success: true, message: 'Catálogo gerado com sucesso!', total: result.total });
  } catch (err) {
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

// ── Startup ──
if (!fs.existsSync(path.join(OUT_DIR, 'catalogo-digital.html'))) {
  try {
    console.log('Gerando arquivos do catálogo inicial...');
    runGenerator();
  } catch (err) {
    console.error('Falha ao gerar catálogo na inicialização:', err.message);
  }
}

app.listen(PORT, HOST, () => {
  console.log(`Catálogo Centralizado rodando em http://${HOST}:${PORT}`);
  console.log(`  /         → app cliente (público)`);
  console.log(`  /catalogo → catálogo estático`);
  console.log(`  /entrar   → login do lojista (credenciais em .env)`);
});
