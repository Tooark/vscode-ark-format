# Release powershell1.0.8

## Notes in en-US

### Changes in this version

- Version bump of the `ark-format-powershell` package: `1.0.7` -> `1.0.8`.
- Comparative audit against the regression scenarios found in shell:
  - Validation of nested blocks with `switch` inside `switch`.
  - Validation of inline clauses (`if/else` on one line) with no indentation drift on the following line.
- Test suite expanded with regression scenarios to ensure future stability.
- No functional change to the indentation engine was needed in this version.

## Notas em pt-BR

### Alterações desta versão

- Bump de versão do pacote `ark-format-powershell`: `1.0.7` -> `1.0.8`.
- Auditoria comparativa com os cenários de regressão encontrados no shell:
  - Validação de blocos aninhados com `switch` dentro de `switch`.
  - Validação de cláusulas inline (`if/else` em uma linha) sem drift de indentação na linha seguinte.
- Ampliação da suíte de testes com cenários de regressão para garantir estabilidade futura.
- Nenhuma mudança funcional no motor de indentação foi necessária nesta versão.

## Additional Information / Informações Adicionais

- Tag: `powershell1.0.8`
- Release date / Data de lançamento: **2026-05-31**
