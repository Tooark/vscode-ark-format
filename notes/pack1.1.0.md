# Release pack1.1.0

## Alterações desta versão

- Bump de versão do pacote `ark-format`: `1.0.9` -> `1.1.0`.
- Inclusão da extensão `tooark.ark-format-makefile` (versão inicial `1.0.0`) no `extensionPack`:
  - Formatador de Makefile (`Makefile`, `GNUmakefile`, `*.mk`) seguindo a estrutura das extensões Shell e PowerShell.
  - Invariantes de segurança: prefixo TAB de recipes preservado, blocos `define ... endef` intocados e preservação integral quando `.RECIPEPREFIX` é redefinido.
- Atualização das keywords do pack (`makefile`).
- Atualização dos READMEs (EN/PT-BR) com a nova extensão incluída.
- Seção de apoio (Support) adicionada aos READMEs (EN/PT-BR).
- Sem alterações funcionais no extension pack; correções e melhorias dos formatadores são publicadas nas releases de cada extensão (`shell1.0.11`, `powershell1.2.0`, `makefile1.0.0`).

## Informações Adicionais

- Tag relacionada: `pack1.1.0`
- Data de lançamento: **2026-07-05**
