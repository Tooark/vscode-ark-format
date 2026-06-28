# Release powershell1.1.0

## Alterações desta versão

- Bump de versão do pacote `ark-format-powershell`: `1.0.9` -> `1.1.0`.
- Nova opção de configuração `arkFormatPowerShell.formatBlockComments` (padrão `false`):
  - Quando **desabilitada**, comentários de bloco (`<# ... #>`) são preservados sem nenhuma alteração na indentação interna.
  - Quando **habilitada**, o conteúdo do bloco é reindentado com base no `indentSize`: delimitadores `<#`/`#>` no nível do código ao redor, palavras-chave da comment-based help (`.SYNOPSIS`, `.DESCRIPTION`, etc.) com um nível e o conteúdo abaixo delas com dois níveis.
- Comentários de bloco passam a ser tratados como bloco opaco pelo motor de formatação (`formatTextGeneric`), evitando que a indentação interna seja achatada durante a formatação do documento.
- Cobertura de testes adicionada para os modos habilitado/desabilitado, indentação aninhada (bloco dentro de função) e comentários de bloco em linha única (`<# ... #>`).

## Informações Adicionais

- Tag relacionada: `powershell1.1.0`
- Data de lançamento: **2026-06-27**
