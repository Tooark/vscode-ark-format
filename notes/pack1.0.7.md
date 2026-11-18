# Release pack1.0.7

## Notes in en-US

### Changes in this version

- Version bump of the `ark-format` package: `1.0.6` -> `1.0.7`.
- Publishing pipeline adjusted to avoid passing the token explicitly on the command line:
  - `pnpm exec vsce publish --no-dependencies` (without `-p $VSCE_PAT`).
  - `ovsx publish "$VSIX_FILE"` (without `-p $OVSX_PAT`).
- Operational security improvement in CI, reducing exposure of secrets in the publish process.

## Notas em pt-BR

### Alterações desta versão

- Bump de versão do pacote `ark-format`: `1.0.6` -> `1.0.7`.
- Ajuste no pipeline de publicação para evitar passagem explicita de token em linha de comando:
  - `pnpm exec vsce publish --no-dependencies` (sem `-p $VSCE_PAT`).
  - `ovsx publish "$VSIX_FILE"` (sem `-p $OVSX_PAT`).
- Melhoria de segurança operacional no CI, reduzindo exposição de segredos no processo de publish.

## Additional Information / Informações Adicionais

- Tag: `pack1.0.7`
- Release date / Data de lançamento: **2026-05-31**
