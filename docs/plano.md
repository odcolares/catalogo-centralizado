# Plano: Base White-Label + 3 Temas de Nicho

**Projeto:** Catalogo Centralizado  
**Status:** Planejado (não iniciado)  
**Versão:** 1.0  
**Data:** 11/11/2026

---

## 1. Objetivo

Transformar o catálogo atual em uma **base white-label configurável** com **3 presets por nicho** (Loja, Estética e Lanches), mantendo o diferencial "catálogo digital + pedido no WhatsApp", com entrega rápida por cliente e manutenção centralizada.

## 2. Diagnóstico (Estado Atual)

| Item | Status | Observação |
|------|--------|------------|
| Núcleo (catálogo, carrinho, WhatsApp, painel lojista) | ✅ Pronto | Reaproveitável 100% |
| Engajamento/relatórios | ✅ Pronto | Funciona bem como métrica de interesse |
| Branding hardcoded | ⚠️ Parcial | Cores, textos e elementos fixos no código |
| Configuração por cliente | ⚠️ Parcial | Depende de editar arquivos (`catalog-data.json`, `.env`) |
| Temas por nicho | ❌ Ausente | Precisa ser estruturado |

## 3. Arquitetura Proposta

### A) Configuração Central (`site-config`)
Arquivo único por instância: `site-config.json` (ou variáveis de ambiente). Exemplo:

```json
{
  "theme": "loja",
  "brand": { 
    "name": "Loja Exemplo", 
    "logo": "/images/logo.png", 
    "colors": { "primary": "#0a8754", "accent": "#25D366" } 
  },
  "store": { 
    "city": "Manaus/AM", 
    "whatsapp": "5592...", 
    "delivery": "Motoboy", 
    "warranty": "...", 
    "payment": "PIX/Dinheiro" 
  },
  "copy": { 
    "heroTitle": "...", 
    "ctaCart": "Adicionar ao carrinho", 
    "ctaWhatsApp": "Pedir no WhatsApp" 
  },
  "features": { 
    "showMargins": true, 
    "enableEngagement": true 
  }
}
```

### B) Sistema de Temas
- **Design tokens**: migrar cores fixas para CSS variables (`--color-primary`, `--color-accent`, etc.) controladas pelo tema.
- **Temas/presets**: pasta `themes/` com `loja.json`, `estetica.json`, `lanches.json` contendo tokens, copy e sugestões de catálogo.
- **Carregamento dinâmico**: aplicar tema no `renderApp()` com base na config.

### C) Catálogo Flexível
- Manter `catalog-data.json` como fonte, mas permitir campos opcionais por nicho (`duration`, `addons`, `priceFrom`, `serves`, etc.) sem quebrar o core.
- Criar **catálogos de exemplo** por preset para acelerar onboarding.

---

## 4. Estrutura de Pastas Proposta

```text
/
├── config/
│   ├── site-config.json        # Config atual/da instância
│   └── themes/
│       ├── loja.json
│       ├── estetica.json
│       └── lanches.json
├── public/
│   └── images/                 # Logos por cliente/preset
├── src/
│   ├── config/                 # Loader de config/tema
│   ├── styles/tokens.css       # CSS variables
│   └── app.ts                  # Consome config/tema
└── catalog-examples/
    ├── loja/
    ├── estetica/
    └── lanches/
```

---

## 5. Plano por Fases

| Fase | Ação | Prioridade | Status |
|------|------|------------|--------|
| **Fase 0: Mapeamento** | Inventariar textos hardcoded, cores, classes e CTAs no `app.ts`/`style.css`. Listar tudo que precisa virar config. | Alta | Planejado |
| **Fase 1: Infra de Configuração** | Criar `site-config.json`, loader no frontend, fallback para valores atuais. Não quebrar funcionamento existente. | Alta | Planejado |
| **Fase 2: Temas + Design Tokens** | Migrar para CSS variables, criar estrutura `themes/`, aplicar tokens dinamicamente. | Alta | Planejado |
| **Fase 3: Presets por Nicho** | Criar `themes/loja.json`, `themes/estetica.json`, `themes/lanches.json` + `catalog-examples/` para cada um. Ajustar copy/CTAs por nicho. | Alta | Planejado |
| **Fase 4: Ajustes de UX por Nicho** | Ajustes pontuais: cardápio (adicionais/observações) p/ Lanches, "a partir de" p/ Estética, ênfase em produtos p/ Loja. Manter sempre "pedir no WhatsApp". | Média-Alta | Planejado |
| **Fase 5: Demos + Documentação** | Criar 3 demos prontos, checklist de onboarding, instruções de deploy por cliente. | Média-Alta | Planejado |
| **Fase 6: Validação com Cliente Real** | Testar com 1 negócio por nicho, coletar feedback e ajustar apenas o necessário. | Média | Planejado |

---

## 6. Critérios de Sucesso

- **Replicação rápida:** configurar novo cliente em < 30 min (branding + catálogo + WhatsApp)
- **Sem duplicação de lógica:** 1 base, 3 temas. Zero necessidade de forkar regras de negócio
- **Experiência diferenciada:** cada demo tem identidade própria, mas mesmo fluxo
- **Estável:** não quebrar funcionalidades existentes (carrinho, WhatsApp, lojista, engajamento)
- **Vendas facilitadas:** conseguir mostrar os 3 demos e adaptar para o cliente em tempo real

## 7. Próximos Passos Imediatos

1. **Inventariar** hardcoded (cores/textos/CTAs) — mapear em lista
2. **Criar `site-config.json` + loader** e migrar valores atuais sem alterar comportamento
3. **Criar `tokens.css`** com CSS variables e aplicar na base
4. **Montar os 3 presets** (primeiro **Loja** para validar, depois **Estética** e **Lanches**)
5. **Testar os 3 demos localmente** e só então validar com cliente

## 8. Recomendação

**Não criar 3 projetos separados. Criar 1 base white-label + presets.**  
É mais barato de manter, mais fácil de evoluir e escala muito melhor. Começar pela **Fase 0 → Fase 2** (config + temas) primeiro, pois são os pilares que viabilizam os 3 nichos sem tocar na lógica de negócio que já funciona bem.

---

## 9. Histórico

| Versão | Data | Descrição |
|--------|------|-----------|
| 1.0 | 11/11/2026 | Plano inicial criado com base na conversa sobre white-label + 3 temas de nicho |
