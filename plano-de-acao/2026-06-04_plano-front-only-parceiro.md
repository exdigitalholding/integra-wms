# Plano Front-Only Para Apresentação a Parceiro

Data: 2026-06-04

## Objetivo desta fase

Montar uma demonstração coerente, sem backend e sem API, em que:

- o `admin` define a regra
- o `frontend` mostra a operação do supervisor
- o `mobile` executa a tarefa do operador

Tudo com dados consistentes entre os três apps.

## História única da apresentação

Cenário sugerido:

1. O parceiro vê o `wms-admin-business` configurando o armazém, produtos, owners e parâmetros.
2. Em seguida vê o `wms-frontend` acompanhando uma operação viva no `CD Cajamar`.
3. Depois vê o `wms-mobile` executando a tarefa que nasceu dessa operação.
4. Por fim entende que a API futura apenas vai plugar persistência e integração nessa arquitetura já madura.

## Dados canônicos desta demo

Os dados compartilhados ficam em:

- `wms-shared-demo/types.ts`
- `wms-shared-demo/data.ts`

Eles definem:

- armazéns
- owners
- SKUs
- endereços
- perfis e usuários
- parâmetros efetivos
- dispositivos
- tarefas operacionais
- motivos de ocorrência

## Jornada ponta a ponta sugerida

1. No `admin`, mostrar `Parâmetros` e `Perfis`.
2. No `frontend`, abrir `Fila de tarefas` e `Recebimento`.
3. Explicar que a tarefa `T-9011` gera staging.
4. Mostrar `Putaway` e a tarefa `T-9001`.
5. Mostrar `Picking` e a onda ligada à tarefa `T-9003`.
6. Abrir o `mobile` e executar `T-9003`.
7. Abrir ocorrência no mobile.
8. Voltar ao `frontend` para mostrar a supervisão da exceção.

## MVP front-only fechado para seguir

- Recebimento
- Putaway
- Estoque
- Inventário rotativo
- Picking
- Reabastecimento
- Packing / Expedição
- Ocorrência
- Tarefa
- Permissão / perfil

## O que não entra agora

- backend
- API
- sincronização real
- leitura real de hardware
- integração real com ERP, TMS ou marketplace

## Critério de pronto para demo comercial

- os três apps contam a mesma história
- os mesmos IDs e entidades aparecem de forma coerente
- não existe tela editando regra no app errado
- botões, modais, toasts e fluxos principais respondem visualmente
- o parceiro entende claramente quem usa cada app
