# Release pack1.0.7

## Alterações desta versão

- Bump de versão do pacote `ark-format`: `1.0.6` -> `1.0.7`.
- Ajuste no pipeline de publicação para evitar passagem explicita de token em linha de comando:
  - `pnpm exec vsce publish --no-dependencies` (sem `-p $VSCE_PAT`).
  - `ovsx publish "$VSIX_FILE"` (sem `-p $OVSX_PAT`).
- Melhoria de segurança operacional no CI, reduzindo exposição de segredos no processo de publish.

## Informações Adicionais

- Tag relacionada: `pack1.0.7`
- Data de lançamento: **2026-05-31**
