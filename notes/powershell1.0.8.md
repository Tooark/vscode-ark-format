# Release powershell1.0.8

## Alterações desta versão

- Bump de versão do pacote `ark-format-powershell`: `1.0.7` -> `1.0.8`.
- Auditoria comparativa com os cenários de regressão encontrados no shell:
  - Validação de blocos aninhados com `switch` dentro de `switch`.
  - Validação de cláusulas inline (`if/else` em uma linha) sem drift de indentação na linha seguinte.
- Ampliação da suíte de testes com cenários de regressão para garantir estabilidade futura.
- Nenhuma mudança funcional no motor de indentação foi necessária nesta versão.

## Informações Adicionais

- Tag relacionada: `powershell1.0.8`
- Data de lançamento: **2026-05-31**
