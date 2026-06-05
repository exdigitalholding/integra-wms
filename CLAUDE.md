# WMS Adapta — Monorepo

Plataforma WMS (Warehouse Management System) para o contexto brasileiro. Este repositório é a **base** sobre a qual serão criados vários frontends, apps React Native e várias APIs.

## Estrutura

```
wms-adapta/
├── .claude/
│   └── skills/                 # Skills-base, compartilhadas por TODOS os subprojetos
│       ├── wms-architect/      # Domínio WMS (inbound, picking, inventário, expedição, fiscal BR)
│       └── ui-ux-pro-max/      # UI/UX, design system, componentes (frontends e RN)
├── wms-frontend/               # App web operacional (React 19 + Vite 8 + TS + react-router 7 + three.js)
├── wms-admin-business/         # (planejado) painel administrativo/comercial
├── WMS-Fluxos-Operacionais.md  # Documentação de domínio dos fluxos de chão
└── LogoNacionalSoftware.svg    # Asset de marca
```

Projetos futuros (criar como **irmãos** na raiz, nunca aninhados):
- `wms-mobile/` — React Native (coletor de código de barras, conferência, picking)
- `wms-api/` (ou `apis/<nome>/`) — backends Fastify + Prisma

## Skills — como funcionam aqui

As skills vivem em `.claude/skills/<nome>/SKILL.md`, **um único nível**. Skills são **irmãs**, nunca aninhadas dentro de outra (uma skill dentro de `outra-skill/skills/...` NÃO é descoberta pelo Claude Code).

Por ficarem na raiz do monorepo, valem para qualquer subprojeto quando o Claude roda a partir desta pasta.

| Skill | Use quando | Vale para |
|-------|-----------|-----------|
| `wms-architect` | Projetar/modelar/especificar qualquer parte de WMS, ou discutir como a operação DEVE funcionar | Tudo (front, RN, APIs) |
| `ui-ux-pro-max` | Planejar/construir/revisar UI — telas, componentes, design system, paleta, tipografia | Frontends e React Native |

Skills de backend (ex.: `backend-fastify-prisma-expert`) já existem globais em `~/.claude/skills/` e serão usadas quando as APIs forem criadas.

### Para adicionar uma nova skill-base
1. Crie `.claude/skills/<nome>/SKILL.md` com frontmatter `name` + `description`.
2. Arquivos de apoio em subpastas (`references/`, `data/`, `scripts/`) — referenciados com caminho relativo a partir do `SKILL.md`.
3. Nunca aninhe uma skill dentro de outra.

## Convenções do monorepo

- **Idioma do domínio:** português (telas, rotas e termos de negócio seguem o vocabulário WMS BR — recebimento, putaway, picking, inventário, expedição).
- **Frontends:** React + Vite + TypeScript + Tailwind. Reaproveitar padrões de `wms-frontend/src/components/`.
- **APIs (futuras):** Fastify + Prisma (ver skill global `backend-fastify-prisma-expert`).
- **Modelo de dados é único e configurável** — não bifurcar "versão pequena/grande" (ver `wms-architect`, princípio de escala configurável).
