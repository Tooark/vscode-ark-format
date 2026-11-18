# Release powershell1.1.0

## Notes in en-US

### Changes in this version

- Version bump of the `ark-format-powershell` package: `1.0.9` -> `1.1.0`.
- New `arkFormatPowerShell.formatBlockComments` setting (default `false`):
  - When **disabled**, block comments (`<# ... #>`) are preserved with no change to their internal indentation.
  - When **enabled**, the block content is reindented based on `indentSize`: `<#`/`#>` delimiters at the level of the surrounding code, comment-based help keywords (`.SYNOPSIS`, `.DESCRIPTION`, etc.) one level in and the content below them two levels in.
- Block comments are now treated as an opaque block by the formatting engine (`formatTextGeneric`), preventing their internal indentation from being flattened during document formatting.
- Test coverage added for the enabled/disabled modes, nested indentation (block inside a function) and single-line block comments (`<# ... #>`).

## Notas em pt-BR

### Alterações desta versão

- Bump de versão do pacote `ark-format-powershell`: `1.0.9` -> `1.1.0`.
- Nova opção de configuração `arkFormatPowerShell.formatBlockComments` (padrão `false`):
  - Quando **desabilitada**, comentários de bloco (`<# ... #>`) são preservados sem nenhuma alteração na indentação interna.
  - Quando **habilitada**, o conteúdo do bloco é reindentado com base no `indentSize`: delimitadores `<#`/`#>` no nível do código ao redor, palavras-chave da comment-based help (`.SYNOPSIS`, `.DESCRIPTION`, etc.) com um nível e o conteúdo abaixo delas com dois níveis.
- Comentários de bloco passam a ser tratados como bloco opaco pelo motor de formatação (`formatTextGeneric`), evitando que a indentação interna seja achatada durante a formatação do documento.
- Cobertura de testes adicionada para os modos habilitado/desabilitado, indentação aninhada (bloco dentro de função) e comentários de bloco em linha única (`<# ... #>`).

## Additional Information / Informações Adicionais

- Tag: `powershell1.1.0`
- Release date / Data de lançamento: **2026-06-27**
