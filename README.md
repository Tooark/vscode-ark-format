# ARK Format - Monorepo de Formatação e Extensões VS Code

Ferramenta monorepo para formatação de código (Ark) e extensões VS Code.

Este repositório contém formatadores e extensões organizadas como um monorepo. O objetivo principal é fornecer formatação consistente para PowerShell e Shell, compartilhando utilitários comuns no pacote `shared`.

## Sumário

- **Resumo**: visão geral do projeto
- **Estrutura**: layout dos diretórios e descrição dos pacotes
- **Como construir**: comandos para compilar o monorepo
- **Como testar**: executar os testes unitários e de cobertura
- **Desenvolvimento VS Code**: rodar em modo de desenvolvimento
- **Onde encontrar mais**: links para README de cada subprojeto

## Estrutura do repositório

- [packages/powershell](packages/powershell/README.md) — Formatador para PowerShell (.ps1, .psm1, .psd1)
- [packages/shell](packages/shell/README.md) — Formatador para Shell (.sh, .bash, .zsh, .ksh, .tcsh, .azcli, .bats)
- [packages/shared](packages/shared/README.md) — Código compartilhado (utils, document processing, lexer, indent)
- [packages/pack](packages/pack/README.md) — Utilitários de empacotamento/artefatos
- `configs/` — Configurações compartilhadas (ESLint base, tsconfig.base.json, etc.)
- `pnpm-workspace.yaml` — configuração do workspace pnpm
- `.vscode/` — tarefas e configurações recomendadas (comitadas para facilitar o desenvolvimento em equipe)

> Observação: os READMEs de cada pacote contêm detalhes específicos de cada subprojeto (instalação, uso, amostras e guias de contribuição). Confira os links acima.

## Como construir

Instale dependências (requer `pnpm`):

```bash
pnpm install
```

Compila todos os pacotes que definirem um `build` script:

```bash
pnpm run build
# ou (forçar execução recursiva)
pnpm -r --if-present build
```

Para rodar o watcher de desenvolvimento (quando disponível em pacotes):

```bash
pnpm run watch
# ou
pnpm -r --parallel --if-present watch
```

## Como testar

Executar testes em um pacote específico (ex.: PowerShell):

```bash
cd packages/powershell
pnpm test
```

Executar todos os testes presentes no monorepo (quando os pacotes definirem `test`):

```bash
pnpm -r --if-present test
```

Gerar cobertura (ex.: pacote `powershell`):

```bash
cd packages/powershell
pnpm exec vitest run --coverage
```

## Desenvolvimento com VS Code

O diretório `.vscode/` na raiz contém recomendações de extensão, `tasks.json` e `launch.json` úteis para debug e execução da extensão em um host do VS Code — mantenha esses arquivos versionados para facilitar o setup da equipe.

Para abrir o host de extensão e testar a extensão localmente:

1. Abra o workspace no VS Code
2. Execute a _Task_ `pnpm: watch shell` ou `pnpm: watch powershell` a partir do painel de Tasks
3. Pressione `F5` (Launch Extension) para abrir um novo Host do VS Code com a extensão carregada

## Contribuição

- Leia os READMEs específicos de cada pacote antes de enviar PRs
- Siga as regras do ESLint (configurações comuns em `configs/eslint.base.mjs`)
- Execute os testes localmente e garanta cobertura apropriada para alterações

## Licença

Este projeto está licenciado sob a [MIT License](LICENSE).

## 👤 Autor

| <img src="https://avatars.githubusercontent.com/u/27088472?v=4" width=120> |
| :------------------------------------------------------------------------: |
|            [**Paulo Freitas**](https://paulofreitas.tooark.com)            |
