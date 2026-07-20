# Changelog

Todas as mudanças relevantes do pacote `ark-format-powershell` estão documentadas aqui.

## 1.2.2 - 2026-07-20

- Versão do pacote atualizada de `1.2.1` para `1.2.2`.
- Correção: here-strings (`@' ... '@` e `@" ... "@`) declaradas indentadas (dentro de `if`, `function`, `try` etc.) deixavam de ser preservadas — a indentação do bloco era aplicada ao corpo e ao terminador (`'@`/`"@`), que precisa ficar na coluna 0. O resultado quebrava o script e corrompia o conteúdo literal (ex.: C# em `Add-Type -TypeDefinition`).
- Here-strings passam a ser tratadas pelo mecanismo de heredoc e preservadas verbatim: corpo mantido byte a byte e terminador na coluna 0, qualquer que seja a indentação da linha de abertura.
- Detecção de here-string reescrita sobre `getQuoteModeAfterLine`, reconhecendo corretamente as aberturas `@'`/`@"`. Correção específica do PowerShell; o formatador de Shell permanece inalterado.
- Novos testes de regressão para here-string indentada (conteúdo verbatim, terminador na coluna 0 e idempotência).
- Detalhes: [notes/powershell1.2.2.md](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/notes/powershell1.2.2.md)

## 1.2.1 - 2026-07-06

- Versão do pacote atualizada de `1.2.0` para `1.2.1`.
- Campo `sponsor` adicionado ao manifesto da extensão, habilitando o botão de apoio (GitHub Sponsors) na página do Marketplace.
- GIFs de demonstração do README regenerados (`powershell-settings.gif` e `powershell-using.gif`) com capturas atualizadas e maior qualidade.
- Sem alterações funcionais no motor de formatação.
- Detalhes: [notes/powershell1.2.1.md](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/notes/powershell1.2.1.md)

## 1.2.0 - 2026-07-05

- Nova opção `arkFormatPowerShell.alignAssignments` (padrão `false`) para alinhamento vertical dos operadores de atribuição (`=`, `+=`, `-=`, `*=`, `/=`, `%=`, `??=`) em blocos contíguos de atribuições de variáveis (`$var = ...`) e entradas de hashtable (`Chave = valor`).
  - Alinhamento pelo caractere `=` final do operador, calculado por linha (a linha mais larga define a coluna do bloco).
  - Blocos encerram em linha em branco, comentário ou outra instrução; níveis de indentação diferentes alinham separadamente.
  - Conteúdo de here-strings (`@' '@`, `@" "@`) e blocos de comentário (`<# #>`) nunca é alterado; continuações com crase/pipe não quebram o bloco.
  - Compatível com todos os fins de linha (`LF`, `CRLF` e `Auto`), preservando o fim de linha configurado.
  - Desligado (padrão), o `collapseSpaces` normaliza alinhamentos existentes para 1 espaço.
- Correção de indentação: cláusulas `else`/`elseif`/`catch`/`finally` em linha própria (após um `}` isolado) não são mais dedentadas duas vezes; passam a alinhar no mesmo nível do bloco anterior, como no estilo `} catch {`.
- Correção de indentação: conteúdo de parênteses multilinha (`@(...)`, `$(...)`, `(...)` de chamadas com argumentos quebrados) passa a receber um nível de indentação, com o `)` de fechamento alinhado à linha que abriu; aninhamentos (array em hashtable, hashtable em array) acumulam níveis corretamente. Arrays em linha única e conteúdo de here-strings permanecem intocados.
- Limpeza de localização: remoção da chave não utilizada `ark.incompatible.flag` dos bundles l10n (EN e pt-BR); ela só é consumida pelo formatador de Shell (shfmt).
- Motor de alinhamento promovido ao pacote compartilhado (`@tooark/ark-format-shared/align`), reutilizado pelos formatadores de Makefile e PowerShell.
- Refatoração interna sem mudança de comportamento: helpers de edição e espaçamento promovidos ao pacote compartilhado (`@tooark/ark-format-shared/edits` e `/spacing`), remoção de código sem uso (coleção de diagnósticos inerte e re-exports órfãos) e guards do provider de intervalo alinhados ao padrão das demais extensões.
- Novos testes da camada de extensão: ativação, providers de documento/intervalo (padrão `CRLF`), reindentação de seleção com contexto e here-strings ignoradas no cálculo do contexto.
- Seção de apoio (Support) adicionada aos READMEs (EN/PT-BR).
- Versão do pacote atualizada de `1.1.0` para `1.2.0`.
- Detalhes: [notes/powershell1.2.0.md](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/notes/powershell1.2.0.md)

## 1.1.0 - 2026-06-27

- Nova opção `arkFormatPowerShell.formatBlockComments` (padrão `false`) para controlar a formatação de comentários de bloco (`<# ... #>`).
  - Desabilitada: o comentário de bloco é preservado sem alteração na indentação interna.
  - Habilitada: o conteúdo é reindentado com base no `indentSize` (delimitadores no nível do código, palavras-chave da comment-based help com um nível e o conteúdo abaixo com dois).
- Comentários de bloco passam a ser tratados como bloco opaco no motor de formatação, evitando que a indentação interna seja achatada.
- Inclusão de testes de regressão para os modos habilitado/desabilitado, indentação aninhada e comentário de bloco em linha única.
- Versão do pacote atualizada de `1.0.9` para `1.1.0`.
- Detalhes: [notes/powershell1.1.0.md](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/notes/powershell1.1.0.md)

## 1.0.9 - 2026-06-27

- Versão do pacote atualizada de `1.0.8` para `1.0.9`.
- Rodada de manutenção de segurança nas dependências (avisos do Dependabot) aplicada via `overrides` no workspace.
- Atualização dos GIFs de demonstração (`media/powershell-settings.gif` e `media/powershell-using.gif`).
- Sem alterações funcionais no motor de formatação.
- Detalhes: [notes/powershell1.0.9.md](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/notes/powershell1.0.9.md)

## 1.0.8 - 2026-05-31

- Versão do pacote atualizada de `1.0.7` para `1.0.8`.
- Auditoria dos cenários equivalentes às regressões corrigidas no Shell (`inline blocks` e blocos aninhados) sem identificação de impacto funcional no formatter de PowerShell.
- Inclusão de cobertura de regressão para `switch` aninhado e `if/else` em uma linha, evitando drift de indentação em futuras mudanças.
- Detalhes: [notes/powershell1.0.8.md](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/notes/powershell1.0.8.md)

## 1.0.7 - 2026-05-31

- Versão do pacote atualizada de `1.0.6` para `1.0.7`.
- Remoção de log de ativação no `activate`, reduzindo ruído no host da extensão.
- Ajuste no pipeline de publicação para remover passagem explícita de token nas chamadas de `vsce` e `ovsx`.
- Detalhes: [notes/powershell1.0.7.md](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/notes/powershell1.0.7.md)

## 1.0.6 - 2026-05-27

- Ajuste de documentação bilíngue: links de idioma do README migrados de `raw.githubusercontent.com` para `github.com/.../blob/...`.
- Versão do pacote atualizada de `1.0.5` para `1.0.6`.
- Endurecimento de segurança no workspace de build/publicação: override de `tmp` para `>=0.2.6` no lockfile do monorepo.
- Detalhes: [notes/powershell1.0.6.md](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/notes/powershell1.0.6.md)

## 1.0.5 - 2026-05-27

- Reestruturação completa do README para o novo padrão de documentação.
- Inclusão de `README.pt-BR.md` com navegação de idiomas EN/PT-BR.
- Correções de consistência na documentação (`lineEnding` alinhado com o default real).
- Versão do pacote atualizada de `1.0.4` para `1.0.5`.
- Detalhes: [notes/powershell1.0.5.md](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/notes/powershell1.0.5.md)

## 1.0.4 - 2026-05-23

- Limpeza de comandos não utilizados no manifesto e arquivos de localização.
- Atualização de dependência do workspace (`qs` para `6.15.2`).
- Versão do pacote atualizada de `1.0.3` para `1.0.4`.
- Detalhes: [notes/powershell1.0.4.md](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/notes/powershell1.0.4.md)

## 1.0.3 - 2026-05-22

- Correção de formatação para preservar fechamento de comentário em bloco `#>`.
- Inclusão de testes de regressão para o cenário corrigido.
- Revisão de defaults no README e remoção da seção Autor.
- Versão do pacote atualizada de `1.0.2` para `1.0.3`.
- Detalhes: [notes/powershell1.0.3.md](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/notes/powershell1.0.3.md)

## 1.0.2 - 2026-05-21

- Correção de integração com VS Code removendo `contributes.languages` (evita impacto em syntax highlighting).
- Versão do pacote atualizada de `1.0.1` para `1.0.2`.
- Detalhes: [notes/powershell1.0.2.md](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/notes/powershell1.0.2.md)

## 1.0.1 - 2026-05-21

- Ajustes visuais na seção de autor do README (avatar e espaçamento).
- Versão do pacote atualizada de `1.0.0` para `1.0.1`.
- Detalhes: [notes/powershell1.0.1.md](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/notes/powershell1.0.1.md)

## 1.0.0 - 2026-05-21

- Primeira versão estável do formatador PowerShell.
- Suporte a formatação completa e por seleção, indentação inteligente e `.editorconfig`.
- Detalhes: [notes/powershell1.0.0.md](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/notes/powershell1.0.0.md)
