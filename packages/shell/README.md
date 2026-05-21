# Ark Format: Shell (ark-format-shell)

Template **recomendado** para criar uma extensão VS Code em **TypeScript** usando:

- **esbuild** para bundling (gera um único `dist/extension.js`)- **pnpm** como package manager- Workaround para empacotar/publicar com `@vscode/vsce` usando `--no-dependencies`

## Por que esse template?

- O VS Code recomenda **bundling** para reduzir quantidade de arquivos e melhorar performance; e mostra **esbuild** como opção rápida e simples.- `@vscode/vsce` lista suporte oficial a **npm** e **yarn**; para pnpm é comum usar bundling + `--no-dependencies`.

## Rodar em modo dev

```bash
pnpm install
pnpm --filter ark-format-shell run watch
# no VSCode: F5 (Run Extension)
```

## Build (produção)

```bash
pnpm --filter ark-format-shell run build
```

## Empacotar (.vsix)

```bash
pnpm --filter ark-format-shell run package
# gera um .vsix na raiz
```

## Publicar

```bash
pnpm run publish
```

> Dica: configure `publisher`, `repository` e `icon` antes de publicar.

---

## Estrutura

- `src/extension.ts` → entrada da extensão
- `dist/extension.js` → output gerado pelo esbuild
- `../../.vscode/` → launch/tasks do workspace monorepo
