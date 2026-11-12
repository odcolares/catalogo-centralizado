# Documentação do Projeto

Diretório único para todos os arquivos `.md` (docs, planos, negócios, pesquisa de mercado e manuais) do projeto **Catálogo Centralizado**.

Os arquivos foram agrupados por tema para facilitar a leitura e manutenção. Arquivos técnicos gerados (ex.: `catalogo-consolidado.md` em `generated/`, `public/` e `interno/`) e arquivos de categoria (`Categoria/`) permanecem em seus locais originais e **não estão aqui**.

---

## 📚 Índice por Tema

### 🏗️ Produto / Técnico / Estrutura
- [`plano.md`](./plano.md) — Plano de desenvolvimento/base white-label + 3 temas de nicho
- [`Conceito.md`](./Conceito.md) — Conceito inicial do projeto
- [`historico-e-estado-projeto.md`](./historico-e-estado-projeto.md) — Histórico e estado atual do projeto
- [`dados-tabulares.md`](./dados-tabulares.md) — Dados tabulares de referência
- [`automacao-ia-config-nativa.md`](./automacao-ia-config-nativa.md) — Configuração de automação com IA nativa
- [`CREDENCIAIS-DEPLOY.md`](./CREDENCIAS-DEPLOY.md) — Credenciais e deploy (Render/Supabase)

### 💼 Negócio / Vendas
- [`PLANO-NEGOCIOS-CLIENTE-VENDA.md`](./PLANO-NEGOCIOS-CLIENTE-VENDA.md) — Plano de negócios para venda do projeto ao cliente final
- [`plano-negocios.md`](./plano-negocios.md) — Plano de negócios
- [`PITCH-APRESENTACAO-COMERCIAL.md`](./PITCH-APRESENTACAO-COMERCIAL.md) — Página/apresentação comercial (pitch) com proposta de valor
- [`MANUAL-FUNCIONALIDADES-VENDA.md`](./MANUAL-FUNCIONALIDADES-VENDA.md) — Manual de funcionalidades (visual, para venda)
- [`MANUAL-DETALHADO-SUPORTE-CLIENTE.md`](./MANUAL-DETALHADO-SUPORTE-CLIENTE.md) — Manual detalhado de funcionalidades e suporte ao cliente

### 📊 Mercado / Operação / Pesquisa
- [`resumo-executivo.md`](./resumo-executivo.md) — Resumo executivo
- [`mapa-oportunidades.md`](./mapa-oportunidades.md) — Mapa de oportunidades
- [`estudo-cenarios-ecommerce-manaus.md`](./estudo-cenarios-ecommerce-manaus.md) — Estudo de cenários e-commerce Manaus
- [`Análise de Mercado Real Eletrônicos em Manaus AM.md`](./Análise de Mercado Real Eletrônicos em Manaus AM.md) — Análise de mercado real
- [`templates-anuncios-scripts.md`](./templates-anuncios-scripts.md) — Templates de anúncios e scripts
- [`resposta-automatica-marketplaces.md`](./resposta-automatica-marketplaces.md) — Resposta automática a marketplaces
- [`tidio-manychat-guia.md`](./tidio-manychat-guia.md) — Guia Tidio/Manychat

---

## ⚠️ Observações

- Nenhum desses arquivos é consultado pelo código-fonte da aplicação (`src/`, `server.cjs`, `generator.cjs`, `vite.config.ts`). São arquivos de documentação e negócio apenas.
- A rota `/plano.md` permanece bloqueada no servidor (guardrail existente em `server.cjs`); a mudança de local físico não afeta essa regra.
- Para adicionar um novo documento deste tipo, coloque-o neste diretório `docs/` e atualize este `README.md` se fizer sentido agrupá-lo.
