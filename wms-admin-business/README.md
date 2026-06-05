# wms-admin-business

Painel **administrativo & de negócios** do Integra WMS — o **plano de controle** do sistema.
Enquanto o `wms-frontend` (operação) e o `wms-mobile` (coletor) *executam* a operação, este
app é onde se **modela o armazém e ligam-se as regras** que a operação obedece.

> Princípio (skill `wms-architect`): **schema único e configurável**, não "versão pequena/grande".
> A chave-mestra da escala é o campo `modo` do Armazém (`simples` ↔ `completo`).
> Parametrização é **dado**, não código — por isso serve da PME ao operador de 40 mil posições.

## Stack

Idêntica ao `wms-frontend` para consistência total de layout: React 19 · Vite 8 · TypeScript 6 ·
react-router 7 · Tailwind 3 (mesmos tokens `#21274e`/`#00a88e`, Poppins/Fira Code) · Zustand 5 ·
lucide-react. Sem three.js/recharts (não usados nas fases atuais). **Sem API — dados em memória (mock).**

## Rodar

```bash
npm install
npm run dev      # http://localhost:5173  (login: qualquer usuário, senha demo)
npm run build    # tsc -b && vite build
```

## O que está implementado

**Fase 0 — Fundação.** Shell + Sidebar + Topbar (seletor de Armazém, multi-armazém no dia 1),
design system clonado (`ui.tsx`, `form.tsx`, `Brand.tsx`), store Zustand com CRUD genérico, Login.

**Fase 1 — Cadastros mestres.** Produtos/SKU (com fiscal BR: NCM/CEST/origem, conversão de UM,
dimensões, controles de lote/validade/série), Armazéns & CDs, Clientes (Owners), Fornecedores,
Transportadoras.

**Fase 2 — Estrutura física.** Zonas, Docas e Endereços — com **gerador de endereços em massa**
(código canônico `RUA-COLUNA-NÍVEL-POSIÇÃO`, igual ao `lib/warehouse.ts` do operacional) e
**pré-visualização 2D** da planta (visão de elevação por rua).

## Estrutura

```
src/
├── components/   Shell, nav, Brand, ui (design system), form (campos), MapaPreview (planta 2D)
├── pages/        Dashboard, Login + cadastros (Fase 1) + estrutura física (Fase 2)
├── store/        useStore (Zustand: sessão, armazém em foco, CRUD genérico, toasts)
└── lib/          types, mock (seed), enderecos (gerador), utils
```

## Próximas fases (planejado)

3) Parâmetros operacionais (escopo global/CD/owner) · 4) Acessos & governança (permissão por ação) ·
5) Slotting/picking + editor de mapa · 6) Auditoria de configuração.
