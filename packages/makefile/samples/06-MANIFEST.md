# 📦 Manifest de Exemplos — ark-format-makefile

## 📋 Inventário Completo

### 🛠️ Exemplos de Código (4 arquivos)

| Arquivo              | Descrição                                                               |
| -------------------- | ----------------------------------------------------------------------- |
| `example.mk`         | Entrada "bagunçada" com erros comuns de formatação                      |
| `Makefile`           | Mesmo conteúdo de `example.mk` com bom espaçamento, mas recipes sem TAB |
| `GNUmakefile`        | Funções GNU make e recipes com continuação                              |
| `example.complex.mk` | Cenário avançado (condicionais aninhados, target-specific vars)         |

### ⚙️ Configuração (2 arquivos)

| Arquivo                 | Descrição                                   |
| ----------------------- | ------------------------------------------- |
| `.editorconfig`         | Regras de projeto para `useEditorConfig`    |
| `settings.example.json` | Configuração completa comentada da extensão |

### 📖 Documentação (8 arquivos)

| Arquivo                   | Descrição                           |
| ------------------------- | ----------------------------------- |
| `00-START-HERE.md`        | Ponto de partida e ordem de leitura |
| `01-QUICK-START.md`       | Setup em 5 minutos                  |
| `02-USER-GUIDE.md`        | Guia completo de configuração e uso |
| `03-FEATURE-INDEX.md`     | Índice por feature e caso de uso    |
| `04-TECHNICAL-SUMMARY.md` | Visão técnica dos exemplos          |
| `05-STRUCTURE.md`         | Mapa visual e fluxos de navegação   |
| `06-MANIFEST.md`          | Este arquivo                        |
| `07-FINAL-REPORT.md`      | Relatório conclusivo                |

## 📊 Estatísticas

| Métrica                  | Valor |
| ------------------------ | ----- |
| Exemplos de código       | 4     |
| Arquivos de configuração | 2     |
| Documentos               | 8     |
| Total                    | 14    |

## 🎯 Casos de Uso por Arquivo

### example.mk

- Testar o formatador pela primeira vez (antes/depois)
- Demonstrar espaçamento de atribuições, alvos e comentários
- Demonstrar normalização de recipe com espaços → TAB

### Makefile

- Testar a recuperação de recipes sem TAB
- Verificar convergência: formatado, produz a mesma saída de `example.mk`

### GNUmakefile

- Funções GNU: `wildcard`, `patsubst`, `shell`
- Recipes com continuação de linha preservadas

### example.complex.mk

- Condicionais aninhados em três níveis
- Todos os operadores de atribuição
- Variáveis por alvo e regras de padrão
- Diretivas `include`/`-include` e `export`

## 🔧 Configurações Incluídas

### .editorconfig

- `indent_size = 2` para condicionais (recipes sempre usam TAB)
- `end_of_line = lf`, `insert_final_newline = true`, `trim_trailing_whitespace = true`

### settings.example.json

- Todas as chaves `arkFormatMakefile.*` com valores recomendados
- Formatador padrão por linguagem + format on save

## 🚀 Como Usar Este Manifest

### Para Exploração

Use as tabelas acima para escolher o exemplo certo para o que quer validar.

### Para Referência

Confirme aqui o que cada arquivo demonstra antes de abrir uma issue.

### Para Aprendizado

Siga a ordem: `example.mk` → `Makefile` → `GNUmakefile` → `example.complex.mk`.

## 🔗 Relações Entre Arquivos

```text
example.mk ──(Format Document)──► mesma saída ◄──(Format Document)── Makefile
settings.example.json ──(configura)──► comportamento do formatador
.editorconfig ──(sobrepõe, se useEditorConfig)──► settings da extensão
0X-*.md ──(documentam)──► todos os anteriores
```
