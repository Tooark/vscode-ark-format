# Release powershell1.2.4

## Alterações desta versão

- Versão do pacote atualizada de `1.2.3` para `1.2.4`.
- **Correção** (equivalente PowerShell da [#34](https://github.com/Tooark/vscode-ark-format/issues/34) do formatador Shell): o formatador apagava ou deixava de formatar as linhas seguintes a uma string com aspas dentro de uma subexpressão, como `Write-Host "Nome: $($user.Name.Trim('"'))"`. Eram dois defeitos combinados:
  - O lexer tratava a subexpressão `$(...)` dentro de aspas duplas como texto literal. As aspas internas fechavam e reabriam a string externa, e a linha terminava "dentro de aspas simples".
  - As linhas de uma string multilinha só eram gravadas na saída quando a string fechava (pacote compartilhado). Se o arquivo terminasse com a string aberta, essas linhas eram descartadas.
- O lexer passa a tratar `$(...)` dentro de aspas duplas como um novo contexto de aspas, como o PowerShell:
  - Aspas simples e duplas dentro da subexpressão abrem strings próprias, sem fechar a string externa.
  - A subexpressão fecha no `)` correspondente: parênteses entre aspas não contam, e subexpressões aninhadas são suportadas.
  - A crase escapa o próximo caractere; `#` no início de um token é comentário até o fim da linha.
  - O estado continua correto quando a subexpressão ocupa várias linhas.
  - Here-strings declaradas dentro da subexpressão (`"$(@'`) têm o corpo e o terminador preservados sem reindentação, pois o terminador precisa permanecer na coluna 0.
- **Correção**: aspas escapadas com crase fora de strings (`` `" `` e `` `' ``, por exemplo ``Write-Host it`'s``) abriam uma string por engano. A crase passa a escapar o próximo caractere também no código normal. O tratamento de `` `# `` e da crase de continuação no fim da linha não muda.
- **Proteção contra perda de dados** (pacote compartilhado): se uma string continuar aberta até o fim do arquivo — porque está realmente aberta ou por uma interpretação incorreta das aspas —, as linhas pendentes passam a ser preservadas sem alterações em vez de descartadas.
- Exemplo `samples/example.complex.ps1`: nova seção com subexpressões com aspas aninhadas, em uma linha e em várias linhas. Na versão anterior, o formatador apagava 58 das 100 linhas desse exemplo.
- Testes: casos de regressão com a linha repetida 1, 2 e 3 vezes (verificando também que a saída é ponto fixo), subexpressão multilinha, here-string dentro de subexpressão em bloco indentado, aspas escapadas com crase e string aberta até o fim do arquivo; testes do lexer para contextos aninhados, contagem de parênteses, escapes, comentários e here-strings aninhadas.
- Validação adicional com 176 scripts e módulos PowerShell reais (módulos do Windows PowerShell e do PowerShell 7): saída idêntica à versão anterior, sem alteração de conteúdo além de espaços em branco, e todas as saídas são ponto fixo.
- Mesma correção aplicada ao formatador de Shell na versão `1.0.14`. Sem novas opções de configuração.

## Informações Adicionais

- Tag relacionada: `powershell1.2.4`
- Data de lançamento: **2026-11-16**
