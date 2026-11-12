# Automação com IA + Configuração Nativa — Guia Prático

> Objetivo: resolver o problema de resposta lenta no WhatsApp/FB/OLX usando configuração nativa + automação com IA.
> Escopo: Manaus/AM, marketplace local, produtos eletrônicos/importados.

---

## 1. CONFIGURAÇÃO NATIVA (sem IA, só ajustes das ferramentas)

### 1.1 WhatsApp Business — O que já vem de fábrica

O WhatsApp Business tem **3 recursos nativos** que não precisam de IA:

#### a) Mensagem de Ausência (Offline)
- **O que é:** mensagem automática enviada quando você está fora do horário de atendimento
- **Como funciona:** você define horário de funcionamento → quando cliente envia mensagem fora desse horário, ele recebe a mensagem de ausência automaticamente
- **Limitação:** só funciona por horário, não por disponibilidade real
- **Como configurar:**
  1. WhatsApp Business → ⚙️ → Ferramentas comerciais
  2. Mensagem de ausência → Ativar
  3. Definir horário de funcionamento

#### b) Mensagem de Saudação (Boas-vindas)
- **O que é:** primeira mensagem automática quando um cliente novo inicia conversa
- **Como funciona:** dispara uma vez por contato, quando ele envia a primeira mensagem
- **Limitação:** só funciona para conversas novas, não para mensagens subsequentes
- **Como configurar:**
  1. WhatsApp Business → ⚙️ → Ferramentas comerciais
  2. Saudação → Ativar

#### c) Respostas Rápidas (Quick Replies)
- **O que é:** atalhos de texto que você digita e o app expande para uma mensagem completa
- **Como funciona:** você cria atalhos como `!preco`, `!entrega`, etc. Quando digita `!preco` + enter, a mensagem completa aparece
- **Limitação:** você tem que estar com o celular na mão para digitar
- **Como configurar:**
  1. WhatsApp Business → ⚙️ → Ferramentas comerciais
  2. Respostas rápidas → Adicionar
  3. Definir atalho + mensagem

#### d) Catálogo de Produtos
- **O que é:** lista de produtos dentro do WhatsApp com foto, preço e descrição
- **Como funciona:** cliente vê seus produtos diretamente no app, sem precisar de links externos
- **Limitação:** até 500 produtos, mas organização manual
- **Como configurar:**
  1. WhatsApp Business → ⚙️ → Ferramentas comerciais
  2. Catálogo → Adicionar produto

#### e) Lista de Transmissão
- **O que é:** mensagem enviada para múltiplos contatos de uma vez
- **Como funciona:** você cria uma lista de até 256 contatos e envia uma mensagem para todos
- **Limitação:** os contatos precisam ter seu número salvo; se alguém responder, a resposta vai só para você
- **Como configurar:**
  1. WhatsApp Business → ⚙️ → Ferramentas comerciais
  2. Nova transmissão → Selecionar contatos

---

### 1.2 Facebook Marketplace / Messenger — O que já vem de fábrica

#### a) Resposta Automática no Messenger
- **O que é:** mensagem automática quando alguém envia mensagem para sua página
- **Como funciona:** você define uma mensagem padrão que é enviada automaticamente
- **Limitação:** resposta genérica, não personalizada por produto
- **Como configurar:**
  1. Página do Facebook → Configurações → Mensagens
  2. "Respostas automáticas" → Ativar
  3. Escrever mensagem de resposta

#### b) Respostas Salvas (Saved Replies)
- **O que é:** similar às respostas rápidas do WhatsApp, mas no Messenger
- **Como funciona:** você cria respostas padrão e usa elas com poucos cliques
- **Como configurar:**
  1. Página do Facebook → Configurações → Mensagens
  2. Respostas salvas → Criar nova

#### c) Intenção de Compra do Facebook
- **O que é:** o FB detecta quando alguém está interessado em comprar e sugere ações
- **Como funciona:** automaticamente — você só precisa responder rápido
- **Dica:** responder em até 5 min aumenta a visibilidade do seu anúncio no algoritmo do FB

---

### 1.3 OLX — O que já vem de fábrica

#### a) Chat da OLX
- **O que é:** sistema de mensagens interno da plataforma
- **Como funciona:** cliente envia mensagem pelo site/app → você recebe notificação por email/app
- **Limitação:** não há resposta automática nativa
- **Dica:** baixar o app OLX no celular e ativar notificações push

#### b) República de Anúncios
- **O que é:** ao editar um anúncio, ele volta para o topo da listagem
- **Como funciona:** a cada 7 dias, edite o anúncio (mesmo que só mude uma palavra) para renová-lo
- **Dica:** criar um calendário de reativação de anúncios

---

### 1.4 Limitações da Configuração Nativa

| Recurso | O que faz | O que NÃO faz |
|---------|-----------|---------------|
| Mensagem de ausência | Responde fora de horário | Não responde perguntas sobre produtos |
| Respostas rápidas | Textos pré-definidos | Não analisa a mensagem do cliente |
| Catálogo | Mostra produtos | Não responde perguntas |
| Resposta automática FB | Mensagem genérica | Não personaliza por produto |
| Chat OLX | Canal de comunicação | Sem automação |

**Conclusão:** a configuração nativa resolve o problema de "ausência", mas **não resolve o problema de resposta personalizada enquanto você está ocupado**. É aí que entra a automação com IA.

---

## 2. AUTOMAÇÃO COM IA — Como Funciona

### 2.1 Conceito Básico

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Cliente   │────▶│   Sistema   │────▶│    Você     │
│ envia msg   │     │    IA       │     │  (só se     │
│ no WhatsApp │     │ analisa e   │     │  necessário)│
│             │     │ responde    │     │             │
└─────────────┘     └─────────────┘     └─────────────┘
```

1. **Cliente envia mensagem** → WhatsApp/FB/OLX
2. **Sistema captura a mensagem** → via API ou webhook
3. **IA analisa a mensagem** → entende intenção, produto, urgência
4. **IA responde automaticamente** → em 2 segundos
5. **Escala para você** → se for negociação, defeito, ou venda cara

### 2.2 O que a IA consegue fazer

#### a) Responder perguntas sobre produtos

**Exemplo de funcionamento:**

```
Cliente: "Quanto custa o smartwatch D20?"
    ↓
IA analisa:
  - Produto: Smartwatch D20
  - Intenção: Consulta de preço
  - Produto no catálogo: Sim, custo R$ 11,50, venda R$ 49,90–R$ 150
    ↓
IA responde automaticamente:
"O Smartwatch D20 Bluetooth está R$ 49,90 na versão básica.
Temos também a versão Ultra por R$ 149,90.
Qual versão você prefere?

🚚 Entrega no mesmo dia em Manaus
✅ Garantia local 30 dias"
```

#### b) Qualificar leads

```
Cliente: "Quero um smartwatch"
    ↓
IA pergunta automaticamente:
"Qual seu orçamento?
A) Até R$ 60 (D20, D18s)
B) R$ 60–120 (S11 Mini, CU10 Ultra)
C) R$ 120–200 (W29s, S11 Pro)
D) Acima de R$ 200 (Imeson premium)"
    ↓
Cliente responde: "B"
    ↓
IA responde:
"Perfeito! Para orçamento de R$ 60–120, recomendo:
- S11 Mini → R$ 109,90 (2 pulseiras, Série 10)
- CU10 Ultra → R$ 119,90 (design premium, 2 pulseiras)

Qual você prefere? Posso enviar fotos."
```

#### c) Oferecer kits e upsells

```
Cliente: "Vou querer o D20"
    ↓
IA responde:
"Ótima escolha! O D20 está R$ 49,90.

💡 Que tal levar com 10% de desconto no combo?
Kit D20 + Fone M10 (visor LED) por R$ 89,90
Economia de R$ 14,90 + ganha frete grátis!

Quer aproveitar?"
```

#### d) Informar sobre entrega e garantia

```
Cliente: "Entrega na Compensa?"
    ↓
IA responde:
"Sim! Entregamos na Compensa no mesmo dia via motoboy.
Taxa: R$ 15
Tempo: 2–4 horas após confirmação do pedido.

Quer reservar? Posso enviar o link do PIX para pagamento."
```

---

### 2.3 O que a IA NÃO deve fazer (escala para você)

| Situação | Por que escala | Ação da IA |
|----------|---------------|------------|
| Negociação de preço | Você decide o desconto | "Vou consultar o melhor preço para você e já volto!" |
| Troca/devolução | Você precisa verificar o produto | "Vou verificar a disponibilidade de troca e te respondo em 5 min" |
| Defeito/reclamação | Você precisa resolver pessoalmente | "Sinto muito! Vou resolver isso agora, um momento" |
| Venda > R$ 200 | Ticket alto, você quer acompanhar | "Perfeito! Vou te passar todos os detalhes pelo WhatsApp" |
| Cliente insatisfeito | Você precisa acalmar | "Vou resolver isso para você, já já te respondo" |

---

## 3. FERRAMENTAS PRÁTICAS PARA IMPLEMENTAR

### 3.1 Opção A — Ferramentas Prontas (sem código)

#### Zapier + ChatGPT (recomendado para começar)
- **Custo:** ~$20/mês (plano Starter)
- **Como funciona:**
  1. Cliente envia mensagem no WhatsApp → Zapier captura via WhatsApp Business API
  2. Zapier envia a mensagem para o ChatGPT
  3. ChatGPT responde baseado no seu catálogo
  4. Resposta é enviada automaticamente para o cliente

**Prós:**
- Não precisa programar
- Interface visual fácil de usar
- Funciona com WhatsApp, FB Messenger, Gmail

**Contras:**
- Custo mensal
- Depende de conexão com API do WhatsApp (precisa de conta Business verificada)

#### ManyChat (para Facebook Messenger)
- **Custo:** Gratuito até 1.000 contatos
- **Como funciona:**
  1. Cliente envia mensagem no Messenger → ManyChat captura
  2. ManyChat responde com fluxo pré-definido ou IA
  3. Você edita as respostas no dashboard visual

**Prós:**
- Gratuito para começar
- Interface visual com fluxos
- Integração nativa com FB

**Contras:**
- Só funciona com Messenger, não WhatsApp
- IA limitada no plano gratuito

#### Tidio (para website + messengers)
- **Custo:** Gratuito até 100 conversas/mês
- **Como funciona:**
  1. Cliente envia mensagem → Tidio captura
  2. IA responde ou escala para você
  3. Você recebe notificação no celular

**Prós:**
- Multi-canal (WhatsApp, Messenger, chat do site)
- IA incluída no plano gratuito
- Dashboard simples

**Contras:**
- Limitado no plano gratuito

---

### 3.2 Opção B — Customizado (para quando crescer)

#### n8n + OpenAI API
- **Custo:** Gratuito (self-hosted) ou $20/mês (cloud)
- **Como funciona:**
  1. n8n recebe mensagem do WhatsApp via webhook
  2. n8n envia para OpenAI API com contexto do seu catálogo
  3. OpenAI responde
  4. n8n envia resposta de volta para o WhatsApp

**Prós:**
- Totalmente customizável
- Custo baixo
- Você controla os dados

**Contras:**
- Requer conhecimento técnico
- Precisa configurar servidor

---

## 4. COMO MONTAR A AUTOMAÇÃO NA PRÁTICA

### 4.1 Estrutura do Sistema

```
┌─────────────────────────────────────────┐
│            CLIENTE ENVIA MENSAGEM        │
│   (WhatsApp / FB / OLX)                  │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│      SISTEMA CAPTURA A MENSAGEM          │
│  (Zapier / ManyChat / n8n / API)         │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│         IA ANALISA A MENSAGEM            │
│  - Qual produto?                          │
│  - Qual a intenção? (preço, entrega, etc)│
│  - É uma pergunta simples ou negociação?  │
│  - Valor do produto (se mencionado)       │
└──────────────────┬──────────────────────┘
                   │
          ┌────────┴────────┐
          │                 │
          ▼                 ▼
┌─────────────────┐  ┌──────────────────┐
│  Responde auto  │  │  Escala para você│
│  (perguntas     │  │  (negociações,   │
│   simples)      │  │   defeitos, etc) │
└────────┬────────┘  └────────┬─────────┘
         │                    │
         ▼                    ▼
   Cliente recebe         Você recebe
   resposta em 2s         notificação para
                          responder pessoalmente
```

### 4.2 Prompt da IA (sistema)

```
Você é o assistente de vendas da [Nome da Loja], especializada em eletrônicos em Manaus.

CATÁLOGO:
- Smartwatch D20: R$ 49,90 (básico) / R$ 149,90 (Ultra)
- Fone TWS M19: R$ 39,90
- Cabo V8 Turbo: R$ 17,90
- Hub USB Tipo-C 6 em 1: R$ 99,90
[lista completa de produtos]

REGRAS:
1. Responda em português brasileiro, informal e amigável
2. Sempre mencione: entrega no mesmo dia (R$ 15–20) e garantia 30 dias
3. Se cliente perguntar sobre produto não catalogado: "Vou verificar e já te respondo!"
4. Se cliente quiser negociar preço: "Vou consultar o melhor preço para você!"
5. Se cliente mencionar defeito/troca: "Vou resolver isso agora, um momento"
6. Nunca invente preços — use apenas os valores do catálogo
7. Ofereça kits quando cliente demonstrar interesse em um produto
8. Seja conciso — máximo 3 linhas por mensagem
```

### 4.3 Exemplo de Fluxo Completo

```
Cliente: "Ola, quanto custa o smartwatch d20?"
    ↓
[IA captura mensagem via Zapier]
    ↓
[IA analisa]:
  - Produto: Smartwatch D20
  - Intenção: Consulta de preço
  - Urgência: Baixa
  - Ação: Responder automaticamente
    ↓
[IA responde]:
"O D20 Bluetooth está R$ 49,90 na versão básica.
Temos também a versão Ultra por R$ 149,90.
Qual versão você prefere?

🚚 Entrega no mesmo dia em Manaus
✅ Garantia local 30 dias"
    ↓
[Cliente recebe em 2s]
    ↓
Cliente: "Ultra, entrega na Compensa?"
    ↓
[IA analisa]:
  - Produto: Smartwatch D20 Ultra
  - Intenção: Confirmar entrega
  - Bairro: Compensa
  - Ação: Responder automaticamente
    ↓
[IA responde]:
"Perfeito! O D20 Ultra está R$ 149,90.
Entrega na Compensa: R$ 15, tempo 2–4h.

Quer reservar? Posso enviar o link do PIX."
    ↓
Cliente: "Pode ser, mas muito caro, faz por R$ 130?"
    ↓
[IA analisa]:
  - Produto: Smartwatch D20 Ultra
  - Intenção: Negociação de preço
  - Ação: ESCALAR PARA VOCÊ
    ↓
[IA responde]:
"Vou consultar o melhor preço para você e já volto!"
    ↓
[Você recebe notificação no celular]
    ↓
[Você responde manualmente]:
"Fechado por R$ 135! Pode reservar pelo PIX: [link]"
```

---

## 5. IMPLEMENTAÇÃO PRÁTICA — PASSO A PASSO

### 5.1 Semana 1 — Configuração Nativa (sem custo)

**Dia 1: WhatsApp Business**
- [ ] Atualizar foto da loja + descrição
- [ ] Configurar horário de funcionamento
- [ ] Ativar mensagem de ausência
- [ ] Criar mensagem de saudação
- [ ] Criar 5 respostas rápidas (!preco, !entrega, !garantia, !pagamento, !local)

**Dia 2: Facebook**
- [ ] Criar página da loja (se não tiver)
- [ ] Configurar resposta automática no Messenger
- [ ] Criar 3 respostas salvas

**Dia 3: OLX**
- [ ] Baixar app OLX + ativar notificações push
- [ ] Atualizar títulos dos anúncios com "Entrega Hoje Manaus"
- [ ] Republicar anúncios antigos

### 5.2 Semana 2 — Automação com IA

**Opção A — Sem código (Zapier/ManyChat):**

**Dia 1: Escolher ferramenta**
- Se prioridade for WhatsApp → Zapier
- Se prioridade for FB → ManyChat
- Se quiser grátis → Tidio

**Dia 2: Configurar integração**
- Conectar WhatsApp Business à ferramenta
- Importar catálogo de produtos
- Configurar webhook para receber mensagens

**Dia 3: Treinar a IA**
- Criar prompt do sistema com seu catálogo
- Testar com perguntas comuns
- Ajustar respostas baseado em resultados

**Dia 4: Testar**
- Enviar mensagens de teste
- Verificar se respostas estão corretas
- Ajustar prompt se necessário

**Dia 5: Ativar para clientes reais**
- Começar com horário limitado (ex: só das 8h–14h)
- Monitorar primeiras respostas
- Ajustar conforme feedback

**Opção B — Customizado (n8n + OpenAI):**

**Pré-requisito:** ter conta OpenAI + servidor/n8n cloud

**Dia 1: Configurar n8n**
- Criar conta no n8n.cloud
- Configurar webhook do WhatsApp
- Testar recebimento de mensagens

**Dia 2: Configurar OpenAI**
- Criar conta na OpenAI
- Criar API key
- Testar conexão com n8n

**Dia 3: Montar fluxo**
- Criar fluxo no n8n: webhook → OpenAI → WhatsApp
- Importar catálogo de produtos
- Configurar prompt do sistema

**Dia 4: Testar**
- Enviar mensagens de teste
- Verificar respostas
- Ajustar prompt

**Dia 5: Ativar**
- Começar com monitoramento
- Ajustar conforme necessário

---

## 6. CUSTOS ESTIMADOS

### Opção A — Ferramentas Prontas

| Ferramenta | Custo | O que inclui |
|-----------|-------|--------------|
| Zapier Starter | $20/mês | 20 fluxos, 1.000 tasks/mês |
| ManyChat Gratuito | R$ 0 | Até 1.000 contatos |
| Tidio Gratuito | R$ 0 | Até 100 conversas/mês |
| OpenAI API | ~R$ 50/mês | ~1.000 respostas/mês |

**Custo total estimado: R$ 0–300/mês** (dependendo da ferramenta escolhida)

### Opção B — Customizado

| Item | Custo |
|------|-------|
| n8n Cloud | $20/mês |
| OpenAI API | ~R$ 50/mês |
| WhatsApp Business API | Grátis (conta Business) |
| **Total** | **~R$ 150/mês** |

---

## 7. MÉTRICAS DE SUCESSO

| Métrica | Meta | Como medir |
|---------|------|-----------|
| Tempo de resposta | < 5 min | WhatsApp Business Insights |
| % respostas automáticas | > 70% | Contagem manual |
| Taxa de conversão | > 5% | Vendas / leads |
| Satisfação do cliente | > 4/5 | Perguntar nas vendas |
| Redução de trabalho manual | > 50% | Tempo gasto respondendo antes/depois |

---

## 8. PRÓXIMOS PASSOS

1. **Começar pela configuração nativa** (sem custo, 1 dia)
2. **Testar com ferramenta gratuita** (Tidio ou ManyChat free)
3. **Medir resultados por 1 semana**
4. **Decidir se vale a pena pagar por ferramenta paga**
5. **Otimizar baseado em dados reais**

---

**Resumo:** A configuração nativa resolve 30% do problema (ausência + respostas rápidas). A automação com IA resolve os outros 70% (respostas personalizadas em tempo real). Comece pelo nativo, depois adicione IA gradualmente.
