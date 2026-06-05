# Plano de Ação — Visão Computacional no Recebimento (Avaria + OCR de Validade)

| | |
|---|---|
| **Data de criação** | 2026-06-01 |
| **Sistema alvo** | `wms-adapta/wms-mobile` (coletor React Native / Expo) |
| **Sistema de apoio** | `wms-adapta/wms-admin-business` (chave de configuração) |
| **Feature** | Primeira feature de IA "de verdade": câmera real + modelo de visão para (a) **detectar avaria** e (b) **ler data de validade (OCR)** no recebimento |
| **Autor do plano** | Sessão de arquitetura WMS (Claude / wms-architect) |
| **Status** | Planejado — não implementado |
| **Pré-requisito de leitura** | `wms-adapta/wms-mobile/AGENTS.md` → obriga conferir a doc versionada do Expo SDK 56 em https://docs.expo.dev/versions/v56.0.0/ **antes de escrever código** |

---

## 1. Objetivo

Transformar o botão de foto **fake** (stub) que já existe na tela de ocorrência em uma feature funcional de IA que:

1. **Tira foto de verdade** da mercadoria (hoje não tira).
2. Envia a foto para um **modelo de visão** que devolve dado estruturado:
   - **Modo avaria:** classifica se há dano e qual tipo → preenche/sugere a ocorrência automaticamente, com a foto como prova.
   - **Modo validade:** lê a **data de validade impressa** na embalagem (OCR) e devolve em texto → alimenta o controle FEFO.

### Por que esta feature é a primeira
- **Metade já existe:** a tela, o botão e o ponto na operação já estão prontos (ver §3).
- **Não depende de histórico de dados** — a entrada é a foto tirada na hora (diferente de previsão de demanda, que exigiria meses de operação real).
- **Demonstração forte de "IA de verdade"** para o cliente: apontar a câmera e o sistema ler a validade / detectar o dano sozinho.
- **Risco baixo:** se a IA errar, o operador corrige no dedo; nada fiscal, nada irreversível.
- **Retorno financeiro real:** foto de avaria = prova para *chargeback* ao fornecedor; validade lida corretamente = FEFO correto, evita expedir/vender vencido.

---

## 2. Escopo

### Dentro do escopo
- Captura de foto real no coletor usando `expo-camera`.
- Pipeline de envio da foto a um serviço de visão (com **fallback mock** para funcionar antes do `wms-api` existir).
- **Modo avaria** integrado à tela `OccurrenceScreen.tsx` (MVP).
- **Modo validade (OCR)** disponível como passo opcional no fluxo de **recebimento** (`FlowScreen.tsx`, fluxo `receber`).
- Fila offline: a foto é capturada e a análise pode sincronizar depois (respeita NFR *offline-first*).
- Chave de configuração no `wms-admin-business` para ligar/desligar a feature por armazém (config-as-data).

### Fora do escopo (próximos planos)
- Contagem de volumes por foto.
- Cubagem/volumetria por câmera.
- IA de vídeo (doca/CCTV).
- Treino de modelo próprio (usar modelo de visão de terceiro via API nesta fase).
- Backend `wms-api` completo — aqui só definimos o **contrato** que ele deverá cumprir.

---

## 3. Estado atual (o ponto de partida exato)

Arquivo: `wms-adapta/wms-mobile/src/screens/OccurrenceScreen.tsx`, **linhas 77–86**:

```tsx
{/* anexar foto (mock) */}
<Pressable
  onPress={() => { tapMedio(); setFoto((f) => !f); }}
  style={({ pressed }) => [styles.foto, foto && styles.fotoOn, pressed && { opacity: 0.85 }]}
>
  <Ionicons name={foto ? 'checkmark-circle' : 'camera'} size={26} color={foto ? colors.ok : colors.inkSoft} />
  <Text style={[styles.fotoTxt, foto && { color: colors.ok }]}>
    {foto ? 'Foto anexada' : 'Tirar foto (opcional)'}
  </Text>
</Pressable>
```

**O que faz hoje:** só inverte um booleano `foto` (`useState`, linha 20) e troca o texto. **Não abre câmera, não captura imagem, não persiste nada.** É um placeholder de demonstração.

**Contexto da tela:** registro de ocorrência *dentro do fluxo* (princípio "nunca ligue para o supervisor"). Grade de 6 motivos (`MOTIVOS` em `src/data/mock.ts`, linhas 43–50): `falta`, `sobra`, `avaria`, `cheio`, `vazio`, `trocado`. O operador toca o motivo e envia (`enviar()`, linha 23). A `avaria` é o motivo onde a IA de visão entra primeiro.

### Restrições herdadas do código (NÃO violar)
1. **Stack:** Expo SDK **~56.0.8**, React Native **0.85.3**, React **19.2.3**. Conferir API exata em https://docs.expo.dev/versions/v56.0.0/ antes de codar (mandato do `AGENTS.md`).
2. **Roteador próprio** (`src/navigation/router.tsx`): não há React Navigation. `RouteName = 'login' | 'home' | 'lista' | 'fluxo' | 'ocorrencia' | 'sucesso'`. Navegação por pilha de estado (`navigate`, `back`, `replace`).
3. **Sem backend:** tudo vem de `src/data/mock.ts`. Qualquer chamada de IA precisa de **fallback mock** para rodar no Expo Go hoje.
4. **Offline-first:** armazém tem zona morta de WiFi. A captura **nunca** pode depender de rede no momento do clique.
5. **Scan-to-confirm não pode travar:** a análise de IA é **assíncrona e opcional** — jamais bloqueia o avanço do passo.
6. **UX de baixa alfabetização:** cor + ícone + palavra (nunca só texto), botões ≥ 68px, haptics em toda ação (`src/lib/haptics.ts`).

---

## 4. Arquitetura da solução

### 4.1 Princípio central: a IA é assíncrona e opcional
O operador **captura** a foto (rápido, local, offline) → a foto entra numa **fila** → a **análise** roda quando der (on-device leve OU nuvem quando houver rede). O resultado **sugere**, o operador **confirma**. Em nenhum momento a captura ou o fluxo espera a IA responder.

```
[Operador toca câmera]
        │  (síncrono, offline, < 1s)
        ▼
[expo-camera tira foto] ──► [salva URI local + cria item na fila]
        │
        ▼
[UI mostra "Analisando…" não-bloqueante]   ◄── operador JÁ pode enviar a ocorrência
        │
        ▼  (assíncrono; quando houver rede OU on-device)
[lib/vision.ts → analisarFoto(uri, modo)]
        │
        ├─ modo 'avaria'   → { temDano, tipo, confianca }
        └─ modo 'validade' → { dataValidade, confianca, textoBruto }
        │
        ▼
[UI atualiza com sugestão] ──► operador aceita/corrige
```

### 4.2 Decisão on-device vs nuvem
| Critério | On-device | Nuvem |
|---|---|---|
| Funciona offline | ✅ | ❌ (precisa fila) |
| Latência | baixa | depende de rede |
| Qualidade OCR de validade | média | alta |
| Custo por chamada | zero | por requisição |

**Decisão desta fase:** abstrair atrás de `lib/vision.ts` com **uma interface única** e **duas implementações plugáveis**:
- `visionMock` (default agora) — devolve resultado simulado, permite rodar no Expo Go sem backend.
- `visionRemote` — chama o endpoint do `wms-api` (a definir, §7).
- (Futuro) `visionOnDevice` — modelo leve embarcado, sem trocar o resto do código.

A troca de implementação é por **configuração**, não por reescrita. Mantém o princípio de escala configurável.

### 4.3 Config-as-data (integração com o admin)
A feature liga/desliga por **chave de parâmetro**, não por `if` no código. Seguindo o padrão de `wms-admin-business/src/pages/Parametros.tsx`:

- Chave: `recebimento.visao_ia` — tipo `boolean`.
- `modoSimples`: `false` (padaria não usa).
- `modoCompleto`: `true` (operação grande usa).
- Resolução hierárquica já existente: `owner > cd > global > default` (`lib/parametros.ts`).

Enquanto o `wms-mobile` ainda não lê parâmetros da API, usar uma **flag local** em `src/config/features.ts` (`VISAO_IA_ATIVA = true`) que, no futuro, será substituída pela leitura do parâmetro resolvido.

---

## 5. Decisões técnicas

| Item | Decisão | Observação |
|---|---|---|
| Lib de câmera | `expo-camera` | Conferir API v56 (componente `CameraView` + hook `useCameraPermissions`). **Validar na doc versionada.** |
| Compressão de imagem | `expo-image-manipulator` | Reduz para ~1024px / qualidade 0.6 antes de enfileirar/enviar — economiza banda e acelera IA. |
| Persistência da fila | `expo-file-system` (foto) + `@react-native-async-storage/async-storage` (metadados da fila) | Foto fica no disco; a fila guarda só URI + estado. |
| Serviço de IA (avaria) | Modelo de classificação de imagem (terceiro via API) | Nesta fase, mock; contrato em §7. |
| Serviço de IA (validade) | OCR (terceiro via API) + parser de data PT-BR | Datas tipo `VAL 12/26`, `VALIDADE: 12/2026`, `L1234 V:122026`. |
| Fallback sem rede | `visionMock` | Sempre presente; nunca quebra o fluxo. |

> ⚠️ **Não fixar a API do `expo-camera` de memória.** SDK 56 pode ter assinaturas diferentes de versões antigas (ex.: `Camera` vs `CameraView`, permissões via hook). Abrir https://docs.expo.dev/versions/v56.0.0/sdk/camera/ e seguir a assinatura exata.

---

## 6. Modelo de dados (novos tipos)

Adicionar em `wms-adapta/wms-mobile/src/types.ts`:

```ts
/** Modo de análise de visão solicitado. */
export type ModoVisao = 'avaria' | 'validade';

/** Estado de um item na fila de análise de imagem. */
export type EstadoAnalise = 'capturada' | 'analisando' | 'concluida' | 'erro';

/** Resultado da análise de AVARIA. */
export interface ResultadoAvaria {
  temDano: boolean;
  /** Ex.: 'embalagem amassada', 'molhada', 'rasgada', 'sem dano'. */
  tipo: string;
  /** 0..1 — confiança do modelo. Abaixo do limiar → exibir como "verificar". */
  confianca: number;
}

/** Resultado da análise de VALIDADE (OCR). */
export interface ResultadoValidade {
  /** ISO 'YYYY-MM-DD' quando reconhecida; null se não encontrou. */
  dataValidade: string | null;
  confianca: number;
  /** Texto cru lido (para auditoria / correção manual). */
  textoBruto: string;
}

/** Item da fila de captura+análise. */
export interface ItemVisao {
  id: string;
  uriLocal: string;        // caminho da foto no dispositivo
  modo: ModoVisao;
  estado: EstadoAnalise;
  criadoEm: number;        // epoch ms
  /** Vínculo opcional com a tarefa/passo de origem. */
  tarefaId?: string;
  resultadoAvaria?: ResultadoAvaria;
  resultadoValidade?: ResultadoValidade;
  erro?: string;
}
```

---

## 7. Contrato do serviço de IA (o que o `wms-api` deverá cumprir)

Definir já o contrato, mesmo que hoje só exista o mock.

### 7.1 Endpoint
```
POST /api/visao/analisar
Content-Type: multipart/form-data
```

**Request (campos do form-data):**
| Campo | Tipo | Descrição |
|---|---|---|
| `imagem` | file | JPEG comprimido (~1024px, q0.6) |
| `modo` | string | `'avaria'` \| `'validade'` |
| `tarefaId` | string? | tarefa de origem (rastreabilidade) |
| `armazemId` | string? | para resolver config/modelo por armazém |

**Response 200 (modo avaria):**
```json
{
  "modo": "avaria",
  "resultado": { "temDano": true, "tipo": "embalagem molhada", "confianca": 0.91 }
}
```

**Response 200 (modo validade):**
```json
{
  "modo": "validade",
  "resultado": { "dataValidade": "2026-12-31", "confianca": 0.87, "textoBruto": "VAL 12/2026" }
}
```

**Erros:** `4xx/5xx` → cliente marca item como `erro` e mantém a foto na fila para retry. **Nunca** propaga erro que trave o fluxo do operador.

### 7.2 Regra fiscal / segurança (obrigatória)
- A IA **sugere**, o humano **confirma**. A data de validade lida por OCR **nunca** é gravada como verdade sem o operador validar.
- Nenhuma decisão fiscal (NCM/CST/CFOP) é feita por IA aqui. Escopo é só avaria + validade.

---

## 8. Passo a passo de implementação

> Sequência pensada para entregar valor cedo: **Fase A→D** entregam a avaria funcionando ponta a ponta (MVP); **Fase E** adiciona validade reaproveitando o mesmo pipe; **Fase F** liga no admin.

### Fase A — Câmera real (substituir o stub)
**A1.** Instalar dependências (conferir comandos/ versões na doc v56):
```
npx expo install expo-camera expo-image-manipulator expo-file-system @react-native-async-storage/async-storage
```
**A2.** Criar `src/components/CameraCapture.tsx`:
- Componente modal de câmera usando `expo-camera` (API v56).
- Pede permissão via hook de permissões; se negada, mostra estado claro com botão "permitir".
- Botão grande de captura (≥ 68px, padrão de `BigButton`).
- Ao capturar: comprime com `expo-image-manipulator`, devolve `uri` via callback `onCapturar(uri: string)`.
- Botão "cancelar" volta sem foto.
- Respeitar tema (`src/theme/theme.ts`) e haptics (`tapMedio`, `sucesso`).

**A3.** Adicionar permissão de câmera ao `app.json` (campo `expo.plugins` / `ios.infoPlist.NSCameraUsageDescription` / `android.permissions`) — texto em PT: "O coletor usa a câmera para registrar avarias e ler validade no recebimento."

### Fase B — Fila de captura + análise offline
**B1.** Criar `src/lib/filaVisao.ts`:
- `enfileirar(item: Omit<ItemVisao,'id'|'estado'|'criadoEm'>): ItemVisao` — salva metadados em AsyncStorage, estado `'capturada'`.
- `listar(): ItemVisao[]`, `atualizar(id, patch)`, `remover(id)`.
- `processarPendentes()` — para cada item `'capturada'`/`'erro'`, marca `'analisando'`, chama `vision.analisarFoto`, grava resultado, marca `'concluida'`/`'erro'`. Chamável ao recuperar conectividade ou manualmente.

**B2.** Criar `src/config/features.ts`:
```ts
export const VISAO_IA_ATIVA = true;            // futuro: vem do parâmetro recebimento.visao_ia
export const VISAO_LIMIAR_CONFIANCA = 0.7;     // abaixo disso → exibir como "verificar"
export const VISAO_IMPL: 'mock' | 'remote' = 'mock';
```

### Fase C — Camada de visão (a IA, com mock plugável)
**C1.** Criar `src/lib/vision.ts`:
```ts
export interface Vision {
  analisarFoto(uriLocal: string, modo: ModoVisao, ctx?: { tarefaId?: string; armazemId?: string })
    : Promise<ResultadoAvaria | ResultadoValidade>;
}
```
**C2.** Implementar `visionMock`:
- `avaria` → devolve `{ temDano: true, tipo: 'embalagem amassada', confianca: 0.88 }` após `setTimeout` curto (simula latência).
- `validade` → devolve `{ dataValidade: '2026-12-31', confianca: 0.85, textoBruto: 'VAL 12/2026' }`.
**C3.** Implementar `visionRemote` (não ativo agora): `fetch` multipart para `POST /api/visao/analisar` (§7), com timeout e tratamento de erro → lança para a fila marcar `'erro'`.
**C4.** `export const vision = VISAO_IMPL === 'remote' ? visionRemote : visionMock;`
**C5.** Criar `src/lib/dataValidade.ts`: parser PT-BR de validade — recebe `textoBruto`, devolve ISO `YYYY-MM-DD` ou `null`. Cobrir `MM/AA`, `MM/AAAA`, `DD/MM/AAAA`, `V:122026`. (Usado quando a impl remota devolver só texto.)

### Fase D — Integrar AVARIA na tela de ocorrência (MVP ponta a ponta)
**D1.** Editar `src/screens/OccurrenceScreen.tsx`:
- Trocar o `useState foto:boolean` por estado real: `fotoUri: string | null` + `analise: ItemVisao | null`.
- Substituir o `Pressable` das linhas 77–86 por um bloco que:
  - Se `VISAO_IA_ATIVA` e sem foto → botão "Fotografar avaria" abre `CameraCapture`.
  - Ao capturar → `enfileirar({ uriLocal, modo:'avaria', tarefaId })`, dispara `processarPendentes()` (não-bloqueante), mostra thumbnail + estado.
  - Enquanto `'analisando'` → "Analisando…" (não bloqueia o botão "Enviar e continuar").
  - Em `'concluida'` → se `temDano` e `confianca ≥ limiar`, **pré-selecionar o motivo `avaria`** (`setSel('avaria')`) e exibir "IA detectou: {tipo}". Abaixo do limiar → "Verifique: possível {tipo}" sem auto-selecionar.
- O `enviar()` (linha 23) passa a incluir `fotoUri` e o `ItemVisao.id` no payload da ocorrência (hoje só faz `setEnviado(true)`; quando houver API, enviar de verdade).
**D2.** Garantir que **sem foto** a tela funciona igual a hoje (feature é opcional/aditiva).

### Fase E — OCR de VALIDADE no fluxo de recebimento
**E1.** Em `src/data/mock.ts`, no passo de produto do fluxo `receber` (tarefa `T-110`, linha 92), permitir um passo/ação opcional de "ler validade". Estratégia mínima: adicionar campo opcional ao tipo `Passo` em `types.ts`:
```ts
/** Quando true, o passo oferece "ler validade por foto" (OCR). */
capturaValidade?: boolean;
```
**E2.** Em `src/screens/FlowScreen.tsx`, quando o passo tiver `capturaValidade`, exibir botão secundário "Ler validade (foto)" que abre `CameraCapture` em `modo:'validade'`, enfileira, e ao concluir mostra a data lida para o operador **confirmar/corrigir** (campo editável). Nunca grava sem confirmação.
**E3.** A data confirmada acompanha o passo de recebimento (no futuro, vai para o lote/FEFO via API).

### Fase F — Chave de configuração no admin
**F1.** Em `wms-admin-business/src/lib/mock.ts`, adicionar a `DefinicaoParametro`:
```ts
{ chave: 'recebimento.visao_ia', label: 'Visão IA no recebimento (avaria + validade)',
  descricao: 'Habilita captura de foto com análise de avaria e leitura de validade por OCR.',
  grupo: 'Recebimento', tipo: 'boolean', default: false,
  modoSimples: false, modoCompleto: true }
```
**F2.** Validar que aparece em `Parametros.tsx` com resolução hierárquica (global/CD/owner) — sem código novo, é só dado (config-as-data).
**F3.** (Futuro) `wms-mobile` lê esse parâmetro resolvido da API e substitui `VISAO_IA_ATIVA` em `src/config/features.ts`.

---

## 9. Arquivos afetados (resumo)

| Ação | Caminho | Fase |
|---|---|---|
| **Novo** | `wms-mobile/src/components/CameraCapture.tsx` | A |
| **Novo** | `wms-mobile/src/lib/vision.ts` | C |
| **Novo** | `wms-mobile/src/lib/filaVisao.ts` | B |
| **Novo** | `wms-mobile/src/lib/dataValidade.ts` | C |
| **Novo** | `wms-mobile/src/config/features.ts` | B |
| **Editar** | `wms-mobile/src/types.ts` (novos tipos + `capturaValidade`) | A/E |
| **Editar** | `wms-mobile/src/screens/OccurrenceScreen.tsx` (linhas 77–86 e estado) | D |
| **Editar** | `wms-mobile/src/screens/FlowScreen.tsx` (botão validade) | E |
| **Editar** | `wms-mobile/src/data/mock.ts` (passo `capturaValidade` em T-110) | E |
| **Editar** | `wms-mobile/app.json` (permissão de câmera) | A |
| **Editar** | `wms-mobile/package.json` (novas deps via `expo install`) | A |
| **Editar** | `wms-admin-business/src/lib/mock.ts` (parâmetro `recebimento.visao_ia`) | F |

---

## 10. Casos de borda e tratamento

| Situação | Comportamento esperado |
|---|---|
| Permissão de câmera negada | Estado claro + botão "permitir"; ocorrência segue sem foto (não trava) |
| Sem rede no momento da captura | Foto vai para a fila; análise roda depois; operador pode enviar a ocorrência já |
| IA com confiança baixa (< limiar) | Exibir como "verifique: possível X"; **não** auto-selecionar motivo |
| IA marca "sem dano" mas operador discorda | Operador seleciona `avaria` manualmente; decisão humana prevalece |
| OCR não encontra data | Campo de validade vem vazio e editável para digitação manual |
| Erro do serviço de IA | Item marcado `erro`, foto preservada, retry no próximo `processarPendentes()` |
| App fechado com fila pendente | Fila persistida em AsyncStorage; retomada ao reabrir |

---

## 11. Critérios de aceite (checklist)

- [ ] Tocar "Fotografar avaria" abre a câmera real e captura uma imagem.
- [ ] A imagem é comprimida e salva localmente; um item entra na fila.
- [ ] A ocorrência pode ser enviada **antes** da IA terminar (não-bloqueante).
- [ ] Com `visionMock`, a análise de avaria retorna e **pré-seleciona o motivo `avaria`** quando `temDano && confianca ≥ limiar`.
- [ ] Confiança baixa exibe "verifique" sem auto-selecionar.
- [ ] No fluxo `receber` (T-110), "Ler validade (foto)" retorna uma data que o operador confirma/corrige antes de seguir.
- [ ] Sem rede, captura e enfileiramento funcionam; análise sincroniza depois.
- [ ] Permissão negada não quebra a tela.
- [ ] Parâmetro `recebimento.visao_ia` aparece em `wms-admin-business` com resolução hierárquica.
- [ ] Com `VISAO_IA_ATIVA = false`, a tela volta a se comportar como hoje (sem botão de IA).
- [ ] App roda no Expo Go (SDK 56) usando `visionMock`, sem backend.

---

## 12. Riscos e mitigações

| Risco | Mitigação |
|---|---|
| API do `expo-camera` no SDK 56 diferente do esperado | Conferir https://docs.expo.dev/versions/v56.0.0/sdk/camera/ antes de codar (mandato AGENTS.md) |
| Latência/custo de IA na nuvem travando operação | Pipeline assíncrono + fila offline; captura nunca espera a IA |
| OCR de validade impreciso | Confiança + confirmação humana obrigatória; campo editável |
| Iluminação ruim no armazém degradando visão | Flash/torch no `CameraCapture`; modelo tolerante; correção manual sempre disponível |
| Vazamento de escopo para "IA em tudo" | Este plano cobre só avaria + validade; demais usos em planos separados |
| IA "decidindo" algo fiscal | Proibido por design: IA sugere, humano confirma; escopo não inclui fiscal |

---

## 13. Sequência sugerida de execução

1. **Fase A** (câmera real) — destrava todo o resto.
2. **Fase B + C** (fila + camada de visão mock) — pipeline funcionando sem backend.
3. **Fase D** (avaria na ocorrência) — **MVP demonstrável ao cliente**.
4. **Fase E** (validade OCR) — reaproveita o pipe, amplia o valor.
5. **Fase F** (chave no admin) — governança/config-as-data.
6. Depois: trocar `visionMock` por `visionRemote` quando o `wms-api` expor `POST /api/visao/analisar`.

---

## 14. Fora de escopo — próximos planos relacionados

- Contagem de volumes por foto (conferência cega).
- Cubagem/volumetria por câmera (alavanca de margem em frete/packing).
- Copiloto analítico (LLM) sobre `wms-frontend` (Relatórios/Dashboard).
- Copiloto de configuração (LLM → parâmetros) no `wms-admin-business`.
- Modelos preditivos (demanda, slotting, carga) — **somente após 3–6 meses de histórico transacional real**.

---

*Documento auto-suficiente: contém estado atual, arquitetura, tipos, contrato de API, passo a passo por arquivo, critérios de aceite e riscos. Implementável a partir dele isoladamente, respeitando as restrições do `wms-mobile` (Expo SDK 56, roteador próprio, offline-first, sem backend nesta fase).*
