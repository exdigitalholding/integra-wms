# Integra Coletor — Como usar

App **React Native + Expo** do operador de chão do Integra WMS. Esta fase é um **protótipo de frontend**: **sem backend e sem banco** — todos os dados vêm de `src/data/mock.ts`. O objetivo é abrir no celular pelo Expo Go e validar a experiência de uso.

> **Princípio que governa o app:** o operador tem **pouco tempo e baixo nível de leitura**. Então: **cor + ícone + número grande** falam mais que texto, **uma instrução por tela**, botões gigantes, e **scan-to-confirm** em todo passo crítico. Exceção se resolve **dentro do fluxo** — nunca "saia do app e ligue para o supervisor".

---

## 1. Como rodar no seu celular

1. Instale o app **Expo Go** (App Store / Play Store).
2. No computador, na pasta do projeto:
   ```bash
   cd wms-adapta/wms-mobile
   npm install      # só na primeira vez
   npx expo start
   ```
3. Vai aparecer um **QR Code** no terminal.
   - **Android:** abra o Expo Go e escaneie o QR.
   - **iPhone:** abra a **câmera** e aponte para o QR (abre no Expo Go).
4. O celular e o computador precisam estar **na mesma rede Wi-Fi**. Se não conectar, rode `npx expo start --tunnel`.

Para ver no navegador (teste rápido, sem celular): tecle `w` no terminal do Expo, ou `npx expo start --web`.

---

## 2. Login do demo

Não existe digitação de usuário/senha — operador de chão não digita.

1. Toque na **foto/nome** do operador (Carlos, Marina, João ou Ana).
2. Digite o **PIN**: `1234` (igual para todos no demo).

---

## 3. Mapa de telas

| Tela | Arquivo | Para que serve |
|---|---|---|
| **Login** | `screens/LoginScreen.tsx` | Escolhe operador + PIN grande. Sem teclado de texto. |
| **Home** | `screens/HomeScreen.tsx` | Grade de atividades coloridas com nº de tarefas. |
| **Lista de tarefas** | `screens/TaskListScreen.tsx` | Fila do fluxo escolhido; urgência em vermelho. |
| **Fluxo (motor)** | `screens/FlowScreen.tsx` | **Coração do app.** Scan-to-confirm, uma instrução por vez. |
| **Ocorrência** | `screens/OccurrenceScreen.tsx` | Registrar problema sem sair do fluxo. |
| **Sucesso** | `screens/SuccessScreen.tsx` | Tarefa concluída + próximo passo claro. |

---

## 4. Os 6 fluxos (o que o operador faz)

Cada cor + ícone na Home é uma atividade real do armazém:

| Atividade | Cor | O que é (linguagem WMS) |
|---|---|---|
| **Separar** | marinho | Picking — pegar itens do pedido na rota otimizada |
| **Receber** | azul | Recebimento / conferência cega na doca |
| **Guardar** | teal | Putaway — endereçar o palete no local |
| **Abastecer** | verde | Reabastecimento — repor o picking a partir do pulmão |
| **Conferir** | roxo | Conferência de saída — última barreira antes do envio |
| **Contar** | âmbar | Inventário rotativo — contagem cega no endereço |

---

## 5. Fluxo prático de uso (passo a passo)

### Caminho feliz — Separar um pedido
1. Home → toque no card **Separar**.
2. Escolha uma tarefa da fila (ex.: `T-101 · Pedido #4471`).
3. A tela mostra **UMA instrução por vez**:
   - **"Vá até o endereço"** → mostra `A-12-03-2` gigante → toque **BIPAR**.
   - **"Bipe o produto"** → mostra `SKU-10241` + descrição → toque **BIPAR**.
   - **"Pegue e confirme"** → digite a quantidade no teclado grande → **Confirmar**.
4. Tela de **sucesso** (check verde + vibração) → **Próxima tarefa** ou **Voltar ao início**.

> **No demo, o botão `BIPAR` entrega o código certo automaticamente** (simula o leitor do coletor). Para testar validação, use **"Não bipou? Digitar código"** e digite errado → a tela fica vermelha e pede pra bipar de novo.

### Caminho de exceção — Tive um problema
Em qualquer passo do fluxo, toque em **"Tive um problema"** (rodapé amarelo):
1. Toque no **ícone do que aconteceu** (Faltou, Sobrou, Avariado, Local cheio, Local vazio, Item trocado).
2. Opcional: **Tirar foto**.
3. **Enviar e continuar** → o líder é avisado e o operador segue o trabalho.

---

## 6. Detalhes de UX que sustentam a usabilidade

- **Háptico (vibração)** em todo toque e na conclusão — feedback funciona com luva e no barulho (`src/lib/haptics.ts`).
- **Alvos de toque ≥ 68px**, fonte do corpo ≥ 18, valor esperado a 56px.
- **Cor nunca é o único sinal** — sempre vem com ícone e texto (acessibilidade).
- **Progresso por bolinhas** mostra "quanto falta" sem precisar ler.
- **Login → trabalho em 2 toques**; nenhum menu para navegar — o sistema empurra a tarefa.

---

## 7. Estrutura do código

```
wms-mobile/
├── App.tsx                      # providers (SafeArea + Sessão + Navegação)
├── src/
│   ├── theme/theme.ts           # cores da marca Integra, espaçamento, tipografia
│   ├── types.ts                 # tipos do domínio (Tarefa, Passo, Operador…)
│   ├── data/mock.ts             # ★ DADOS FALSOS — trocar por API no futuro
│   ├── lib/haptics.ts           # feedback físico
│   ├── components/              # BigButton, NumPad, StepDots, TopBar, Screen
│   ├── navigation/              # router (pilha de estado), session, AppNavigator
│   └── screens/                 # as 6 telas
```

---

## 8. O que NÃO existe ainda (próximos passos)

Este protótipo é só o **frontend**. Para virar produto:

1. **`wms-api`** (Fastify + Prisma) — a fila de tarefas, o saldo e o movimento precisam vir de uma API real. O `src/data/mock.ts` é exatamente o contrato a ser substituído por `fetch`.
2. **Offline-first** — armazém tem zona morta de Wi-Fi. O coletor precisa de fila local + sincronização. **É a parte mais difícil; projetar antes de escalar.**
3. **Leitor real** — coletores Zebra/Honeywell entregam o código como "teclado" (HID). O botão `BIPAR` do demo vira a leitura física.
4. **Níveis de acesso** — operador (este app) vê só a tarefa dele; líder/gestor vivem no `wms-frontend` (web). Permissão por **ação** e escopo por **dono do estoque (owner)** e **CD**.

> Regra de ouro: **uma API, um saldo, um movimento.** O coletor e o web nunca podem ter "estoques" diferentes — divergência entre eles, no Brasil, vira buraco fiscal.
