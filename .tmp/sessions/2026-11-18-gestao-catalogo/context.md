# Task Context: Gestão de Catálogo (Fase 3)

Session ID: 2026-11-18-gestao-catalogo
Created: 2026-11-18
Status: in_progress

## Current Request
Implementar interface de gestão de catálogo na área do Lojista — tabela de produtos com sort/filter/search, modal de criação/edição, soft delete, inline edit, import/export CSV, e botão de publicar.

## Context Files (Standards to Follow)
- src/app.ts (frontend principal, header, views)
- src/style.css (animações, estilos)
- server.cjs (API endpoints já implementados na Fase 1)
- src/types/supabase.ts (tipos gerados do Supabase)

## Reference Files (Source Material to Look At)
- src/app.ts (renderTableView, renderCatalogView, header rendering)
- server.cjs (endpoints /api/admin/products, /api/admin/categories)
- supabase/migrations/20261118132420_create_catalog_schema.sql (schema)
- catalog-data.json (estrutura de dados original)
- package.json (dependências)

## External Docs Fetched
N/A — frontend work uses existing patterns from src/app.ts

## Components
1. DataTable na aba "Vitrine" — sort, filter, search, paginação
2. Modal de Produto — drawer/modal com abas (Geral, Comercial, Estoque, Mídia)
3. Inline Edit — click na célula → input direto + Enter salva
4. Soft Delete — botão 🗑️ com confirmação
5. Import CSV — upload → parse → bulk insert via API
6. Export CSV — download via endpoint
7. Botão Publicar — dispara generator + build

## Constraints
- Lojista inherits client card-style buttons (não o contrário)
- Manter class `nav-tab` nos botões de navegação (listener em src/app.ts:~1890)
- Botões agrupados à direita (justify-end ml-auto)
- Auth via cookie (getSessionUser) — endpoints já protegidos
- Supabase como fonte de dados (não SQLite)
- RBAC: Lojista pode editar individualmente; Prestador faz bulk (Fase 4)

## Exit Criteria
- [ ] DataTable funcional com sort/filter/search/paginação
- [ ] Modal de criação/edição de produto funcional
- [ ] Soft delete com confirmação
- [ ] Inline edit de preço/custo/nome
- [ ] Import CSV funcional
- [ ] Export CSV funcional
- [ ] Botão Publicar funcional
- [ ] npm run build ✓
- [ ] npx tsc --noEmit ✓
"