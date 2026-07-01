# Tracking_Encomenda

## Objetivo

Criar um tracking leve e funcional para encomendas, pallets, volumes e itens, capaz de comparar o que foi planejado contra o que foi realmente lido pelo WMS/TMS.

O ponto central e simples:

- o plano diz onde a carga deveria estar;
- os eventos dizem onde ela foi vista;
- o estado compara os dois;
- as regras classificam risco e proxima acao;
- o dossie explica a conclusao.

## Modelo mental

```txt
CTE -> NFs -> pedidos/itens -> SKUs -> volumes/etiquetas -> pallets -> movimentacoes -> checklists -> evidencias -> financeiro -> decisao sugerida
```

## Entidades leves

### Unidade rastreavel

Representa o objeto que pode ser acompanhado:

- item;
- volume;
- pallet;
- CTE;
- carga.

Campos essenciais:

- `id`;
- `tipo`;
- `referencias`: CTE, NF, pedido, SKU, volume, pallet;
- `cliente`;
- `valor`;
- `prazoCliente`;
- `toleranciaMinutos`.

### Plano esperado

Define onde a unidade deveria estar em cada janela.

Campos essenciais:

- `unitId`;
- `localEsperado`;
- `inicioJanela`;
- `fimJanela`;
- `acaoEsperada`;
- `responsavelEsperado`;
- `proximoLocal`.

Exemplo:

```txt
PAL-001 | CD Sao Paulo | 18/06 00:00 | 18/06 23:59 | receber/conferir
PAL-001 | Em transito  | 19/06 00:00 | 19/06 23:59 | transferir
PAL-001 | CD Curitiba  | 20/06 00:00 | 20/06 23:59 | receber
```

### Evento real

Tudo que acontece vira evento append-only:

- etiqueta criada;
- bipagem;
- check-in;
- checklist de chegada;
- checklist de saida;
- foto;
- lacre;
- carregamento;
- ocorrencia;
- comprovante.

Campos essenciais:

- `unitId`;
- `eventType`;
- `local`;
- `timestamp`;
- `origem`;
- `operador`;
- `deviceId`;
- `evidenceId`;
- `confianca`.

### Estado calculado

Resultado da comparacao entre plano e eventos:

- `localAtual`;
- `localEsperado`;
- `ultimoEvento`;
- `status`;
- `atrasoMinutos`;
- `proximaAcao`;
- `responsavelProvavel`;
- `geraIndenizacaoAutomatica`.

## Regras iniciais

1. Se `localAtual` for igual a `localEsperado`, status `no_prazo`.
2. Se `localAtual` for diferente de `localEsperado` e ainda houver tempo operacional para corrigir, status `local_incorreto_corrigivel`.
3. Se `localAtual` for diferente de `localEsperado` e o prazo do cliente estiver em risco, status `local_incorreto_risco_sla`.
4. Se o cliente cobrar extravio, mas houver localizacao confirmada, status `cobranca_contestavel_carga_localizada`.
5. Se houver dano, avaria, validade vencida, violacao ou perda de valor, status `analise_indenizacao`.

## Exemplo Sao Paulo / Curitiba

Se um pallet deve estar em Sao Paulo em 18/06 e em Curitiba em 20/06:

- em 18/06, aparecer em Sao Paulo e correto;
- em 20/06, ainda aparecer em Sao Paulo e divergencia;
- se ainda ha tempo de redirecionar, vira ocorrencia operacional;
- se o SLA do cliente vai estourar, vira risco de indenizacao;
- se o cliente cobrou extravio, mas o sistema localizou em Sao Paulo, a cobranca de perda e contestavel.

## Resultado esperado no P&P

O modulo P&P usa o tracking como base para o dossie:

- localizar a carga;
- provar a ultima leitura confiavel;
- comparar plano x real;
- indicar se corrige, contesta ou analisa indenizacao;
- sugerir responsavel provavel;
- sugerir proxima tarefa operacional;
- alimentar financeiro apenas quando houver decisao ou regra contratual.
