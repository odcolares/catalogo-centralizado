# Plano — Duas versões do catálogo: Cliente (`/`) × Lojista (`/lojista` com login)

> Plano aprovado para futura execução. Criado em 05/11/2026.
> Contexto: e-commerce de eletrônicos em Manaus (Vite + TS + gerador estático `generator.cjs` + servidor `server.cjs`).

## Objetivo

O app atual mistura info de cliente (produtos, categorias, carrinho) com info de lojista (custo, lucro, margem) atrás de um botão que qualquer visitante clica. Criar **dois links**:

```
PRODUÇÃO (node server.cjs)                 DEV (npm run dev)
────────────────────────────               ─────────────────────
/          → app cliente (público)         /             → app cliente
/lojista   → exige login → app lojista    /lojista.html → app lojista (sem login, só local)
/entrar    → tela de login (user + senha)
/catalogo  → catálogo estático (o antigo `/`)
bloqueado: /catalog-data.json, /.env, /server.cjs, /src/*, /vite.config.*, /interno/*
```

## Decisões aprovadas (com o usuário)

| Tema | Decisão |
|---|---|
| Front do cliente em produção | App com carrinho no `/`; catálogo estático vira `/catalogo` |
| Proteção da área lojista | **Login + senha somente na versão lojista**, validado no servidor |
| Credenciais | **`.env` no servidor** (`LOJISTA_USER`, `LOJISTA_PASS`, `SESSION_SECRET`) — fora de qualquer bundle, fora do git |
| Bundle | **Duas páginas separadas (MPA)** — bundle do cliente **sem nenhum valor de custo** |
| Arquivos JSON/MD | **2 versões**: pública limpa (sem custo) + interna completa em `interno/` (fora do HTTP) |
| Deploy | Pelo `server.cjs` (express) |
| Teste em dev | **Bypass no dev** (Vite serve as duas entries sem login); login real testado no modo produção (`npm run build` + `node server.cjs`) |
| Escopo do lojista | Tudo que é custo/margem: abas Tabela & Margens, Markdown, API com cost, CSV, caixa nos cards, ordenação por margem, **resumo financeiro no topo**, botão toggle só no header do lojista |

## Diagnóstico — vazamentos atuais (o que o plano fecha)

| Superfície | Problema |
|---|---|
| Botão "📈 Modo Lojista" no header | qualquer visitante clica |
| Aba Tabela & Margens / Markdown / API JSON / CSV | sempre visíveis, com custo |
| **`catalog-data.json`** servido por `express.static(__dirname)` | **fonte inteira com todos os custos** |
| `catalogo-consolidado.md` (raiz) e `public/catalog-api.json` | colunas/campo de custo |
| `server.cjs`, `/src/*`, `vite.config.*` | servidos por `express.static(__dirname)` (raiz inteira é estática) |
| `public/catalog-data.json` → copiado para `dist/` a cada build | fonte com custos no deploy estático |

---

## Fase 1 — Duas páginas no Vite (refactor do `src/main.ts`)

1. **`src/main.ts` → `src/app.ts`** (módulo compartilhado):
   - `const catalog = catalogDataRaw as CatalogData` → vira `let catalog` com placeholder vazio (store com strings vazias, `categories: []`)
   - Remover `import catalogDataRaw from '../catalog-data.json'` e `import './style.css'` fica em `app.ts` (compartilhado)
   - `allTags` e `totalProducts` (module-level) → calculados **dentro** de `initApp`
   - Exportar **`initApp(data: CatalogData, perfil: 'cliente' | 'lojista'): void`** que injeta o catálogo, define o perfil e chama `renderApp()`
   - Exportar tipos `CatalogData`, `Store`, `Category`, `Product`
2. **`src/main.ts` novo** (entry cliente — `index.html` continua apontando para `/src/main.ts`):
   ```ts
   import app styles via './app'
   import data from '../catalog-public.json';
   import { initApp } from './app';
   initApp(data as CatalogData, 'cliente');
   ```
3. **`src/lojista.ts`** (entry lojista): idem, mas `import data from '../catalog-data.json'` + `initApp(data, 'lojista')`
4. **`lojista.html`** na raiz (cópia do formato do `index.html`, script → `/src/lojista.ts`, `id="app"`)
5. **`vite.config.ts`**: `build.rollupOptions.input = { main: 'index.html', lojista: 'lojista.html' }`
6. **`interface Product`**: `cost: number` → **`cost?: number`** + guards `?? 0` em todos os cálculos (tabela, markdown, CSV, margem, resumo) — hoje eles só rodam no perfil lojista
7. **`package.json`**: scripts **`predev`** e **`prebuild`** executando `node generator.cjs` (garante `catalog-public.json` antes de dev/build)

> Garantia central: o JSON importado pelo entry cliente **não tem campo `cost`** → nenhum valor de custo existe no bundle do cliente. (O código de exibição é compartilhado, mas nunca roda e não há dados a expor.)

## Fase 2 — Portões de UI (perfil no app)

Estado: `let perfil: 'cliente' | 'lojista'` (definido no `initApp`). **Sem UI de PIN** — o gate é o servidor.

| Elemento | Cliente | Lojista |
|---|---|---|
| Abas | `📱 Catálogo` + `🔌 API JSON` | + `📊 Tabela & Margens` + `📄 Markdown` |
| API JSON (aba) | sem campo `cost` | com `cost` (+ lucro/margem) |
| Caixa Custo/Lucro/Margem nos cards | ❌ | ✅ (toggle `📈/👁️` no header) |
| Ordenação "Maior Margem %" | ❌ | ✅ |
| Copiar CSV (aba tabela) | ❌ | ✅ |
| **Resumo financeiro no topo** — 4 cards logo abaixo da nav: custo total (1un), venda total (1un), lucro potencial, margem média | ❌ | ✅ |
| Header | 🛒 carrinho + Atendimento WhatsApp | + pill `🟢 MODO LOJISTA` + botão `🔒 Sair` (POST `/api/logout` → redirect `/`) |
| Carrinho / pedido WhatsApp / PDF | ✅ inalterado | ✅ (nunca tiveram custo) |

- `showCostMargins` só é alternável quando `perfil === 'lojista'` (o botão nem é renderizado para o cliente)
- `renderTabContent()` e a lista de nav-tabs filtram por perfil

## Fase 3 — Artefatos em 2 versões (`generator.cjs`)

**Públicos** (escritas em `generated/` + `public/`):
- `catalog-api.json` → **gerado sem `cost`**
- `catalogo-consolidado.md` → **sem colunas Custo/Margem** (Modelo | Código | Preço de Venda | Destaques)
- `catalogo-digital.html` → já está limpo (não muda)

**Novo:**
- **`catalog-public.json`** (raiz): mesma forma de `catalog-data.json` (store + categories) **menos `cost`** de cada produto → é o que o entry cliente importa
- **`interno/`** (raiz): `catalog-api.json` + `catalogo-consolidado.md` **completos com custo** — pasta fora do alcance do HTTP (a raiz deixa de ser servida)

**Remoções:**
- Parar de copiar `catalog-data.json` para `public/` + apagar `public/catalog-data.json` existente (some do `dist/` no próximo build)
- Apagar o `catalogo-consolidado.md` velho da raiz (tem custo e hoje é servido)
- Verificar se existe `catalog-api.json` na raiz e apagar também

## Fase 4 — Login + rotas no `server.cjs`

1. **REMOVER `express.static(__dirname)`** (raiz inteira hoje é servida — é por aqui que vazam `catalog-data.json`, `server.cjs`, `/src/*`, `vite.config.*`)
2. **`.env`**: parser manual (~6 linhas, sem dependência) lendo `LOJISTA_USER`, `LOJISTA_PASS`, `SESSION_SECRET` — se ausente, **criar com `admin`/`1234` + secret aleatório** e avisar no console para trocar
3. **Rotas:**
   - `GET /` → `dist/index.html` (app cliente, público)
   - `GET /lojista` → `requireAuth` → `dist/lojista.html` senão **302 `/entrar`**
   - `GET /entrar` → tela de login HTML mínimo (form POST, cor da marca `#0a8754`; se já autenticado → redirect `/lojista`)
   - `POST /api/login` → valida credenciais (comparação `timingSafeEqual`) → cookie **HttpOnly, SameSite=Lax, 7 dias** assinado com HMAC-SHA256 via `crypto` nativo (**zero dependências novas**) → 302 `/lojista`; falha → tela de login com erro
   - `POST /api/logout` → limpa cookie → 302 `/`
4. **Estáticos seletivos** (antes dos estáticos, deny-list):
   - Bloquear: `/.env`, `/interno/*`, qualquer `*.html` de `dist/` servido direto (senão `/lojista.html` burla o login)
   - Servir: `/assets` → `dist/assets`, `/images` → `dist/images` e `public/images`, `/` (gerados) → `generated/`, `public/`
   - `/catalogo` → `generated/catalogo-digital.html`
   - `GET /catalog-api.json` continua público (versão limpa, vem de `generated/`/`public/`)
5. **Dev bypass** (como aprovado): `npm run dev` → Vite serve `/` e `/lojista.html` direto, sem login. Login real só testado com `npm run build && node server.cjs`

## Fase 5 — `.env` e git

- Adicionar **`.env`** ao `.gitignore` (senha não vai pro repositório)
- Decidir se `interno/` entra no git (contém custos — o repositório já contém `catalog-data.json`, então é consistente; pode deixar de fora)

## Fase 6 — Validação (executar ao final)

```powershell
npx tsc --noEmit
npm run build          # deve gerar dist/index.html + dist/lojista.html + dist/assets/*
node generator.cjs     # deve gerar catalog-public.json (sem cost) + interno/ (com cost)
```

Smoke test do servidor (script temporário, padrão já usado no projeto):

- `GET /` → 200 (app cliente)
- `GET /lojista` sem cookie → **302 `/entrar`**
- `POST /api/login` senha errada → erro na tela; senha certa → cookie → `GET /lojista` → **200**
- `GET /catalogo` → 200 (catálogo estático)
- `GET /catalog-data.json`, `/.env`, `/server.cjs`, `/src/main.ts`, `/interno/...` → **404**
- `GET /catalog-api.json` → 200 **sem campo `cost`**
- `generated/catalogo-consolidado.md` → sem "Custo"/"Margem"
- Bundle do cliente: nenhum valor de custo (grep por um valor de custo conhecido do JSON em `dist/assets/*.js` do entry cliente → 0 ocorrências)
- HTML público (`/catalogo`) → 21 produtos, 22 labels, intacto

---

## Arquivos relevantes

| Arquivo | Ação |
|---|---|
| `src/main.ts` | refatorar → `src/app.ts` + novo entry cliente fino |
| `src/lojista.ts` | **novo** (entry lojista) |
| `lojista.html` | **novo** (entry HTML) |
| `index.html` | mantido (aponta p/ `/src/main.ts`) |
| `vite.config.ts` | `rollupOptions.input` com 2 entries |
| `src/style.css` | inalterado (impressão/drawer já prontos) |
| `generator.cjs` | api/md públicos sem cost + `catalog-public.json` + `interno/` + parar de copiar `catalog-data.json` |
| `server.cjs` | remover static da raiz, rotas de login, `.env`, deny-list, `/catalogo` |
| `package.json` | scripts `predev`/`prebuild` |
| `.gitignore` | adicionar `.env` |
| `catalog-public.json` | **gerado** (não editar à mão) |
| `.env` | **gerado** no primeiro run do server |

## Fora de escopo / não mexer

- Carrinho, drawer, pedido WhatsApp, PDF (`@media print`) — já implementados e validados, inalterados
- `scripts/fetch-images.cjs` (scraper de imagens) — intocado
- HTML estático continua com "Pedir no WhatsApp" direto (decisão anterior)
- Número do WhatsApp: `559285617019` · label: `public/images/whatsapp-label.jpg`

## Riscos e notas

- **Refactor do `main.ts` (~1500 linhas) é a parte mais delicada** — mover para `app.ts` + injetar `catalog` via `initApp`; rodar `tsc` cedo e frequentemente
- JSON importado com `resolveJsonModule` já está habilito hoje (o app já importa `catalog-data.json`)
- Cookie de sessão em memória/HMAC sobrevive a restart do servidor (HMAC não guarda estado); se usar token em memória, restart = logout
- Senha padrão `admin/1234` + aviso no console — **trocar antes de publicar**
- `node server.cjs` em produção precisa de `dist/` buildado (`npm run build` antes)
