# Task Context: Perfil Prestador — UI Própria + 3 Funcionalidades

Session ID: 2026-11-24-prestador-ui
Created: 2026-11-24
Status: in_progress

## Current Request
Implementar UI própria para o perfil Prestador (diferenciada do Cliente) + 3 funcionalidades:
1. Bulk Import (CSV massa)
2. Relatórios de engajamento
3. Sync WhatsApp Business (simples — chama endpoint placeholder)

## Context Files (Standards to Follow)
- .tmp/sessions/2026-11-18-gestao-catalogo/context.md (padrão de estrutura de sessão)
- src/app.ts (frontend principal, header, views, renderTabContent)
- server.cjs (API endpoints já implementados: bulk import, sync-whatsapp, engagement/stats)
- src/types/supabase.ts (tipos gerados do Supabase)
- .env (credenciais demo: lojista@demo, prestador@demo)

## Reference Files (Source Material to Look At)
- src/app.ts lines 658-720 (header rendering com condicional perfil === 'lojista' / else)
- src/app.ts lines 745-756 (renderTabContent — apenas perfil === 'lojista' mostra DataTable)
- src/app.ts lines 2417-2425 (logout handler)
- server.cjs lines 770-783 (POST /api/admin/products/bulk)
- server.cjs lines 839-845 (POST /api/admin/sync-whatsapp placeholder)
- server.cjs lines 605-610 (GET /api/engagement/stats)
- .tmp/sessions/2026-11-18-rbac/context.md (contexto RBAC híbrido)

## External Docs Fetched
N/A — usa endpoints existentes e padrões de src/app.ts

## Components
1. Header Prestador — badge, abas próprias (Gestão / Sync / Relatórios), botão Sair
2. Aba Gestão — container vazio p/ futuro (bulk import UI aqui)
3. Aba Sync WhatsApp — input URL + categoria + botão sincronizar
4. Aba Relatórios — filtro período/categoria, tabela produtos mais engajados
5. Bulk Import UI — upload CSV, preview, mapeamento colunas, execução via API
6. Relatórios UI — chama GET /api/engagement/stats, exibe dados

## Constraints
- Apenas prestador acessa abas Gestão/Sync/Relatórios
- Lojista mantém abas Vitrine/Tabela/Engajamento (inalterado)
- Cliente mantém botões Entrega/Garantia/Pagamento/Carrinho/WhatsApp (inalterado)
- Endpoints já existem no backend (requireAuth protege todos)
- Auth via cookie (getSessionUser aceita lojista e prestador)
- Endpoint /api/admin/products/bulk aceita array de produtos (upsert por id)
- Endpoint /api/admin/sync-whatsapp é placeholder (Fase 5 completa depois)
- Endpoint /api/engagement/stats já retorna dados de engajamento

## Exit Criteria
- [ ] Prestador vê UI própria (não igual ao cliente)
- [ ] Badge 👤 Prestador + botão Sair no header do prestador
- [ ] Abas: Gestão / Sync WhatsApp / Relatórios para prestador
- [ ] Bulk Import: upload CSV → preview → execução → feedback
- [ ] Relatórios: filtro período → tabela produtos mais engajados
- [ ] Sync WB simples: URL + categoria → chama endpoint placeholder
- [ ] npm run build ✓
- [ ] npx tsc --noEmit ✓