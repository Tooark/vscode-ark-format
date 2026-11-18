# Release shell1.0.2

## Notes in en-US

### Changes in this version

- Version bump of the `ark-format-shell` package: `1.0.1` -> `1.0.2`.
- New formatting rule for multi-line commands with continuation (`\`) inside a quoted command substitution (`"$(...)"`):
  - Continued lines of the command are now indented.
  - Scenario validated with a regression test for `aws stepfunctions create-state-machine`.
- VS Code integration fix so that coloring/syntax highlighting is not affected:
  - Removed the `contributes.languages` block from the package manifest.
  - Avoids overriding file extension associations without providing a grammar.

## Notas em pt-BR

### Alterações desta versão

- Bump de versão do pacote `ark-format-shell`: `1.0.1` -> `1.0.2`.
- Nova regra de formatação para comandos multilinha com continuação (`\`) dentro de substituição de comando entre aspas (`"$(...)"`):
  - Passa a aplicar recuo nas linhas continuadas do comando.
  - Cenário validado com teste de regressão para `aws stepfunctions create-state-machine`.
- Correção de integração com o VS Code para não afetar a coloração/syntax highlighting:
  - Removido o bloco `contributes.languages` do manifesto do pacote.
  - Evita sobrescrever associação de extensões de arquivo sem prover grammar.

## Additional Information / Informações Adicionais

- Tag: `shell1.0.2`
- Release date / Data de lançamento: **2026-05-21**
