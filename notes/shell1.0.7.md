# Release shell1.0.7

## Alterações desta versão

- Bump de versão do pacote `ark-format-shell`: `1.0.6` -> `1.0.7`.
- Endurecimento de segurança na integração com `shfmt`:
  - `arkFormatShell.shfmt.path` e `arkFormatShell.shfmt.flags` agora ignoram valores definidos em `workspace` e `workspaceFolder`.
  - Apenas configurações em nível de usuário (global/globalLanguage) são consideradas para execução de binário externo.
- Remoção de log de ativação (`ark.active`) para reduzir ruído no host da extensão.
- Ajuste no pipeline de publicação para evitar passagem explícita de token em linha de comando (`vsce` e `ovsx`).

## Informações Adicionais

- Tag relacionada: `shell1.0.7`
- Data de lançamento: **2026-05-31**
