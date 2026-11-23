# Task Context: RBAC Híbrido (Fase 4)

Session ID: 2026-11-18-rbac
Created: 2026-11-18
Status: in_progress

## Current Request
Implementar controle de acesso por role (Lojista vs Prestador) — RLS no Supabase + UI condicional.

## Context Files (Standards to Follow)
- src/app.ts (frontend principal)
- server.cjs (API endpoints, auth)
- src/types/supabase.ts (tipos gerados)

## Reference Files (Source Material to Look At)
- supabase/migrations/20261118132420_create_catalog_schema.sql (schema + RLS existentes)
- .env (credenciais)

## Components
1. RLS Policies — políticas no Supabase por role
2. UI Condicional — botões de massa só para prestador
3. Role detection — detectar role do usuário logado

## Constraints
- Lojista: CRUD individual, categorias, CSV import/export, publicar
- Prestador: tudo + sync WB, bulk, otimização, relatórios
- Auth via cookie (getSessionUser) no server.cjs
- Supabase service role key bypasses RLS (backend usa service role)

## Exit Criteria
- [ ] RLS policies aplicadas no Supabase
- [ ] UI condicional funcional (botões de massa só para prestador)
- [ ] Role detection implementado
- [ ] npm run build ✓
- [ ] npx tsc --noEmit ✓
"