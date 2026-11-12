# Resposta Automática e Automação — Marketplaces Manaus

> Problema: cliente envia mensagem no WhatsApp/FB/OLX → demora na resposta → venda perdida.
> Solução: configuração nativa + automação com IA para responder em segundos, 24h.

---

## 1. WHATSAPP BUSINESS — Configuração Nativa

### 1.1 Mensagem de Ausência (Offline)

**Como configurar:**
1. Abrir WhatsApp Business → Configurações (⚙️) → Ferramentas comerciais
2. Mensagem de ausência → Ativar
3. Definir horário de funcionamento

**Modelo de mensagem de ausência:**

```
Olá! 👋 Bem-vindo à [Nome da Loja].

Estamos fora do horário de atendimento agora, mas assim que eu retornar te respondo em até 15 minutos.

📱 Nossos produtos: [link catálogo]
🚚 Entrega em Manaus: mesmo dia via motoboy
✅ Garantia: 30 dias local

Deixe sua pergunta que já já te respondo!
```

**Horário sugerido para Manaus:**
- Seg–Sex: 8h às 22h
- Sábado: 9h às 18h
- Domingo: 10h às 14h

### 1.2 Mensagem de Saudação (Boas-vindas)

**Modelo:**

```
Olá! 👋 Sou o [Nome], da [Nome da Loja].

Vendo eletrônicos e acessórios em Manaus com:
✅ Entrega no mesmo dia (motoboy)
✅ Garantia local 30 dias
✅ Pagamento na entrega ou PIX

Qual produto você procura?
```

### 1.3 Respostas Rápidas (Quick Replies)

Criar respostas pré-definidas para perguntas frequentes:

| Atalho | Pergunta | Resposta |
|--------|----------|----------|
| `!preco` | Quanto custa? | "Qual produto você quer? Me envie o link ou o nome que te passo o preço." |
| `!entrega` | Entrega? | "Entrega no mesmo dia via motoboy. Taxa: R$ 15–20 dependendo do bairro." |
| `!garantia` | Garantia? | "Todos os produtos têm 30 dias de garantia local. Troca na hora em caso de defeito." |
| `!pagamento` | Pagamento? | "PIX ou dinheiro na entrega. Também aceitamos cartão na entrega (+2%)" |
| `!local` | Onde fica? | "Retirada em [endereço] ou entrega via motoboy em toda Manaus." |

---

## 2. FACEBOOK MARKETPLACE / MESSENGER — Configuração Nativa

### 2.1 Resposta Automática no Messenger

**Como configurar:**
1. Página do Facebook → Configurações → Mensagens
2. "Respostas automáticas" → Ativar

**Modelo de resposta automática:**

```
Olá! 👋 Obrigado pelo interesse!

Estamos online de Seg–Sex, 8h às 22h.
Se estiver fora do horário, te respondo em até 15 minutos assim que eu voltar.

📦 Produtos: [link]
🚚 Entrega no mesmo dia em Manaus
✅ Garantia local 30 dias

Qual produto você quer?
```

### 2.2 Dicas para FB Marketplace

- **Sempre incluir "Entrega no mesmo dia" no título do anúncio**
- **Adicionar localização: Manaus, AM** (aumenta alcance local)
- **Responder em até 5 minutos** — algoritmo do FB favorece vendedores que respondem rápido
- **Usar fotos reais do produto** (não usar imagens de stock)

---

## 3. OLX — Configuração Nativa

### 3.1 Dicas para OLX Manaus

- **Sempre incluir "Entrega Fácil"** se disponível na região
- **Título do anúncio:** incluir palavra-chave + diferencial
  - ❌ "Smartwatch D20"
  - ✅ "Smartwatch D20 Bluetooth - Entrega Hoje Manaus - Garantia 30 dias"
- **Responder pelo chat da OLX** — o sistema notifica por email/app se não houver resposta em 10 min
- **Manter anúncios atualizados** — republicar a cada 7 dias para aparecer no topo

### 3.2 Resposta Rápida Padrão (copiar/colar)

```
Olá! Tudo bem? 😊

Esse produto está disponível sim!

✅ Preço: R$ [valor]
✅ Entrega no mesmo dia (motoboy) - R$ 15/20
✅ Garantia local 30 dias
✅ Pagamento: PIX ou dinheiro na entrega

Quer reservar? Posso enviar o local de retirada ou combinar a entrega.
```

---

## 4. AUTOMAÇÃO COM IA — Sistema Inteligente de Respostas

### 4.1 Funcionamento

```
Cliente envia mensagem
    ↓
IA analisa a mensagem (intenção + produto + urgência)
    ↓
Se for pergunta simples → responde automaticamente em 2s
Se for negociação → te encaminha com contexto
```

### 4.2 Perguntas que a IA responde automaticamente

| Tipo | Exemplo | Resposta da IA |
|------|---------|----------------|
| Preço | "Quanto custa o D20?" | Responde com preço + variações + kits |
| Entrega | "Entrega no [bairro]?" | Confirma bairro + valor do frete |
| Garantia | "Tem garantia?" | Explica 30 dias + troca na hora |
| Disponibilidade | "Ainda tem?" | Confirma estoque + sugere produtos similares |
| Pagamento | "Aceita cartão?" | PIX/dinheiro/cartão na entrega |
| Produto | "O D20 é à prova d'água?" | Responde sobre IP68 + bateria |
| Kit | "Tem kit com fone?" | Oferece kit D20 + M10 por R$ 89 |

### 4.3 Quando a IA NÃO responde (escala para você)

- Cliente quer **negociar preço** ("me dá R$ 40 no D20")
- Cliente quer **trocar produto** ("quero trocar por outro modelo")
- Cliente está **insatisfeito** ("produto veio com defeito")
- Cliente quer **garantia estendida** (>30 dias)
- Venda de **produto caro** (>R$ 200) — você quer acompanhar pessoalmente

---

## 5. FLUXO OPERACIONAL RECOMENDADO

### 5.1 Setup Diário (5 minutos)

```
1. Abrir WhatsApp Business no celular + PC (WhatsApp Web)
2. Verificar se IA está ativa (notificação)
3. Checar fila de mensagens pendentes
4. Responder manualmente apenas casos escalados
```

### 5.2 Monitoramento Contínuo

| Ação | Ferramenta | Frequência |
|------|-----------|------------|
| Ver mensagens não respondidas | WhatsApp Business | A cada 30 min |
| Checar notificações OLX | App OLX | A cada 1h |
| Responder negociações | Manual | Assim que notificado |
| Republicar anúncios | OLX/FB | Domingo à noite |
| Atualizar estoque | Catálogo IA | Diariamente |

### 5.3 Regra de Ouro

> **Responder em até 5 minutos** — estatísticas de ML/OLX mostram que leads que esperam mais de 10 min tem 70% menos chance de converter.

---

## 6. CATÁLOGO DIGITAL (WhatsApp Business)

### 6.1 Criar Catálogo no WhatsApp Business

**Passos:**
1. WhatsApp Business → Ferramentas comerciais → Catálogo
2. Adicionar produtos com:
   - Foto real do produto
   - Nome + código
   - Preço de venda
   - Descrição curta (características principais)
   - Link do anúncio OLX/ML (opcional)

### 6.2 Estrutura do Catálogo

```
📱 Nome da Loja — Eletrônicos Manaus

Categorias:
├── ⌚ Smartwatches (8 produtos)
├── 🎧 Fones (10 produtos)
├── 🖱️ Informática (11 produtos)
├── 🔊 Eletrônicos (17 produtos)
├── 📸 Câmeras (8 produtos)
├── 📱 Acessórios (18 produtos)
└── 💾 Armazenamento (13 produtos)
```

### 6.3 Modelo de Lista de Transmissão

```
Olá! 👋

Promoção da semana na [Nome da Loja]:

🔥 Smartwatch D20 → R$ 49,90 (ger R$ 150)
🔥 Cabo Turbo V8 → R$ 17,90 (ger R$ 30)
🔥 Kit D20 + Fone M10 → R$ 89,90

🚚 Entrega no mesmo dia em Manaus
✅ Garantia local 30 dias

Interessado? Me chama no privado!
```

---

## 7. CHECKLIST DE IMPLEMENTAÇÃO

### Semana 1 — Configuração Básica

- [ ] Criar/atualizar WhatsApp Business com foto da loja + horário
- [ ] Configurar mensagem de ausência + saudação
- [ ] Criar 5 respostas rápidas mais usadas
- [ ] Criar página no Facebook (se não tiver)
- [ ] Configurar resposta automática no Messenger
- [ ] Anunciar no OLX com títulos otimizados

### Semana 2 — Catálogo + Automação

- [ ] Criar catálogo no WhatsApp Business (pelo menos 10 produtos)
- [ ] Adicionar foto real + preço de cada produto
- [ ] Configurar notificações de mensagem no celular + PC
- [ ] Testar sistema de resposta automática com amigo
- [ ] Criar lista de transmissão inicial (50 contatos)

### Semana 3 — Escala

- [ ] Monitorar tempo de resposta médio (meta: < 5 min)
- [ ] Ajustar respostas automáticas baseado em perguntas reais
- [ ] Republicar anúncios OLX que estão parados
- [ ] Criar 3 novos anúncios no FB Marketplace

---

## 8. MÉTRICAS PARA ACOMPANHAR

| Métrica | Meta | Ferramenta |
|---------|------|-----------|
| Tempo médio de resposta | < 5 min | WhatsApp Business Insights |
| Taxa de resposta a leads | > 90% | Contagem manual |
| Conversão de anúncio → venda | > 5% | OLX/ML stats |
| Vendas/dia | Meta inicial: 1-2/dia | Controle próprio |
| Ticket médio | R$ 60–90 | Controle próprio |
| Reclamações/garantia | < 5% | Controle próprio |

---

**Próximo passo:** Criar os templates de anúncios para OLX/FB + scripts de WhatsApp prontos para usar.
