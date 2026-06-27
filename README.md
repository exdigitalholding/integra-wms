# Integra WMS

Repositorio do Integra WMS, com tres aplicacoes principais:

- `wms-frontend`: operacao web do armazem.
- `wms-admin-business`: painel administrativo e regras de negocio.
- `wms-mobile`: aplicativo/coletor mobile em Expo.

## Como clonar

```bash
git clone https://github.com/exdigitalholding/integra-wms.git
cd integra-wms
```

## Requisitos

- Node.js instalado.
- npm instalado junto com o Node.js.
- Para o mobile, Expo/Expo Go se for testar em celular.

## Rodar o WMS operacional web

```bash
cd wms-frontend
npm install
npm run dev
```

Por padrao, o Vite mostra a URL local no terminal, normalmente `http://localhost:5173`.

Comandos uteis:

```bash
npm run build
npm run lint
npm run preview
```

## Rodar o painel administrativo

```bash
cd wms-admin-business
npm install
npm run dev
```

Login em ambiente demo: qualquer usuario com senha `demo`.

Comandos uteis:

```bash
npm run build
npm run lint
npm run preview
```

## Rodar o mobile/coletor

```bash
cd wms-mobile
npm install
npm run start
```

Depois disso, use as opcoes do Expo no terminal:

- `a`: abrir no Android.
- `i`: abrir no iOS, quando disponivel.
- `w`: abrir no navegador.
- Escanear o QR Code com o Expo Go no celular.

Tambem existem comandos diretos:

```bash
npm run android
npm run ios
npm run web
```

## Estrutura do repositorio

```text
integra-wms/
|-- wms-frontend/        Operacao web do WMS
|-- wms-admin-business/  Administracao, cadastros e regras
|-- wms-mobile/          Coletor mobile em Expo
|-- wms-shared-demo/     Dados e tipos compartilhados de demo
`-- plano-de-acao/       Planejamento e documentos de evolucao
```

## Fluxo recomendado para colaborar

```bash
git pull origin main
git checkout -b minha-feature
# fazer alteracoes
git status
git add .
git commit -m "Descreve a alteracao"
git push origin minha-feature
```

Depois, abrir um Pull Request para a branch `main`.

## Observacoes

- Os projetos ainda usam dados mockados/em memoria em varias telas.
- Evite commitar `node_modules`, `dist`, `.expo`, `.env` ou arquivos locais.
- Se criar variaveis de ambiente, use `.env.example` para documentar nomes sem expor valores reais.
