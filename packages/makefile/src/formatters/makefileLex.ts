import { hasOddTrailingExplicitMarker } from '@tooark/ark-format-shared/indent';
import { isFullLineComment } from '@tooark/ark-format-shared/lex';
import type { ClassifiedLine, MakefileLineKind } from './types';

export { isFullLineComment } from '@tooark/ark-format-shared/lex';

/** Expressão regular para abertura de condicionais do make (`ifeq`, `ifneq`, `ifdef`, `ifndef`). */
const CONDITIONAL_OPEN_RE = /^(ifeq|ifneq|ifdef|ifndef)(\s|\(|$)/;

/** Expressão regular para a cláusula `else` de condicionais (incluindo `else ifeq ...` e `else# comentário`). */
const CONDITIONAL_ELSE_RE = /^else(\s|#|$)/;

/** Expressão regular para o fechamento de condicionais (`endif`, inclusive `endif# comentário`). */
const CONDITIONAL_END_RE = /^endif(\s|#|$)/;

/**
 * Expressão regular para a abertura de definição multilinha (`define NOME`), com os prefixos
 * aceitos pelo make em qualquer ordem (`export define`, `override define`, `private define`).
 */
const DEFINE_OPEN_RE = /^(?:(?:override|export|private)\s+)*define(\s|$)/;

/**
 * Expressão regular para o fechamento de definição multilinha (`endef`). O make só reconhece o
 * `endef` seguido de espaço ou do fim da linha: `endef# comentário` é texto do corpo.
 */
const DEFINE_END_RE = /^endef(\s|$)/;

/**
 * Expressão regular para a abertura de um `define` aninhado no corpo de outro. Dentro do corpo o
 * make só conta o `define` sem prefixos: `override define X` é texto do corpo e não aninha.
 */
const NESTED_DEFINE_OPEN_RE = /^define(\s|$)/;

/**
 * Expressão regular para uma linha formada apenas por chamadas de função (`$(eval ...)`,
 * `$(call ...)`, `$(info ...)`, `$(foreach ...)`): o nome da função é seguido de espaço.
 */
const FUNCTION_CALL_START_RE = /^\$[({][A-Za-z][\w-]*[ \t]/;

/** Caractere que ocupa o lugar do conteúdo de referências na máscara de `maskReferences`. */
const REFERENCE_MASK = '\u0001';

/** Expressão regular para diretivas do make que não são atribuições nem alvos. */
const DIRECTIVE_RE = /^(-?include|sinclude|export|unexport|override|undefine|private|vpath|load|-load)(\s|$)/;

/**
 * Expressão regular para atribuições de variável, com prefixos opcionais (`export`, `override`, `private`).
 * Suporta os operadores `=`, `:=`, `::=`, `:::=`, `?=`, `+=` e `!=`.
 */
const ASSIGNMENT_RE = /^(?:(?:export|override|private|unexport)\s+)*[^\s:#=]+\s*(:{1,3}=|\?=|\+=|!=|=)/;

/**
 * Expressão regular para declarações de alvo (`alvo: pré-requisitos`).
 * Aceita múltiplos alvos separados por espaço e regras de padrão (`%.o: %.c`),
 * exigindo `:` ou `::` que não faça parte de um operador de atribuição (`:=`, `::=`).
 */
const TARGET_RE = /^[^\s#=][^#=]*?::?(?!=)/;

/**
 * Função para verificar se uma linha termina com uma continuação de linha (`\`).
 * Um número par de barras invertidas representa barras literais escapadas, não continuação.
 * @param line A linha a ser verificada (pode conter espaços finais, que são ignorados).
 * @returns Verdadeiro se a linha terminar com um número ímpar de barras invertidas.
 */
export function endsWithLineContinuation (line: string): boolean {
  return hasOddTrailingExplicitMarker(line.trimEnd(), '\\');
}

/**
 * Função para verificar se uma linha usa o prefixo de recipe (TAB) do make.
 * @param raw A linha original, com a indentação preservada.
 * @returns Verdadeiro se a linha começar com TAB.
 */
export function hasRecipePrefix (raw: string): boolean {
  return raw.startsWith('\t');
}

/**
 * Função para mascarar as referências de uma linha de Makefile: chamadas de função e referências a
 * variáveis (`$(...)`, `${...}`), variáveis de um caractere (`$@`, `$<`) e o escape `$$`.
 * O texto dentro de uma referência não é sintaxe da linha: `:`, `=`, `#` e espaços ali são
 * argumentos (`$(info ver http://host/a)`, `$(subst #,,$(X))`, `$(eval $(call t,a,b:c))`).
 * O resultado tem o mesmo tamanho da entrada, com cada caractere de referência trocado por um
 * marcador que não é espaço nem operador, então posições encontradas na máscara valem no original.
 * Como no make, a referência fecha no delimitador do mesmo tipo que a abriu, contando os
 * aninhados; sem fechamento na linha (chamada que continua com `\`), vai até o fim da linha.
 * @param text A linha (ou trecho) a ser mascarada.
 * @returns O texto com o conteúdo das referências substituído pelo marcador.
 */
export function maskReferences (text: string): string {
  let masked = '';

  for (let i = 0; i < text.length;) {
    // Fora de referência o caractere é mantido
    if (text[i] !== '$' || i + 1 >= text.length) {
      masked += text[i];
      i++;
      continue;
    }

    const open = text[i + 1];
    let end = i + 2;

    // Referência entre parênteses ou chaves: avança até o fechamento correspondente
    if (open === '(' || open === '{') {
      const close = open === '(' ? ')' : '}';
      let depth = 1;

      while (end < text.length && depth > 0) {
        if (text[end] === open) {
          depth++;
        } else if (text[end] === close) {
          depth--;
        }

        end++;
      }
    }

    masked += REFERENCE_MASK.repeat(end - i);
    i = end;
  }

  return masked;
}

/**
 * Função para verificar se o caractere na posição informada está escapado por barra invertida
 * (precedido por um número ímpar de `\`).
 * @param text O texto em análise.
 * @param i A posição do caractere.
 * @returns Verdadeiro se o caractere estiver escapado.
 */
function isEscaped (text: string, i: number): boolean {
  let backslashes = 0;

  for (let j = i - 1; j >= 0 && text[j] === '\\'; j--) {
    backslashes++;
  }

  return backslashes % 2 === 1;
}

/**
 * Função para encontrar a posição do início de um comentário em uma linha de Makefile.
 * Ignora `#` escapados com `\` e `#` dentro de referências (`$(...)`, `${...}`), que o make trata
 * como caracteres literais.
 * @param code A linha de código a ser analisada.
 * @returns A posição do início do comentário ou -1 se não houver comentário.
 */
export function findCommentStart (code: string): number {
  const masked = maskReferences(code);

  // Itera sobre a linha para encontrar um `#` fora de referências e não escapado
  for (let i = 0; i < masked.length; i++) {
    if (masked[i] === '#' && !isEscaped(code, i)) {
      return i;
    }
  }

  return -1;
}

/**
 * Função para encontrar o separador de uma declaração de alvo (`:` ou `::`) em uma linha.
 * Não são separadores: o `:` dentro de referências (`$(info http://host)`), o de operadores de
 * atribuição (`:=`, `::=`, `:::=`), o escapado (`\:`) e o de uma letra de unidade do Windows
 * (`C:/out/a.o: a.c`), reconhecida como uma única letra no início de uma palavra seguida de
 * `:/` ou `:\`.
 * @param code A parte de código da linha (sem comentário).
 * @returns A posição e o tamanho do separador, ou null se a linha não tiver um.
 */
export function findTargetSeparator (code: string): { index: number; length: number } | null {
  const masked = maskReferences(code);

  for (let i = 0; i < masked.length; i++) {
    if (masked[i] !== ':') {
      continue;
    }

    let end = i;

    // Agrupa os `:` consecutivos para reconhecer os operadores de atribuição
    while (masked[end] === ':') {
      end++;
    }

    // Operador de atribuição, `:` escapado ou letra de unidade: continua a busca
    const isDriveLetter = end - i === 1 && /[\\/]/.test(masked[end] ?? '') && /^[A-Za-z]$/.test(masked[i - 1] ?? '') && (i === 1 || /\s/.test(masked[i - 2]));

    if (masked[end] === '=' || isEscaped(code, i) || isDriveLetter) {
      i = end - 1;
      continue;
    }

    return { index: i, length: Math.min(2, end - i) };
  }

  return null;
}

/**
 * Função para calcular a variação da profundidade de blocos `define` causada por uma linha do
 * corpo de um `define`. Como no make, só contam o `define` sem prefixos (abre um bloco aninhado) e
 * o `endef` seguido de espaço ou do fim da linha (fecha um bloco); linhas com o prefixo de recipe
 * (TAB) nunca são diretivas dentro do corpo.
 * @param raw A linha original, com a indentação preservada.
 * @returns `1` se a linha abre um bloco aninhado, `-1` se fecha um bloco e `0` caso contrário.
 */
export function defineDepthChange (raw: string): number {
  // Linha de recipe dentro do corpo: sempre texto
  if (hasRecipePrefix(raw)) {
    return 0;
  }

  const trimmed = raw.trim();

  if (NESTED_DEFINE_OPEN_RE.test(trimmed)) {
    return 1;
  }

  return DEFINE_END_RE.test(trimmed) ? -1 : 0;
}

/**
 * Função para verificar se uma linha é formada apenas por chamadas de função do make, como
 * `$(eval $(call regra,x))`, `$(foreach t,$(T),...)` ou `$(info texto)`, com comentário opcional.
 * Sem o prefixo de recipe (TAB), uma linha assim é avaliada pelo make na leitura do arquivo, mesmo
 * depois de uma regra: não é um comando de recipe ao qual falta o TAB.
 * @param trimmed A linha sem espaços em branco iniciais e finais.
 * @returns Verdadeiro se a linha contiver apenas chamadas de função.
 */
export function isStandaloneFunctionCall (trimmed: string): boolean {
  const commentStart = findCommentStart(trimmed);
  const code = commentStart >= 0 ? trimmed.slice(0, commentStart).trimEnd() : trimmed;

  // Começa por uma chamada de função e não há nada fora de referências além de espaços
  return FUNCTION_CALL_START_RE.test(code) && !/[^\u0001\s]/.test(maskReferences(code));
}

/**
 * Função para verificar se uma linha classificada como alvo é, na verdade, um comando de recipe.
 * Usada apenas dentro do contexto de recipe, para desambiguar comandos de shell que contêm `:`
 * (ex.: `@echo "Projeto: $(NAME)"` ou `docker run -p 8080:80`).
 * Sinais de comando:
 * - A linha começa com um modificador de recipe do make (`@`, `-` ou `+`).
 * - O `:` aparece apenas dentro de aspas (em um alvo real, o separador fica fora de aspas).
 * @param trimmed A linha sem espaços em branco iniciais e finais.
 * @returns Verdadeiro se a linha deve ser tratada como comando de recipe.
 */
export function looksLikeRecipeCommand (trimmed: string): boolean {
  // Modificadores de recipe do make no início da linha indicam comando
  if (/^[@+-]/.test(trimmed)) {
    return true;
  }

  // Remove os trechos entre aspas e verifica se ainda há um separador de alvo
  const unquoted = trimmed.replace(/"[^"]*"|'[^']*'/g, '');

  return !TARGET_RE.test(maskReferences(unquoted));
}

/**
 * Função para determinar o tipo de uma linha de Makefile a partir do conteúdo sem indentação.
 * A classificação é livre de contexto: o formatador é responsável por aplicar o contexto
 * (ex.: linhas com prefixo TAB dentro de um bloco de recipe são recipes, não importa o conteúdo).
 * @param trimmed A linha sem espaços em branco iniciais e finais.
 * @returns O tipo da linha, conforme `MakefileLineKind`.
 */
export function classifyTrimmedLine (trimmed: string): MakefileLineKind {
  // Linha vazia ou contendo apenas espaços em branco
  if (trimmed === '') {
    return 'blank';
  }

  // Comentário de linha inteira
  if (isFullLineComment(trimmed)) {
    return 'comment';
  }

  // Definições multilinha (define ... endef) — verificadas antes das demais diretivas
  if (DEFINE_OPEN_RE.test(trimmed)) {
    return 'define-open';
  }
  if (DEFINE_END_RE.test(trimmed)) {
    return 'define-end';
  }

  // Condicionais (ifeq/ifneq/ifdef/ifndef ... else ... endif)
  if (CONDITIONAL_OPEN_RE.test(trimmed)) {
    return 'conditional-open';
  }
  if (CONDITIONAL_ELSE_RE.test(trimmed)) {
    return 'conditional-else';
  }
  if (CONDITIONAL_END_RE.test(trimmed)) {
    return 'conditional-end';
  }

  // Operadores e separadores dentro de referências (`$(...)`, `${...}`) são argumentos, não
  // sintaxe da linha: a atribuição e o alvo são procurados com as referências mascaradas
  const masked = maskReferences(trimmed);

  // Atribuições de variável — verificadas antes de diretivas para capturar `export VAR := valor`
  if (ASSIGNMENT_RE.test(masked)) {
    return 'assignment';
  }

  // Diretivas do make (include, export, vpath, etc.)
  if (DIRECTIVE_RE.test(trimmed)) {
    return 'directive';
  }

  // Declarações de alvo (regras)
  if (TARGET_RE.test(masked)) {
    return 'target';
  }

  return 'other';
}

/**
 * Função para classificar uma linha de Makefile, produzindo o tipo e metadados úteis para o formatador.
 * @param raw A linha original, com a indentação preservada.
 * @returns Um objeto `ClassifiedLine` com o tipo da linha, o conteúdo original, o conteúdo sem
 * espaços em branco e a indicação de continuação de linha.
 */
export function classifyLine (raw: string): ClassifiedLine {
  const trimmed = raw.trim();

  return {
    kind: classifyTrimmedLine(trimmed),
    raw,
    trimmed,
    endsWithContinuation: endsWithLineContinuation(raw)
  };
}

/**
 * Função para detectar se o texto redefine o prefixo de recipe do make (`.RECIPEPREFIX`).
 * Quando o prefixo é redefinido, a detecção de recipes por TAB deixa de ser válida e o
 * formatador deve preservar o documento sem alterações por segurança.
 * @param textLf O texto completo do documento, com finais de linha normalizados para LF.
 * @returns Verdadeiro se o texto contiver uma atribuição de `.RECIPEPREFIX`.
 */
export function usesCustomRecipePrefix (textLf: string): boolean {
  return /^\s*\.RECIPEPREFIX\s*(:{1,3}=|\?=|\+=|!=|=)/m.test(textLf);
}
