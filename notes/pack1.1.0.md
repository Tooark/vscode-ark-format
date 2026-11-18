# Release pack1.1.0

## Notes in en-US

### Changes in this version

- Version bump of the `ark-format` package: `1.0.9` -> `1.1.0`.
- Added the `tooark.ark-format-makefile` extension (initial version `1.0.0`) to `extensionPack`:
  - Makefile formatter (`Makefile`, `GNUmakefile`, `*.mk`) following the structure of the Shell and PowerShell extensions.
  - Safety invariants: recipe TAB prefix preserved, `define ... endef` blocks left untouched, and the whole document preserved when `.RECIPEPREFIX` is redefined.
- Pack keywords updated (`makefile`).
- READMEs (EN/PT-BR) updated with the newly included extension.
- Support section added to the READMEs (EN/PT-BR).
- No functional changes to the extension pack; formatter fixes and improvements are published in each extension's own releases (`shell1.0.11`, `powershell1.2.0`, `makefile1.0.0`).

## Notas em pt-BR

### Alterações desta versão

- Bump de versão do pacote `ark-format`: `1.0.9` -> `1.1.0`.
- Inclusão da extensão `tooark.ark-format-makefile` (versão inicial `1.0.0`) no `extensionPack`:
  - Formatador de Makefile (`Makefile`, `GNUmakefile`, `*.mk`) seguindo a estrutura das extensões Shell e PowerShell.
  - Invariantes de segurança: prefixo TAB de recipes preservado, blocos `define ... endef` intocados e preservação integral quando `.RECIPEPREFIX` é redefinido.
- Atualização das keywords do pack (`makefile`).
- Atualização dos READMEs (EN/PT-BR) com a nova extensão incluída.
- Seção de apoio (Support) adicionada aos READMEs (EN/PT-BR).
- Sem alterações funcionais no extension pack; correções e melhorias dos formatadores são publicadas nas releases de cada extensão (`shell1.0.11`, `powershell1.2.0`, `makefile1.0.0`).

## Additional Information / Informações Adicionais

- Tag: `pack1.1.0`
- Release date / Data de lançamento: **2026-07-05**
