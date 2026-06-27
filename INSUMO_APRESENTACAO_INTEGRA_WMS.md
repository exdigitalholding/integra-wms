# Insumo para Apresentação Comercial e Funcional — Integra WMS

Data base do material: 17/06/2026  
Sistema: Integra WMS  
Objetivo: fornecer insumo completo para criação de uma apresentação do sistema, cobrindo todos os módulos, incluindo módulos em mock/demo e módulos em desenvolvimento tratados como módulos completos para fins de narrativa comercial.

---

## 1. Mensagem central da apresentação

O Integra WMS é uma plataforma completa para gestão de armazéns, centros de distribuição, operações industriais, e-commerce e operadores logísticos 3PL. O sistema cobre a operação ponta a ponta: parametrização do armazém, recebimento, endereçamento, estoque, inventário, picking, reabastecimento, packing, expedição, faturamento logístico, integrações, indicadores e execução no coletor mobile.

A proposta principal é mostrar que o Integra WMS não é apenas uma tela de estoque. Ele organiza a operação inteira em três camadas:

1. **Plano administrativo e de regras (`wms-admin-business`)**  
   Onde o armazém é modelado, os cadastros mestres são mantidos, as permissões são definidas e as regras operacionais são parametrizadas.

2. **Torre de controle operacional (`wms-frontend`)**  
   Onde supervisores e gestores acompanham a operação, priorizam tarefas, monitoram KPIs, tratam exceções e coordenam os fluxos do CD.

3. **Execução no chão de armazém (`wms-mobile`)**  
   Onde operadores recebem tarefas objetivas, confirmam cada etapa por leitura de código, registram ocorrências e concluem atividades com uma experiência simples, rápida e segura.

Frase sugerida para abertura:

> O Integra WMS conecta planejamento, execução e controle em uma única operação. O administrador configura as regras, o supervisor acompanha a operação em tempo real e o operador executa tarefas guiadas no coletor.

---

## 2. Posicionamento do produto

O Integra WMS atende operações que precisam de rastreabilidade, produtividade e controle de estoque. Ele pode ser apresentado para:

- **E-commerce e varejo**, com alto volume de pedidos, picking por ondas, integração com marketplaces e transportadoras.
- **Indústria**, com controle de matéria-prima, lote, validade, FEFO, quarentena, qualidade e rastreabilidade.
- **3PL / operador logístico**, com multi-owner, segregação por cliente, faturamento por serviço logístico e relatórios por contrato.
- **Distribuição multicanal**, com múltiplos CDs, cross-docking, romaneios, expedição e integração com ERP/TMS.

Diferencial de arquitetura:

- Multi-CD desde o início.
- Multi-owner para operações 3PL.
- Endereçamento estruturado por rua, coluna, nível e posição.
- Parametrização por dados, não por código.
- Permissão por ação, não apenas por tela.
- Scan-to-confirm em pontos críticos.
- Tratamento de exceções dentro do fluxo.
- Visão web para gestão e app mobile para execução.

---

## 3. Narrativa sugerida para os slides

### Slide 1 — Capa

Título: **Integra WMS — Gestão completa de armazéns e operações logísticas**  
Subtítulo: **Do cadastro à execução no coletor, com controle, rastreabilidade e indicadores operacionais.**

Visual sugerido:

- Logo Integra.
- Imagem/tela com dashboard operacional, planta 3D ou composição dos três apps.

### Slide 2 — O problema operacional

Pontos principais:

- Estoque divergente entre sistema e físico.
- Operador dependendo de memória, papel ou planilha.
- Falta de rastreabilidade por lote, validade, endereço e operador.
- Dificuldade para priorizar tarefas por SLA.
- Baixa visibilidade do gestor sobre recebimento, picking, packing e expedição.
- Em 3PL, risco de misturar estoque entre clientes e faturar serviços de forma imprecisa.

Mensagem:

> O custo de uma operação sem WMS aparece em retrabalho, erro de envio, perda de estoque, baixa produtividade e falta de informação confiável para decisão.

### Slide 3 — A solução Integra WMS

Mostrar os três pilares:

- **Administração e regras:** cadastros, estrutura física, parâmetros, usuários e governança.
- **Operação web:** dashboard, recebimento, estoque, tarefas, picking, expedição, relatórios e integrações.
- **Coletor mobile:** execução guiada, bipagem, contagem, confirmação, ocorrência e conclusão.

Mensagem:

> O sistema entrega uma única visão operacional, do cadastro mestre à execução física no endereço.

### Slide 4 — Visão geral da arquitetura funcional

Separar por app:

| Camada | Usuário | Papel |
|---|---|---|
| Admin Business | Administrador, implantador, gestor de regras | Configura cadastros, armazéns, permissões e parâmetros |
| Frontend Operacional | Supervisor, líder, gestor de CD | Monitora, prioriza, acompanha e decide |
| Mobile Coletor | Operador de chão | Executa tarefas com scan-to-confirm |

Mensagem:

> Cada perfil usa a interface certa para seu papel. O operador não navega menus complexos; ele recebe a próxima tarefa. O supervisor não bipa produto; ele orquestra a operação.

---

## 4. Módulos do `wms-admin-business`

Este app deve ser apresentado como o **plano de controle do WMS**. É onde o sistema é preparado para a operação.

### 4.1 Painel administrativo

Objetivo:

- Mostrar prontidão do ambiente.
- Exibir visão dos cadastros, estrutura física, regras e governança.
- Dar ao administrador uma visão consolidada da configuração do WMS.

Mensagem de slide:

> Antes da operação começar, o Integra WMS garante que cadastros, estrutura, parâmetros e usuários estejam configurados de forma consistente.

### 4.2 Produtos / SKU

Funcionalidades:

- Cadastro de SKUs.
- Código, EAN, descrição e categoria.
- Unidade de medida e conversão por caixa.
- Peso, altura, largura e profundidade.
- Curva ABC.
- Controle de lote.
- Controle de validade.
- Controle de número de série.
- Dados fiscais brasileiros: NCM, CEST e origem da mercadoria.
- Status ativo/inativo.

Valor para o cliente:

- Evita cadastro incompleto.
- Sustenta cubagem, picking, validade, rastreabilidade e obrigações fiscais.
- Permite regras diferentes por tipo de produto.

### 4.3 Armazéns e CDs

Funcionalidades:

- Cadastro de centros de distribuição, lojas, fábricas e pontos de trânsito.
- Operação multi-armazém.
- Identificação por código, nome, cidade e UF.
- Definição do modo operacional: simples ou completo.

Valor:

- O mesmo WMS atende uma loja simples e um CD complexo.
- A operação pode crescer sem trocar de sistema.

### 4.4 Clientes / Owners

Funcionalidades:

- Cadastro dos donos do estoque.
- Código, nome, CNPJ, cor de identificação e status.
- Base para multi-owner e segregação lógica/física.

Valor:

- Essencial para 3PL.
- Permite relatórios e faturamento por cliente.
- Evita mistura de estoque entre contratos.

### 4.5 Fornecedores

Funcionalidades:

- Cadastro da origem das entradas.
- Código, CNPJ, UF, contato e status.
- Vinculação com recebimento e documentos fiscais.

Valor:

- Organiza o inbound.
- Ajuda na rastreabilidade de divergências, avarias e recebimentos.

### 4.6 Transportadoras

Funcionalidades:

- Cadastro de transportadoras.
- CNPJ, ANTT, modal e status.
- Preparação para integração WMS-TMS.

Valor:

- Apoia romaneio, roteirização, expedição, etiquetas e rastreio.

### 4.7 Migração de dados

Este módulo aparece como demo, mas deve ser apresentado como capacidade completa.

Funcionalidades:

- Importação assistida de cadastros.
- Apoio à implantação.
- Preparação para migrar produtos, armazéns, owners, fornecedores, transportadoras e estrutura física.
- Validação de dados antes da entrada em produção.

Valor:

- Reduz esforço de implantação.
- Diminui risco de erro no go-live.
- Facilita transição de planilhas ou sistemas legados.

### 4.8 Zonas

Funcionalidades:

- Divisão lógica do armazém.
- Zonas de recebimento, picking, pulmão/reserva, expedição, avaria, quarentena e cross-docking.
- Controle de temperatura: ambiente, refrigerado e congelado.
- Cores para identificação visual.

Valor:

- Base para roteirização, slotting, regras de armazenagem e restrição operacional.

### 4.9 Endereços

Funcionalidades:

- Cadastro de posições físicas.
- Código canônico: `RUA-COLUNA-NÍVEL-POSIÇÃO`.
- Geração em massa de endereços.
- Definição de tipo: picking, pulmão, recebimento, expedição, avaria ou quarentena.
- Capacidade por peso e paletes.
- Bloqueio/desbloqueio de posições.
- Pré-visualização 2D da planta.

Valor:

- Permite rastrear exatamente onde cada item está.
- Reduz perda de mercadoria.
- Sustenta endereçamento caótico/dinâmico e scan-to-confirm.

### 4.10 Docas

Funcionalidades:

- Cadastro de docas de recebimento, expedição ou mistas.
- Identificação por armazém.
- Controle de niveladora.
- Status ativo/inativo.

Valor:

- Organiza agenda de recebimento e expedição.
- Ajuda a controlar carregamento, descarga, staging e cross-docking.

### 4.11 Parâmetros operacionais

Funcionalidades:

- Configuração de regras por escopo: global, CD/armazém ou owner.
- Resolução hierárquica: owner → CD → global → padrão.
- Conferência cega.
- Aprovação de divergência.
- Endereçamento caótico/dinâmico.
- FEFO obrigatório.
- Interleaving de tarefas.
- Estratégia de picking: discreto, batch, wave, zona e cluster.
- Alçada de ajuste.
- Tolerância de divergência.
- Offline-first para coletores.
- Notificações de tarefas.
- Controle por número de série.

Valor:

- A operação muda por configuração, não por customização.
- Permite adaptar o mesmo sistema para e-commerce, indústria e 3PL.

### 4.12 Usuários

Funcionalidades:

- Cadastro de usuários.
- Vínculo com perfil.
- Vínculo com um ou mais armazéns.
- Controle de status.

Valor:

- Garante que cada pessoa veja e execute apenas o que corresponde ao seu papel e escopo.

### 4.13 Perfis e permissões

Funcionalidades:

- Perfis como operador, supervisor, gestor e administrador.
- Permissão por ação, não apenas por tela.
- Matriz de permissões por área.
- Alçada de ajuste por quantidade e valor.

Valor:

- Evita que usuários façam ações indevidas.
- Dá rastreabilidade e governança para ajustes, bloqueios, liberações e configurações.

### 4.14 Reason Codes

Funcionalidades:

- Cadastro de motivos de ajuste e exceção.
- Tipos: ajuste positivo, ajuste negativo, avaria, bloqueio e devolução.
- Indicação de exigência de aprovação.
- Status ativo/inativo.

Valor:

- Padroniza motivos operacionais.
- Reduz justificativas livres.
- Ajuda auditoria, qualidade e análise de perdas.

### 4.15 Regras avançadas e editor de mapa

Este módulo está planejado/em evolução, mas deve ser apresentado como capacidade do produto.

Funcionalidades:

- Regras de slotting.
- Estratégias de armazenagem fixa, dinâmica ou híbrida.
- Estratégias avançadas de picking e ondas.
- Editor paramétrico de planta.
- Integração da planta configurada com a visualização 3D operacional.

Valor:

- Permite otimizar o armazém conforme giro, família, restrição física, temperatura e segregação.

### 4.16 Auditoria de configuração

Este módulo está planejado/em evolução, mas deve ser apresentado como capacidade do produto.

Funcionalidades:

- Log de alteração de configuração.
- Registro de quem alterou, o que alterou, quando e em qual escopo.
- Histórico de parâmetros, permissões, cadastros críticos e regras.

Valor:

- Dá segurança para operações com governança, compliance e múltiplos responsáveis.

---

## 5. Módulos do `wms-frontend`

Este app deve ser apresentado como a **torre de controle operacional** do WMS.

### 5.1 Login e seleção de perfil operacional

Funcionalidades:

- Entrada no sistema por usuário.
- Perfis de demonstração por vertente: e-commerce, indústria e 3PL.
- Seleção de contexto operacional.

Valor:

- Permite demonstrar como o mesmo WMS se adapta a diferentes tipos de operação.

### 5.2 Dashboard operacional

Funcionalidades:

- Visão do turno.
- KPIs principais.
- Fluxo recebido vs. expedido.
- Status dos pedidos.
- Produtividade semanal em linhas/hora.
- Ocupação por zona.
- Fila de tarefas ativa.

KPIs demonstráveis:

- Acuracidade: 99,4%.
- Produtividade: 142 linhas/hora.
- OTIF: 97,8%.
- Ocupação: 81%.
- Dock-to-stock: 2,4h.
- Divergência: 0,6%.
- Ciclo do pedido: 3,1h.

Mensagem:

> O dashboard transforma o CD em uma operação monitorável em tempo real.

### 5.3 Recebimento / Inbound

Funcionalidades:

- Agendamento.
- Chegada na doca.
- Conferência cega.
- Conferência por NF-e ou ASN.
- Bipagem de produto.
- Contagem de quantidade.
- Tratamento de divergência.
- Registro de falta, sobra, item trocado ou avaria.
- Foto em ocorrência.
- Etiquetagem e liberação para putaway.

Fluxo sugerido para slide:

`Agendamento → Doca → Conferência cega → Divergência → Etiquetagem → Staging`

Valor:

- Reduz erro no recebimento.
- Garante rastreabilidade desde a entrada.
- Evita que divergências contaminem estoque e faturamento.

### 5.4 Endereçamento / Putaway

Funcionalidades:

- Fila de tarefas de putaway.
- Origem em staging.
- Sugestão de endereço pelo sistema.
- Validação por bipagem do destino.
- Endereço alternativo quando o sugerido está ocupado ou indisponível.
- Conclusão da tarefa e disponibilização do estoque.

Fluxo:

`Item em staging → Sistema sugere endereço → Operador transporta → Bipa destino → Estoque disponível`

Valor:

- Aumenta acuracidade do estoque.
- Reduz movimentação desnecessária.
- Sustenta endereçamento dinâmico.

### 5.5 Cross-docking

Funcionalidades:

- Identificação de mercadoria que entra e sai sem armazenagem.
- Triagem direta para doca de saída.
- Controle de origem, doca de entrada, doca de saída, quantidade e destino.
- Conclusão da triagem.

Fluxo:

`Recebimento → Triagem → Doca de saída → Expedição`

Valor:

- Acelera transferência, distribuição e fulfillment.
- Reduz ocupação de estoque.

### 5.6 Gestão de estoque

Funcionalidades:

- Consulta por SKU, descrição, endereço, lote, validade e owner.
- Filtros por status.
- Controle de estoque disponível, reservado, quarentena, avaria e qualidade.
- Visualização por endereço.
- Controle de lote e validade.
- Apoio a FEFO.
- Bloqueio, liberação e alteração de status.

Valor:

- O gestor sabe exatamente onde está cada produto, em qual status e de qual cliente.

### 5.7 Planta 3D do armazém

Funcionalidades:

- Visualização 3D da estrutura de armazenagem.
- Endereços por ruas, colunas e níveis.
- Ocupação por posição.
- Cores por status.
- Seleção de posições.
- Foco visual em endereços.
- Execução de putaway diretamente sobre a planta.
- Identificação de posições livres e ocupadas.

Valor:

- Facilita entendimento da ocupação.
- Ajuda supervisores a tomar decisões rápidas.
- Torna a operação mais visual em apresentações comerciais.

### 5.8 Inventário rotativo

Funcionalidades:

- Geração de contagens por endereço.
- Contagem cega.
- Recontagem em caso de divergência.
- Ajuste com aprovação.
- Status de pendente, divergente e ajustado.

Fluxo:

`Sistema gera contagem → Operador conta cego → Divergência? → Recontagem → Ajuste com aprovação`

Valor:

- Mantém acuracidade sem parar a operação.
- Reduz necessidade de inventário geral.

### 5.9 Reabastecimento / Replenishment

Funcionalidades:

- Identificação de endereço de picking abaixo do mínimo.
- Geração de tarefa de reposição.
- Movimento do pulmão para picking.
- Validação de origem e destino por bipagem.
- Conclusão da reposição.

Fluxo:

`Picking abaixo do mínimo → Tarefa gerada → Move do pulmão → Bipa origem e destino → Confirma`

Valor:

- Evita ruptura durante picking.
- Reduz paradas e picking parcial.

### 5.10 Picking / Separação

Funcionalidades:

- Gestão de ondas.
- Estratégias: discreto, batch, wave, zona e cluster.
- Priorização por SLA.
- Rota otimizada.
- Progresso da onda.
- Tratamento de exceções.

Estratégias que devem aparecer na apresentação:

- **Discreto:** um pedido por vez.
- **Batch:** vários pedidos com mesmo SKU.
- **Wave:** pedidos agrupados por corte, rota ou horário.
- **Zona:** operadores por região do armazém.
- **Cluster:** separação de múltiplos pedidos simultaneamente.

Valor:

- Picking é o coração do outbound. O módulo aumenta produtividade e reduz erro de separação.

### 5.11 Packing e Expedição

Funcionalidades:

- Conferência de saída.
- Re-bipagem dos itens.
- Cubagem e embalagem.
- Geração de etiqueta.
- Romaneio.
- Conferência de carregamento.
- Despacho.

Fluxo:

`Itens separados → Conferência → Cubagem → Etiqueta → Romaneio → Carregamento → Despacho`

Valor:

- Última barreira contra envio errado.
- Organiza transportadora, rota, volumes e carregamento.

### 5.12 Fila de tarefas e interleaving

Funcionalidades:

- Fila única priorizada.
- Tarefas por tipo: putaway, picking, reabastecimento, contagem e cross-docking.
- Prioridade alta, média e baixa.
- Assumir tarefa.
- Concluir tarefa.
- Organização por SLA.
- Interleaving de tarefas.

Valor:

- O sistema decide a próxima melhor tarefa.
- Reduz deslocamento vazio.
- Aumenta produtividade operacional.

### 5.13 Coletor RF — simulador comercial

Este módulo aparece como simulador, mas deve ser apresentado como demonstração da experiência de scan-to-confirm.

Funcionalidades:

- Simulação de fluxo de coletor.
- Seleção de atividade.
- Passos guiados.
- Validação de código.
- Erro visual quando o código está incorreto.
- Conclusão de tarefa.

Valor:

- Ajuda a explicar para decisores como o operador executa na prática.
- Serve para treinamento e pré-venda.

Observação para apresentação:

- A execução oficial do operador fica no app mobile.
- No web, este módulo é útil para demonstrar o conceito em uma tela de computador.

### 5.14 Faturamento de serviços 3PL

Funcionalidades:

- Cobrança por owner/cliente.
- Armazenagem por palete/m²/dia.
- Movimentação de entrada.
- Movimentação de saída.
- Picking por linha/pedido.
- Serviços de valor agregado.
- Total por cliente.

Valor:

- Transforma operação logística em faturamento auditável.
- Essencial para operadores logísticos 3PL.

### 5.15 Relatórios e KPIs

Funcionalidades:

- Indicadores consolidados.
- Acuracidade de inventário.
- Produtividade por operador.
- OTIF.
- Ocupação.
- Tempo de ciclo de pedido.
- Taxa de divergência.
- Dock-to-stock.
- Tendências e comparativos.

Valor:

- Apoia gestão, melhoria contínua e prestação de contas.

### 5.16 Integrações

Funcionalidades:

- ERP.
- TMS / transportadoras.
- Marketplaces.
- EDI.
- Correios e transportadoras.
- Status de conexão.
- Última sincronização.
- Quantidade de registros processados.
- Identificação de erro de integração.

Exemplos demonstráveis:

- SAP ERP.
- TMS Frete Fácil.
- Mercado Livre.
- Shopee.
- EDI Carrefour.
- Correios.

Valor:

- O WMS se conecta ao ecossistema da empresa e reduz digitação manual.

### 5.17 Transição operacional e go-live

Este módulo aparece como demo, mas deve ser apresentado como módulo completo de implantação e segurança operacional.

Funcionalidades:

- Planejamento da virada operacional.
- Checklist de implantação.
- Simulação de go-live.
- Plano de contingência.
- Fallback por corredor, owner ou área.
- Visão para diretoria, dono do armazém e gestor de implantação.

Valor:

- Mostra maturidade de implantação.
- Reduz risco percebido na troca de sistema.

### 5.18 Configurações / Regras vigentes

Funcionalidades:

- Visão somente leitura das regras efetivas.
- Exibição dos parâmetros consumidos pela operação.
- Indicação de origem da regra: global, CD ou owner.
- Demonstração de que o operacional lê regras definidas no admin.

Valor:

- Supervisor entende a regra vigente sem alterar configuração crítica.

---

## 6. Módulos do `wms-mobile`

Este app deve ser apresentado como o **coletor do operador de chão**.

Princípio de UX:

> O operador recebe tarefas, não navega menus. Cada tela mostra uma instrução clara, com botão grande, cor, ícone e confirmação por bipagem.

### 6.1 Login do operador

Funcionalidades:

- Seleção visual do operador.
- PIN numérico.
- Entrada rápida sem digitação complexa.

Valor:

- Login em poucos toques.
- Adequado ao ambiente de armazém.

### 6.2 Home de atividades

Funcionalidades:

- Grade de atividades operacionais.
- Contagem de tarefas por fluxo.
- Cores e ícones por atividade.

Atividades:

- Separar.
- Receber.
- Guardar.
- Abastecer.
- Conferir.
- Contar.

Valor:

- O operador vê apenas atividades do chão de armazém, sem complexidade administrativa.

### 6.3 Lista de tarefas

Funcionalidades:

- Fila de tarefas por fluxo.
- Priorização visual.
- Contexto da tarefa.
- Indicação de urgência.

Valor:

- Direciona o operador para o trabalho certo.

### 6.4 Motor de fluxo / execução guiada

Funcionalidades:

- Uma instrução por tela.
- Scan-to-confirm.
- Validação de endereço.
- Validação de produto.
- Confirmação de quantidade.
- Progresso por etapas.
- Feedback visual e tátil.

Exemplo de picking:

1. Vá até o endereço.
2. Bipe o endereço.
3. Bipe o produto.
4. Confirme a quantidade.
5. Leve para packing.
6. Conclua a tarefa.

Valor:

- Reduz erro humano.
- Elimina dependência de papel.
- Padroniza execução.

### 6.5 Ocorrências

Funcionalidades:

- Registro de problemas sem sair do fluxo.
- Motivos: falta, sobra, avaria, local cheio, local vazio e item trocado.
- Foto opcional/obrigatória conforme motivo.
- Continuidade da tarefa após registro.

Valor:

- Exceção vira dado estruturado.
- Supervisor recebe informação acionável.

### 6.6 Tela de sucesso

Funcionalidades:

- Confirmação de tarefa concluída.
- Feedback visual.
- Próxima tarefa ou retorno ao início.

Valor:

- Fecha o ciclo de execução com clareza.

### 6.7 Recursos de usabilidade operacional

Funcionalidades:

- Botões grandes.
- Fonte grande.
- Feedback háptico.
- Uso de cor, ícone e texto.
- Fluxo simples para uso com luva, ruído e pressão de tempo.
- Preparação para operação offline-first.

Valor:

- Experiência adequada para armazém real, não apenas para escritório.

---

## 7. Jornada ponta a ponta sugerida para demonstração

Esta sequência é ideal para transformar em um roteiro de apresentação.

### Jornada 1 — Configurar, operar e executar

1. Abrir o `wms-admin-business`.
2. Mostrar cadastros: Produtos, Owners, Armazéns.
3. Mostrar Endereços e Zonas.
4. Mostrar Parâmetros: conferência cega, FEFO, interleaving e estratégia de picking.
5. Mostrar Perfis e permissões.
6. Ir para o `wms-frontend`.
7. Abrir Dashboard operacional.
8. Abrir Recebimento e mostrar uma NF-e/ASN em conferência.
9. Registrar uma divergência.
10. Mostrar Putaway gerado a partir do recebimento.
11. Abrir Planta 3D e mostrar ocupação/endereço.
12. Abrir Picking e mostrar ondas.
13. Abrir Fila de Tarefas.
14. Ir para o `wms-mobile`.
15. Executar uma tarefa de picking com bipagem.
16. Registrar ocorrência no mobile.
17. Voltar ao web para mostrar supervisão e indicadores.

Mensagem:

> A apresentação mostra que o WMS não é uma coleção de telas isoladas. Ele conta a história completa da operação.

### Jornada 2 — Recebimento com divergência

Fluxo:

`NF-e/ASN → Doca → Conferência cega → Produto bipado → Quantidade divergente → Ocorrência → Liberação parcial → Putaway`

Pontos de valor:

- Redução de fraude e viés pela conferência cega.
- Ocorrência registrada com motivo e quantidade.
- Rastreabilidade do problema desde a entrada.

### Jornada 3 — Picking com SLA

Fluxo:

`Onda liberada → Tarefa priorizada → Operador recebe no coletor → Bipa endereço → Bipa produto → Confirma quantidade → Leva ao packing`

Pontos de valor:

- Priorização por SLA.
- Rota otimizada.
- Scan-to-confirm.
- Redução de erro de separação.

### Jornada 4 — 3PL e faturamento

Fluxo:

`Owner → Estoque segregado → Serviços executados → Fatura por armazenagem, movimentação, picking e VAS`

Pontos de valor:

- Multi-owner.
- Relatórios por cliente.
- Cobrança por serviço logístico.
- Auditoria contratual.

### Jornada 5 — Inventário rotativo

Fluxo:

`Sistema gera contagem → Operador conta cego → Divergência → Recontagem → Ajuste com aprovação e reason code`

Pontos de valor:

- Acuracidade sem parar a operação.
- Alçada e aprovação.
- Motivo rastreável.

---

## 8. Mapa completo de módulos para slide

| Área | Módulos |
|---|---|
| Administração | Painel, Produtos, Armazéns, Owners, Fornecedores, Transportadoras, Migração de Dados |
| Estrutura Física | Zonas, Endereços, Docas, Planta 2D, Planta 3D |
| Regras | Parâmetros, Estratégias de picking, FEFO, Conferência cega, Interleaving, Offline-first |
| Governança | Usuários, Perfis, Permissões, Alçadas, Reason Codes, Auditoria |
| Inbound | Recebimento, Conferência cega, Divergências, Etiquetagem, Putaway, Cross-docking |
| Estoque | Posição por endereço, lote, validade, status, bloqueio, quarentena, qualidade, inventário |
| Outbound | Picking, Ondas, Reabastecimento, Packing, Expedição, Romaneio, Carregamento |
| 3PL | Multi-owner, segregação, faturamento de serviços, relatórios por cliente |
| Integrações | ERP, TMS, marketplaces, EDI, transportadoras, Correios |
| Mobile | Login, tarefas, scan-to-confirm, ocorrências, sucesso |
| Gestão | Dashboard, KPIs, relatórios, transição operacional, go-live |

---

## 9. Diferenciais competitivos

### 9.1 Operador orientado por tarefa

Em vez de menus complexos, o operador recebe a próxima tarefa. Isso reduz treinamento, erro e tempo parado.

### 9.2 Scan-to-confirm

Cada etapa crítica exige confirmação: endereço, produto, lote e quantidade. O sistema valida contra o esperado.

### 9.3 Parametrização flexível

Regras como FEFO, conferência cega, interleaving, tolerância de divergência e estratégia de picking são parâmetros. Isso permite adaptar a operação sem reescrever o sistema.

### 9.4 Multi-owner e multi-CD

O sistema já nasce preparado para múltiplos clientes e múltiplos armazéns, requisito crítico para 3PL e redes de distribuição.

### 9.5 Rastreabilidade

Todo movimento pode ser rastreado por produto, endereço, lote, validade, operador, owner, motivo e horário.

### 9.6 Governança por ação

Permissões são definidas por ação, como liberar quarentena, ajustar estoque ou expedir romaneio. Isso é mais seguro que liberar apenas telas.

### 9.7 Visualização operacional

Dashboard, relatórios, fila de tarefas e planta 3D tornam a operação visível e gerenciável.

### 9.8 Implantação com transição controlada

O módulo de transição operacional permite apresentar plano de virada, contingência e fallback, reduzindo risco de implantação.

---

## 10. Dados de demonstração disponíveis

### Armazéns

- CD Cajamar — SP — modo completo.
- CD Duque de Caxias — RJ — modo completo.
- Loja Jaboatão — PE — modo simples.

### Owners

- NanoTech Eletrônicos.
- Bella Cosméticos.
- Verde Alimentos.
- Forte Indústria.

### Produtos exemplares

- Fone Bluetooth Pulse X.
- Carregador Turbo 30W.
- Cabo USB-C 2m.
- Power Bank 10000mAh.
- Sérum Vitamina C 30ml.
- Azeite Extra Virgem 500ml.
- Grão de Bico 1kg.
- Resina PET grau A.

### Exemplos de integrações

- SAP ERP.
- TMS Frete Fácil.
- Mercado Livre.
- Shopee.
- EDI Carrefour.
- Correios.

### Operadores mobile

- Carlos.
- Marina.
- João.
- Ana.

---

## 11. Sugestão de ordem final da apresentação

1. Capa.
2. Problema do mercado.
3. Visão geral da solução.
4. Arquitetura em três camadas.
5. Admin Business: cadastros e configuração.
6. Estrutura física: armazéns, zonas, endereços e docas.
7. Parâmetros e governança.
8. Dashboard operacional.
9. Recebimento.
10. Putaway e planta 3D.
11. Estoque e inventário.
12. Picking e ondas.
13. Reabastecimento.
14. Packing e expedição.
15. Mobile/coletor.
16. Ocorrências e exceções.
17. 3PL e faturamento de serviços.
18. Integrações.
19. Relatórios e KPIs.
20. Transição operacional e go-live.
21. Diferenciais competitivos.
22. Encerramento com jornada ponta a ponta.

---

## 12. Textos curtos prontos para usar em slides

### Visão geral

O Integra WMS centraliza a operação logística em uma plataforma única, conectando cadastros, regras, execução no armazém, indicadores e integrações.

### Operação guiada

O operador recebe tarefas claras no coletor, confirma cada etapa por bipagem e registra exceções sem sair do fluxo.

### Gestão em tempo real

Supervisores acompanham recebimento, estoque, picking, packing, expedição, tarefas e KPIs em uma torre de controle operacional.

### Governança

Permissões, alçadas, reason codes e parâmetros garantem controle sobre quem pode executar, aprovar ou alterar cada ação crítica.

### 3PL

Para operadores logísticos, o sistema controla múltiplos owners, segrega estoque por cliente e calcula faturamento por serviço executado.

### Integrações

O WMS se conecta a ERP, TMS, marketplaces, EDI e transportadoras, reduzindo digitação manual e mantendo dados sincronizados.

### Implantação

A transição operacional é conduzida com plano de virada, checklist, contingência e possibilidade de fallback por área, corredor ou owner.

---

## 13. Perguntas que a apresentação deve responder

### O sistema controla lote e validade?

Sim. O cadastro de SKU permite controle de lote e validade, e a operação pode aplicar FEFO para priorizar o lote com vencimento mais próximo.

### Funciona para 3PL?

Sim. O sistema tem owners, multi-CD, segregação por cliente, faturamento de serviços e relatórios por cliente.

### O operador precisa aprender muitas telas?

Não. No mobile, o operador recebe uma tarefa por vez, com instruções simples, botões grandes e confirmação por leitura de código.

### Como o sistema evita erro de separação?

Com scan-to-confirm de endereço, produto, lote e quantidade, além de rotas orientadas e tratamento de exceções dentro do fluxo.

### Como são tratadas divergências?

Divergências são registradas como ocorrências com motivo, quantidade, observação e foto quando necessário. A aprovação pode depender de alçada.

### Dá para integrar com ERP e transportadoras?

Sim. O módulo de integrações cobre ERP, TMS, marketplaces, EDI e transportadoras.

### Como o sistema apoia a implantação?

Com migração de dados, configuração por parâmetros, usuários/perfis, estrutura física e módulo de transição operacional/go-live.

---

## 14. Observações para quem criará a apresentação

- Tratar todos os módulos citados como capacidades completas do produto, inclusive os que hoje aparecem como demo, mock ou em desenvolvimento.
- Evitar linguagem técnica de código. Focar em problema, solução, fluxo operacional e valor para o cliente.
- Usar a divisão em três apps como linha narrativa principal.
- Dar destaque à jornada ponta a ponta: admin configura, web supervisiona, mobile executa.
- Usar prints do Dashboard, Recebimento, Planta 3D, Picking, Expedição, Parâmetros, Perfis e Mobile.
- Para decisores, enfatizar KPIs, rastreabilidade, redução de erro, produtividade e segurança de implantação.
- Para operação, enfatizar tarefa guiada, bipagem, exceções e simplicidade do coletor.

---

## 15. Resumo executivo para fechamento

O Integra WMS é uma solução completa para gestão de armazéns, cobrindo desde a configuração do ambiente até a execução física das tarefas no chão de operação. A plataforma combina governança administrativa, controle operacional em tempo real e execução mobile orientada por tarefas.

Com módulos para recebimento, putaway, estoque, inventário, picking, reabastecimento, packing, expedição, faturamento 3PL, integrações, relatórios e go-live, o sistema oferece uma base robusta para operações de e-commerce, indústria, distribuição e operadores logísticos.

Mensagem final sugerida:

> O Integra WMS entrega controle, produtividade e rastreabilidade em toda a cadeia operacional do armazém, conectando quem configura, quem supervisiona e quem executa.
