# WMS — Fluxos Operacionais

> Documento de escopo funcional focado em **como a operação acontece na prática**.
> Cobre três vertentes: **Distribuição/E-commerce**, **Indústria** e **3PL (operador logístico terceiro)**.

---

## 0. Princípios de design que atravessam todos os fluxos

Antes dos fluxos, três regras que definem se o WMS é bom ou medíocre. Tudo abaixo se apoia nelas.

1. **O operador recebe tarefas, não navega menus.** O sistema empurra trabalho (task management). A inteligência está no sistema; a execução, no operador. Tela mostra uma instrução por vez.
2. **Scan-to-confirm em todo passo crítico.** Bipar endereço, produto, lote, quantidade — o sistema *valida* contra o esperado, não confia na memória do operador. É isso que sustenta a acuracidade.
3. **Exceção tratada dentro do fluxo.** Falta, avaria, divergência, endereço vazio — o operador registra a ocorrência sem abandonar a tarefa. Nunca "saia do app e ligue para o supervisor".

Requisitos não-funcionais que afetam todo fluxo:
- **Offline-first**: armazéns têm zonas mortas de WiFi; coletor precisa operar e sincronizar depois.
- **Multi-owner / multi-CD**: estoque segregado por dono e por centro de distribuição (crítico para 3PL).
- **Rastreabilidade**: todo movimento gera log (quem, quando, de onde, para onde, qual lote).

---

## 1. RECEBIMENTO (Inbound)

### 1.1 Fluxo base (comum às três vertentes)

```
Agendamento → Chegada/Doca → Conferência → Tratamento de divergência → Etiquetagem → Disponibilização p/ putaway
```

**Passo a passo do operador (conferente):**
1. Seleciona a doca / veículo no coletor. Sistema mostra o documento esperado (NF-e ou ASN).
2. **Conferência cega** (recomendada): operador conta sem ver a quantidade esperada. Reduz viés e fraude.
3. Bipa o produto → informa quantidade → sistema compara com o esperado internamente.
4. Se bate: gera etiqueta de palete/volume (SSCC) para rastreio interno.
5. Se diverge: abre ocorrência (falta / sobra / item trocado / avaria) com foto e quantidade real.
6. Mercadoria fica em status **"a endereçar"** numa área de staging de recebimento.

### 1.2 Variações por vertente

| Aspecto | Distribuição/E-commerce | Indústria | 3PL |
|---|---|---|---|
| Origem | Fornecedores variados, ASN nem sempre disponível | Produção interna + insumos | Recebe estoque de **vários clientes** |
| Conferência | Por volume/SKU | Por lote + matéria-prima | Cega obrigatória + segregação por dono |
| Particularidade | Alto mix, volumes pequenos | Controle de lote/validade rígido | Vincular cada palete ao **owner** correto |

> **Ponto crítico 3PL:** no recebimento já se define o dono do estoque. Errar aqui contamina faturamento e segregação. Bipar/selecionar o cliente é passo obrigatório.

---

## 2. ENDEREÇAMENTO / PUTAWAY

### 2.1 Fluxo

```
Item em staging → Sistema sugere endereço → Operador transporta → Bipa endereço → Confirma → Estoque "disponível"
```

**Lógica de sugestão de endereço** (o cérebro do putaway):
- Curva ABC (giro): item A perto da expedição; C no fundo.
- Tipo de endereço: **picking** (nível baixo, acesso rápido) vs. **pulmão/reserva** (níveis altos).
- Restrições: peso, dimensão, temperatura, validade, incompatibilidade química (indústria).
- Estratégia de ocupação:
  - **Caótico/dinâmico** — maximiza uso do espaço; depende 100% do scan-to-confirm.
  - **Fixo** — cada SKU tem lugar definido; mais simples, menos eficiente em espaço.

**Passo do operador:**
1. Pega tarefa de putaway (ou o sistema interleava após um recebimento).
2. Tela: "Guardar palete X no endereço B-04-12-3".
3. Bipa endereço de destino → sistema valida que é o lugar certo.
4. Confirma → estoque vira "disponível para venda/picking".
5. Se o endereço sugerido estiver ocupado/inacessível → operador registra e o sistema sugere alternativa.

### 2.2 Variações por vertente
- **E-commerce:** privilegia endereços de picking de fácil acesso para alto giro.
- **Indústria:** segrega matéria-prima de produto acabado; respeita FEFO por lote.
- **3PL:** segregação física/lógica por cliente; alguns contratos exigem áreas dedicadas.

---

## 3. GESTÃO DE ESTOQUE

### 3.1 Controles essenciais
- **Por lote e validade (FEFO)** — first expired, first out.
- **Por número de série** — eletrônicos, itens de alto valor.
- **Bloqueios/status**: disponível, quarentena, avaria, em qualidade, reservado.
- **Acuracidade de inventário** = KPI central (estoque sistêmico vs. físico).

### 3.2 Inventário rotativo (cycle count) — fluxo
```
Sistema gera contagem por endereço/curva → Operador vai ao endereço → Conta cego → Diverge? → Recontagem → Ajuste com aprovação
```
- Não para a operação (diferente do inventário geral anual).
- Prioriza curva A (conta com mais frequência).
- Ajustes acima de tolerância exigem aprovação do supervisor (gate de aprovação).

> **3PL:** relatórios de acuracidade por cliente são entregáveis contratuais. O cliente quer ver o estado do *seu* estoque.

---

## 4. PICKING (Separação)

O coração da operação outbound. Onde mais se ganha ou perde produtividade.

### 4.1 Estratégias de separação

| Estratégia | Como funciona | Quando usar |
|---|---|---|
| **Discreto** | 1 pedido por vez | Baixo volume, pedidos grandes |
| **Batch/lote** | Vários pedidos com mesmo SKU separados juntos | Alto volume, muitos itens repetidos (e-commerce) |
| **Por onda (wave)** | Pedidos agrupados por critério (rota, horário de corte) | Sincronizar com expedição/transporte |
| **Por zona** | Cada operador cobre uma zona; pedido passa entre zonas | Armazém grande, alto volume |
| **Cluster** | 1 operador separa N pedidos simultâneos em carrinho | E-commerce, pedidos pequenos |

### 4.2 Métodos físicos
- **RF (coletor)** — padrão, flexível, custo baixo.
- **Voice picking** — mãos livres, bom para congelados/volumes.
- **Pick-to-light / put-to-light** — alta velocidade em estações fixas.

### 4.3 Fluxo do separador (RF — o caso mais comum)
1. Login no coletor → sistema atribui próxima tarefa (priorizada por SLA/onda).
2. Tela: "Vá ao endereço A-12-03-2".
3. Bipa etiqueta do endereço → valida local.
4. Bipa código do produto → valida SKU.
5. (Se aplicável) bipa/confirma lote para FEFO.
6. Informa/confirma quantidade → separa.
7. Sistema manda o próximo endereço **na ordem otimizada da rota** (minimiza deslocamento).
8. Ao fim → leva à área de packing/conferência.

**Exceções no fluxo:**
- Endereço com quantidade insuficiente → picking parcial + tarefa de reabastecimento gerada.
- Produto avariado no endereço → registra ocorrência, sistema busca outro endereço com o SKU.

### 4.4 Variações por vertente
- **E-commerce:** cluster/batch picking dominam; pedidos unitários, alta cadência.
- **Indústria:** picking por ordem de produção/expedição; FEFO crítico.
- **3PL:** regras de picking variam por cliente (cada contrato pode ter SLA e método próprios).

---

## 5. REABASTECIMENTO (Replenishment)

Mantém os endereços de picking abastecidos a partir do pulmão.

```
Endereço de picking abaixo do mínimo → Sistema gera tarefa → Operador move do pulmão p/ picking → Bipa origem e destino → Confirma
```
- **Automático** (gatilho por nível mínimo) ou **sob demanda** (disparado por picking parcial).
- Bom WMS faz **interleaving**: encaixa o reabastecimento no caminho de outra tarefa.

---

## 6. PACKING E EXPEDIÇÃO (Outbound)

### 6.1 Fluxo
```
Itens separados → Conferência de saída → Embalagem/cubagem → Etiqueta de transporte → Romaneio → Conferência de carregamento → Despacho
```

**Passo do operador:**
1. Bipa o pedido/volume na estação de packing.
2. **Conferência de saída** (re-bipa itens) — última barreira contra erro de envio.
3. Sistema calcula cubagem/peso, sugere embalagem.
4. Gera etiqueta da transportadora (integração com TMS/transportadoras).
5. Agrupa por rota/transportadora (romaneio).
6. **Conferência de carregamento (docking):** bipa volumes ao carregar o veículo → garante que tudo certo embarcou.

### 6.2 Variações por vertente
- **E-commerce:** integração forte com transportadoras/Correios, etiqueta unitária, alto volume de pacotes.
- **Indústria:** cargas maiores, paletizadas, foco em romaneio e nota fiscal.
- **3PL:** expedição segregada por cliente; documentação e faturamento por owner.

---

## 7. FUNÇÕES TRANSVERSAIS

### 7.1 Cross-docking
Mercadoria entra e já sai sem ser estocada.
```
Recebimento → Triagem direta p/ doca de saída → Expedição
```
Útil em e-commerce (fulfillment rápido) e distribuição (transferência entre CDs).

### 7.2 Gestão de tarefas e interleaving
- Fila única priorizada; sistema decide a próxima tarefa por operador.
- **Interleaving:** ao terminar um putaway perto da doca, encaixa um picking no caminho de volta. Elimina deslocamento vazio — ganho direto de produtividade.

### 7.3 Integrações
- **ERP** — pedidos, produtos, estoque, fiscal.
- **TMS / transportadoras** — etiquetas, rastreio, frete.
- **E-commerce / marketplace** — pedidos em tempo real.
- **EDI** — troca de documentos com parceiros (comum em 3PL e indústria).

### 7.4 Faturamento de serviços (específico 3PL)
O 3PL cobra pelo serviço logístico. O WMS precisa medir:
- Armazenagem (por palete/m²/dia), movimentação (entrada/saída), picking (por linha/pedido), serviços de valor agregado (etiquetagem, kitting).
- Relatórios por cliente são entregáveis contratuais.

---

## 8. KPIs E DASHBOARDS

| KPI | O que mede |
|---|---|
| Acuracidade de inventário | Estoque sistêmico vs. físico |
| Produtividade por operador | Linhas/hora, pedidos/hora |
| OTIF | On Time In Full (pedidos no prazo e completos) |
| Taxa de ocupação | Uso dos endereços/espaço |
| Tempo de ciclo de pedido | Do corte ao despacho |
| Taxa de divergência | Erros de recebimento/expedição |
| Dock-to-stock | Tempo do recebimento até disponível |

---

## 9. Matriz de prioridade por vertente (resumo)

| Capacidade | E-commerce | Indústria | 3PL |
|---|---|---|---|
| Multi-owner | — | — | **Essencial** |
| FEFO / lote | Médio | **Essencial** | Alto |
| Cluster/batch picking | **Essencial** | Médio | Alto |
| Faturamento de serviços | — | — | **Essencial** |
| Integração transportadoras | **Essencial** | Médio | Alto |
| Cross-docking | Alto | Médio | Alto |
| Segregação por cliente | — | — | **Essencial** |

---

## 10. Próximos passos sugeridos

1. **Definir MVP vs. roadmap** — provavelmente começar por uma vertente (e-commerce costuma ser o melhor MVP por ter fluxo mais padronizado) e expandir.
2. **Levantamento com o cliente** — perguntas-chave: volume diário, nº de SKUs, nº de operadores, hardware (coletor/voice), grau de exigência de FEFO, e se o 3PL terá clientes com contratos distintos desde o dia 1.
3. **Modelo de dados núcleo** — endereço, SKU, lote, owner, tarefa, ocorrência. Acertar isso cedo evita retrabalho caro.
