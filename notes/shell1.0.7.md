# Release shell1.0.7

## Notes in en-US

### Changes in this version

- Version bump of the `ark-format-shell` package: `1.0.6` -> `1.0.7`.
- Security hardening in the `shfmt` integration:
  - `arkFormatShell.shfmt.path` and `arkFormatShell.shfmt.flags` now ignore values set in `workspace` and `workspaceFolder`.
  - Only user-level settings (global/globalLanguage) are considered for running the external binary.
- Activation log (`ark.active`) removed to reduce noise in the extension host.
- Publishing pipeline adjusted to avoid passing the token explicitly on the command line (`vsce` and `ovsx`).

## Notas em pt-BR

### Alterações desta versão

- Bump de versão do pacote `ark-format-shell`: `1.0.6` -> `1.0.7`.
- Endurecimento de segurança na integração com `shfmt`:
  - `arkFormatShell.shfmt.path` e `arkFormatShell.shfmt.flags` agora ignoram valores definidos em `workspace` e `workspaceFolder`.
  - Apenas configurações em nível de usuário (global/globalLanguage) são consideradas para execução de binário externo.
- Remoção de log de ativação (`ark.active`) para reduzir ruído no host da extensão.
- Ajuste no pipeline de publicação para evitar passagem explícita de token em linha de comando (`vsce` e `ovsx`).

## Additional Information / Informações Adicionais

- Tag: `shell1.0.7`
- Release date / Data de lançamento: **2026-05-31**
