# Release shell1.0.4

## Notes in en-US

### Changes in this version

- Version bump of the `ark-format-shell` package: `1.0.3` -> `1.0.4`.
- Extension manifest cleanup:
  - removed unused command definitions from `package.json`.
  - removed the localization keys associated with those commands from `package.nls.json` and `package.nls.pt-br.json`.
- Fix in the internal indentation engine for scenarios with `if`/`else` blocks and inline `case` branches:
  - now correctly detects when `if`, `elif` and `else` open a block on the next line.
  - now correctly closes `case` branches terminated inline with `;;`, `;&` and `;;&`, including with a comment at the end of the line.
  - avoids an incorrect dedent when a line merely ends with a branch terminator after other commands.
- Added regression tests covering the new Shell indentation and formatting scenarios.
- Workspace dependency maintenance: `qs` updated to `6.15.2` in the pnpm lockfile/resolution to fix a Dependabot alert.

## Notas em pt-BR

### Alterações desta versão

- Bump de versão do pacote `ark-format-shell`: `1.0.3` -> `1.0.4`.
- Limpeza do manifesto da extensão:
  - removidas definições de comandos não utilizados de `package.json`.
  - removidas chaves de localização associadas a esses comandos em `package.nls.json` e `package.nls.pt-br.json`.
- Correção do motor interno de indentação para cenários com blocos `if`/`else` e ramos `case` inline:
  - passa a detectar corretamente quando `if`, `elif` e `else` abrem bloco na linha seguinte.
  - passa a fechar corretamente ramos `case` terminados inline com `;;`, `;&` e `;;&`, inclusive com comentário no final da linha.
  - evita dedent incorreto quando a linha apenas termina com terminador de ramo após outros comandos.
- Adicionados testes de regressão para cobrir os novos cenários de indentação e formatação Shell.
- Manutenção de dependências do workspace: atualização de `qs` para `6.15.2` no lockfile/resolução do pnpm para corrigir alerta do Dependabot.

## Additional Information / Informações Adicionais

- Tag: `shell1.0.4`
- Release date / Data de lançamento: **2026-05-23**
