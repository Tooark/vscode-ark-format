# Release shell1.0.14

## Alterações desta versão

- Versão do pacote atualizada de `1.0.13` para `1.0.14`.
- **Correção** ([#34](https://github.com/Tooark/vscode-ark-format/issues/34)): o formatador apagava todas as linhas seguintes a uma linha como `x="$(echo '"Hello"' | tr -d '"')"`. Eram dois defeitos combinados:
  - O lexer tratava as aspas simples dentro de uma substituição de comando `$(...)` entre aspas duplas como texto literal. Com isso, as aspas duplas dentro delas fechavam e reabriam a string externa, e a linha terminava "dentro de aspas simples". Por isso o problema dependia da paridade: com um número par de linhas iguais, as aspas se compensavam.
  - As linhas de uma string multilinha só eram gravadas na saída quando a string fechava. Se o arquivo terminasse com a string aberta, essas linhas eram descartadas.
- O lexer passa a tratar `$(...)` dentro de aspas duplas como um novo contexto de aspas, como o Bash:
  - Aspas simples, aspas duplas, `$'...'` e crases dentro da substituição abrem strings próprias, sem fechar a string externa.
  - A substituição fecha no `)` correspondente: parênteses entre aspas não contam, e `$((...))` aninhado é suportado.
  - Barra invertida escapa o próximo caractere; `#` no início de uma palavra é comentário (`$#` e `${#var}` não são).
  - Em heredocs declarados dentro da substituição (`"$(cat <<'EOF'`), o rastreamento de aspas ignora o corpo até o delimitador: apóstrofos e aspas no corpo não abrem strings. `<<` em expansão aritmética e o here-string `<<<` não são tratados como heredoc.
  - O estado continua correto quando a substituição ocupa várias linhas.
- **Correção**: aspas escapadas fora de strings (`it\'s`, `\"texto\"`, padrões de `case` como `(*\'*)`) abriam uma string por engano, com o mesmo efeito de apagar ou deixar de formatar o restante do arquivo. A barra invertida passa a escapar o próximo caractere também no código normal.
- **Correção**: o conteúdo de uma string multilinha, incluindo `"$(...)"` em várias linhas, é reindentado como bloco conforme o nível do código ao redor. Um heredoc declarado dentro de `"$(...)"` em um bloco indentado (função, `if` etc.) também tinha o corpo e o delimitador reindentados, o que alterava o texto do heredoc e impedia o Bash de reconhecer o delimitador de `<<EOF` — o script quebrava. O corpo e o delimitador desses heredocs passam a ser preservados exatamente como no original e não influenciam a reindentação das demais linhas do bloco.
- **Proteção contra perda de dados** (pacote compartilhado): se uma string continuar aberta até o fim do arquivo — porque está realmente aberta ou por uma interpretação incorreta das aspas —, as linhas pendentes passam a ser preservadas sem alterações em vez de descartadas. A mesma proteção vale para o PowerShell (`powershell1.2.4`).
- Exemplo `samples/example.bash`: casos da issue (incluindo a variante com `\042` e as repetições), cada um seguido de código a formatar, e uma função com heredoc dentro de `"$(...)"`.
- Testes: casos de regressão com a linha da issue repetida 1, 2 e 3 vezes (verificando também que a saída é ponto fixo), a variante com `\042`, substituição multilinha, heredoc com apóstrofo, heredoc (`<<` e `<<-`) dentro de `"$(...)"` em bloco indentado, here-strings e aritmética em substituição multilinha, aspas escapadas fora de strings, string aberta até o fim do arquivo e formatação de seleção (com e sem reindentação); testes do lexer para contextos aninhados, contagem de parênteses, escapes, comentários, heredocs (`<<`, `<<-`, vários na mesma linha), here-strings e expansão aritmética.
- Validação adicional com 53 scripts reais (scripts shell do Git for Windows e exemplos do projeto): saída idêntica à versão anterior, exceto nos 2 scripts que usam aspas escapadas fora de strings, onde o formatador deixou de perder linhas (no `zgrep`, a versão anterior reduzia 253 linhas não vazias a 211) e de interpretar código como string. Nenhuma saída altera o conteúdo além de espaços em branco, e todas são ponto fixo. O bloco novo do `example.bash` foi executado no Bash antes e depois da formatação, com a mesma saída.
- O engine `shfmt` não é afetado. Sem novas opções de configuração.

## Informações Adicionais

- Tag relacionada: `shell1.0.14`
- Data de lançamento: **2026-11-16**
