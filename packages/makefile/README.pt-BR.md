# Ark Format: Makefile

[![Open VSX Version](https://img.shields.io/open-vsx/v/tooark/ark-format-makefile)](https://open-vsx.org/extension/tooark/ark-format-makefile)
[![Open VSX Downloads](https://img.shields.io/open-vsx/dt/tooark/ark-format-makefile)](https://open-vsx.org/extension/tooark/ark-format-makefile)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Uma extensão de formatação segura para **Makefiles** (`Makefile`, `GNUmakefile`, `*.mk`) no **Visual Studio Code**.
Mantenha seus Makefiles formatados de forma consistente sem nunca quebrar as regras estritas de espaçamento do `make`.

🌍 **Idiomas:** [![USA Flag](https://flagcdn.com/w20/us.png) English](https://github.com/Tooark/vscode-ark-format/blob/main/packages/makefile/README.md) · ![Brazil Flag](https://flagcdn.com/w20/br.png) **Português (este arquivo)**

---

## ✨ Funcionalidades

- 🎯 **Formatação de documento completo** — formate arquivos inteiros com um único comando
- ✏️ **Formatação de seleção** — formate apenas o texto selecionado
- 🎛️ **Altamente configurável** — controle indentação de condicionais, espaçamento e comportamento
- 🌍 **Interface multilíngue** — Inglês (EN) e Português do Brasil (PT-BR)
- 📋 **Suporte a .editorconfig** — respeita a configuração do projeto (opcional)
- 🛡️ **Segurança específica de Makefile** — o prefixo TAB de recipes e blocos `define` nunca são quebrados
- ⚡ **Desempenho otimizado** — processamento rápido e leve

---

## 🛡️ Invariantes de Segurança

Makefiles têm semântica estrita de espaços em branco. O formatador é construído sobre invariantes que garantem que ele nunca altera o que o `make` executa:

- **Linhas de recipe** (prefixadas com TAB) mantêm o prefixo e o corpo nunca é modificado — o conteúdo da recipe pertence ao shell.
- **Blocos `define ... endef`** são preservados sem alterações.
- **Continuações de linha** (`\`) são preservadas; apenas espaços após a barra invertida são removidos.
- **`.RECIPEPREFIX`**: se o arquivo redefinir o prefixo de recipe, o documento é preservado integralmente (a detecção por TAB deixa de valer).

---

## 🚀 Primeiros Passos

### Instalação

- **Open VSX:** <https://open-vsx.org/extension/tooark/ark-format-makefile>
- **VS Code Marketplace:** <https://marketplace.visualstudio.com/items?itemName=tooark.ark-format-makefile>

Ou dentro do VS Code:

1. Abra **Extensões** (`Ctrl+Shift+X` / `Cmd+Shift+X`)
2. Pesquise por **Ark Format: Makefile**
3. Clique em **Instalar**

---

## 🧩 Como Usar

### Prévia

![Ark Format Makefile - Configurações](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/packages/makefile/media/makefile-settings.gif)

![Ark Format Makefile - Formatando Código](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/packages/makefile/media/makefile-using.gif)

### Formatar um Documento Completo

- Pressione **Shift+Alt+F** (Windows/Linux) ou **Shift+Option+F** (Mac)
- Ou use o comando: `Editor: Formatar Documento`

### Formatar uma Seleção

- Selecione o texto que deseja formatar
- Pressione **Ctrl+K Ctrl+F** (Windows/Linux) ou **Cmd+K Cmd+F** (Mac)
- Ou use o comando: `Editor: Formatar Seleção`

> Dica: Você pode definir o Ark Format como formatador padrão para arquivos Makefile e garantir formatação consistente ao salvar.

---

## 📄 Tipos de Arquivo Suportados

- `Makefile` - arquivo de make padrão
- `makefile` - arquivo de make padrão (minúsculo)
- `GNUmakefile` - arquivo de make GNU
- `*.mk` — arquivos de include do Make

---

## ⚙️ Configuração

Personalize o formatador no `settings.json`:

```json
{
  "arkFormatMakefile.enabled": true,
  "arkFormatMakefile.effectLanguages": ["makefile"],
  "arkFormatMakefile.useEditorConfig": false,
  "arkFormatMakefile.indentConditionals": true,
  "arkFormatMakefile.normalizeRecipePrefix": true,
  "arkFormatMakefile.alignAssignments": false,
  "arkFormatMakefile.indentSize": 2,
  "arkFormatMakefile.lineEnding": "LF",
  "arkFormatMakefile.trimTrailingWhitespace": true,
  "arkFormatMakefile.maxConsecutiveBlankLines": 1,
  "arkFormatMakefile.removeLeadingBlankLines": true,
  "arkFormatMakefile.insertFinalNewline": true,
  "arkFormatMakefile.collapseSpaces": true,
  "arkFormatMakefile.spacing.spaceAroundAssignment": true,
  "arkFormatMakefile.spacing.spaceAfterTargetColon": true,
  "arkFormatMakefile.spacing.spaceAfterCommentMarker": true,
  "arkFormatMakefile.rangeFormatting.enabled": true,
  "arkFormatMakefile.rangeFormatting.reindent": false,
  "arkFormatMakefile.rangeFormatting.useDocumentContext": true
}
```

### Descrição das Configurações

| Opção                                | Padrão       | Descrição                                                                      |
| ------------------------------------ | ------------ | ------------------------------------------------------------------------------ |
| `enabled`                            | `true`       | Ativa ou desativa a extensão                                                   |
| `effectLanguages`                    | `"makefile"` | IDs de linguagem para os quais o formatador está ativo                         |
| `useEditorConfig`                    | `false`      | Usa o contexto do arquivo `.editorconfig` para configuração                    |
| `indentConditionals`                 | `true`       | Indenta corpos de condicionais (`ifeq`/`else`/`endif`) usando espaços          |
| `normalizeRecipePrefix`              | `true`       | Converte recipes indentadas com espaços para o prefixo TAB obrigatório         |
| `alignAssignments`                   | `false`      | Alinha operadores de atribuição em blocos contíguos de variáveis               |
| `indentSize`                         | `2`          | Número de espaços por nível de indentação de blocos condicionais               |
| `lineEnding`                         | `LF`         | Tipo de quebra de linha (`Auto`, `LF`, `CRLF`)                                 |
| `trimTrailingWhitespace`             | `true`       | Remove espaços em branco no final das linhas                                   |
| `maxConsecutiveBlankLines`           | `1`          | Número máximo de linhas em branco consecutivas                                 |
| `removeLeadingBlankLines`            | `true`       | Remove linhas em branco no início do arquivo                                   |
| `insertFinalNewline`                 | `true`       | Insere uma nova linha no fim do arquivo                                        |
| `collapseSpaces`                     | `true`       | Colapsa múltiplos espaços (nunca em recipes, comentários, valores ou `define`) |
| `spacing.spaceAroundAssignment`      | `true`       | Adiciona um único espaço em torno dos operadores de atribuição                 |
| `spacing.spaceAfterTargetColon`      | `true`       | Adiciona um único espaço após `:` em declarações de alvo                       |
| `spacing.spaceAfterCommentMarker`    | `true`       | Adiciona um espaço entre `#` e o texto do comentário                           |
| `rangeFormatting.enabled`            | `true`       | Habilita a formatação de intervalo (seleção)                                   |
| `rangeFormatting.reindent`           | `false`      | Re-indenta o intervalo selecionado                                             |
| `rangeFormatting.useDocumentContext` | `true`       | Usa contexto do documento para calcular a profundidade base de condicionais    |

---

## 💡 Dicas & Boas Práticas

- Use **Formatação de Seleção** para ajustar apenas partes específicas sem afetar o resto do arquivo
- Configure **.editorconfig** no seu projeto para manter consistência entre ferramentas
- Combine com outras extensões formatadoras para um workflow completo

---

## 🤝 Contribuindo

- Abra uma issue: [Tooark/vscode-ark-format/issues](https://github.com/Tooark/vscode-ark-format/issues)
- Sugira melhorias ou reporte bugs com exemplos para facilitar a reprodução

---

## 💖 Apoie

Se esta extensão ajuda no seu dia a dia, considere apoiar o desenvolvimento:

- 💙 [GitHub Sponsors](https://github.com/sponsors/paulosfjunior)
- ☕ [Ko-fi](https://ko-fi.com/paulosfjunior)
- 💸 [PayPal](https://www.paypal.com/donate/?business=62KETU4PXBWZC&no_recurring=0&item_name=Ol%C3%A1%21+Sou+o+fundador+e+mantenedor+da+Tooark+%28tooark.com%29+%E2%80%94%0Aum+ecossistema+de+projetos+open+source.%0AObrigado+pelo+apoio%21+%F0%9F%92%9A&currency_code=BRL)

Cada contribuição ajuda a manter o projeto ativo e em evolução. Obrigado! 🙏

---

## 📜 Licença

Este projeto está licenciado sob a [MIT License](LICENSE).
