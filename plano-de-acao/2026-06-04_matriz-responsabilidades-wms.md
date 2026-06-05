# Matriz Oficial de Responsabilidades — Integra WMS

Data: 2026-06-04

## Objetivo

Definir com clareza o papel de cada app antes da API, evitando:

- regra operacional editada no app errado
- bipagem no web quando deveria ser mobile
- telas duplicadas com responsabilidades conflitantes
- demonstrações comerciais com dados desconexos

## Classificações usadas

- `admin`: governa o sistema
- `frontend-supervisor`: acompanha e orquestra a operação
- `mobile-operador`: executa a tarefa no chão
- `demo`: permanece apenas para apresentação, treinamento ou pré-venda
- `remover`: deve sair quando houver tela melhor no app correto

## Matriz por app

| App | Tela / Área | Classificação | Papel correto |
|---|---|---|---|
| `wms-admin-business` | Dashboard | `admin` | mostrar prontidão do armazém, cadastros e governança |
| `wms-admin-business` | Produtos, Owners, Fornecedores, Transportadoras | `admin` | manter cadastro mestre |
| `wms-admin-business` | Armazéns, Zonas, Endereços, Docas | `admin` | modelar estrutura física |
| `wms-admin-business` | Parâmetros | `admin` | definir regras operacionais efetivas |
| `wms-admin-business` | Usuários, Perfis, Reason Codes | `admin` | governar acesso, alçada e exceções |
| `wms-frontend` | Dashboard | `frontend-supervisor` | acompanhar KPIs e estado do turno |
| `wms-frontend` | Recebimento, Putaway, Reabastecimento | `frontend-supervisor` | monitorar e conduzir a operação |
| `wms-frontend` | Estoque, Inventário, Mapa 3D | `frontend-supervisor` | análise, consulta e tomada de decisão |
| `wms-frontend` | Picking, Expedição, Tarefas | `frontend-supervisor` | orquestrar execução e priorização |
| `wms-frontend` | Configurações | `frontend-supervisor` | apenas consultar regras vigentes |
| `wms-frontend` | Coletor RF | `demo` | simulador comercial e de treinamento |
| `wms-mobile` | Login do operador | `mobile-operador` | autenticação operacional simples |
| `wms-mobile` | Home, Lista de tarefas | `mobile-operador` | receber trabalho direcionado |
| `wms-mobile` | FlowScreen | `mobile-operador` | executar scan-to-confirm |
| `wms-mobile` | OccurrenceScreen | `mobile-operador` | registrar exceção sem sair do fluxo |
| `wms-mobile` | SuccessScreen | `mobile-operador` | concluir tarefa e seguir para a próxima |

## Regras de fronteira

1. Qualquer comportamento que muda a regra da operação nasce no `wms-admin-business`.
2. Qualquer ação de bipagem real, contagem e confirmação física pertence ao `wms-mobile`.
3. O `wms-frontend` é a torre de controle do supervisor, não o coletor final.
4. Se uma tela existe em dois apps, uma delas precisa ser marcada explicitamente como `demo`.

## Decisões aprovadas nesta etapa

- `wms-frontend/Configuracoes` passa a ser visão somente leitura.
- `wms-frontend/Coletor` passa a ser assumido como simulador de apresentação.
- os dados demo compartilhados em `wms-shared-demo/` viram a referência única da história comercial.
- a API futura deverá respeitar essa divisão; ela não será o lugar para corrigir escopo errado.
