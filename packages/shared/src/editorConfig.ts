import * as fs from 'fs';
import * as path from 'path';
import { EditorConfigProperties, FormatterOptions, LineEnding } from './types';

/**
 * Função principal para ler as configurações do EditorConfig a partir do caminho de um arquivo.
 * Percorre os diretórios de baixo para cima procurando por arquivos `.editorconfig` e mesclando
 * as propriedades encontradas. Suporta globs simples para determinar se as seções do EditorConfig
 * se aplicam ao arquivo.
 * Suporta globs simples: `*`, `?` e alternação `{ext1,ext2}` (sem negação avançada; colchetes são tratados literalmente).
 * @param filePath Caminho absoluto do arquivo para o qual as configurações do EditorConfig devem ser lidas.
 * @returns Um objeto contendo as propriedades do EditorConfig que se aplicam ao arquivo.
 */
export function parseEditorConfig (filePath: string): EditorConfigProperties {
  const props: EditorConfigProperties = {};
  let dir = path.dirname(filePath);
  const fileName = path.basename(filePath);

  // Percorre os diretórios de baixo para cima procurando por arquivos .editorconfig
  while (true) {
    const ecPath = path.join(dir, '.editorconfig');

    // Verifica se o arquivo .editorconfig existe no diretório atual
    if (fs.existsSync(ecPath)) {
      let content: string;

      try {
        content = fs.readFileSync(ecPath, 'utf-8');
      } catch {
        break;
      }

      // Faz o parse do conteúdo do .editorconfig e obtem as propriedades aplicáveis para o arquivo
      const result = parseEditorConfigContent(content, fileName);

      // Verifica se as propriedades encontradas devem sobrescrever as propriedades atuais
      if (result.props.indent_style !== undefined && props.indent_style === undefined) {
        props.indent_style = result.props.indent_style;
      }
      if (result.props.indent_size !== undefined && props.indent_size === undefined) {
        props.indent_size = result.props.indent_size;
      }
      if (result.props.end_of_line !== undefined && props.end_of_line === undefined) {
        props.end_of_line = result.props.end_of_line;
      }
      if (result.props.insert_final_newline !== undefined && props.insert_final_newline === undefined) {
        props.insert_final_newline = result.props.insert_final_newline;
      }
      if (result.props.trim_trailing_whitespace !== undefined && props.trim_trailing_whitespace === undefined) {
        props.trim_trailing_whitespace = result.props.trim_trailing_whitespace;
      }

      // Se a seção root for encontrada, para o loop (não procura mais em diretórios superiores)
      if (result.isRoot) {
        break;
      }
    }

    // Verifica se chegou à raiz do sistema de arquivos para evitar loop infinito
    const parent = path.dirname(dir);
    if (parent === dir) {
      break;
    }

    dir = parent;
  }

  return props;
}

/**
 * Função para aplicar as propriedades do EditorConfig sobre um conjunto base de opções de formatação.
 * As propriedades do EditorConfig só sobrescrevem as opções padrão apenas quando definidas.
 * @param baseOpts Opções atuais do formatador.
 * @param ecProps Propriedades lidas do EditorConfig.
 * @returns Novas opções do formatador com as propriedades do EditorConfig aplicadas.
 */
export function applyEditorConfigOverrides<T extends FormatterOptions> (baseOpts: T, ecProps: EditorConfigProperties): T {
  const opts = { ...baseOpts };

  // Verifica se a propriedade indent_style está definida para aplicar a configuração de estilo de indentação (espaço ou tabulação)
  if (ecProps.indent_style !== undefined) {
    opts.indentStyle = ecProps.indent_style;
  }

  // Verifica se a propriedade indent_style é 'space' e se indent_size está definida para aplicar a configuração de indentação usando espaços
  if (ecProps.indent_style === 'space' && ecProps.indent_size !== undefined) {
    opts.indentSize = ecProps.indent_size;
  }

  // Verifica se a propriedade trim_trailing_whitespace está definida para aplicar a configuração de remoção de espaços em branco no final das linhas
  if (ecProps.trim_trailing_whitespace !== undefined) {
    opts.trimTrailingWhitespace = ecProps.trim_trailing_whitespace;
  }

  // Verifica se a propriedade insert_final_newline está definida para aplicar a configuração de inserção de nova linha no final do arquivo
  if (ecProps.insert_final_newline !== undefined) {
    opts.insertFinalNewline = ecProps.insert_final_newline;
  }

  // Verifica se a propriedade end_of_line está definida para aplicar a configuração de final de linha
  if (ecProps.end_of_line !== undefined) {
    const map: Record<string, LineEnding> = { lf: 'LF', crlf: 'CRLF', cr: 'LF' };
    opts.lineEnding = map[ecProps.end_of_line] ?? opts.lineEnding;
  }

  return opts;
}

/**
 * Função para fazer o parse do conteúdo de um arquivo `.editorconfig` e retornar as propriedades
 * que se aplicam ao nome de arquivo fornecido. Suporta globs simples para determinar se as seções
 * do EditorConfig se aplicam ao arquivo.
 * @param content O conteúdo do arquivo `.editorconfig` como string.
 * @param fileName O nome do arquivo para o qual as propriedades devem ser aplicadas.
 * @returns Um objeto contendo as propriedades do EditorConfig que se aplicam ao arquivo e um indicador se a seção root foi encontrada.
 */
export function parseEditorConfigContent (content: string, fileName: string): { props: EditorConfigProperties; isRoot: boolean } {
  const props: EditorConfigProperties = {};
  let isRoot = false;
  let sectionApplies = false;

  // Divide o conteúdo em linhas suportando: \r\n (Windows), \n (Unix/Linux/macOS atual) e \r (maOS legado)
  const lines = content.split(/\r\n|\r|\n/);

  // Itera sobre as linhas do conteúdo do .editorconfig
  for (const rawLine of lines) {
    const line = rawLine.trim();

    // Ignora linhas vazias e comentários (linhas que começam com # ou ;)
    if (line === '' || line.startsWith('#') || line.startsWith(';')) {
      continue;
    }

    // Detecta seção [glob]: linha que começa com '[' e termina com ']', capturando o padrão glob interno
    const sectionMatch = line.match(/^\[(.+)\]$/);
    if (sectionMatch) {
      sectionApplies = globMatch(sectionMatch[1].trim(), fileName);

      continue;
    }

    // Detecta chave=valor
    const kvMatch = line.match(/^([^=]+)=(.*)$/);
    if (!kvMatch) {
      continue;
    }

    // Captura tudo antes do '=' como chave e tudo depois como valor
    const key = kvMatch[1].trim().toLowerCase();
    const value = kvMatch[2].trim().toLowerCase();

    // Verifica se a chave é 'root' para determinar se esta seção é a raiz do EditorConfig
    if (key === 'root' && value === 'true') {
      isRoot = true;

      continue;
    }

    // Verifica se a seção se aplica ao arquivo atual
    if (!sectionApplies) {
      continue;
    }

    // Processa as propriedades relevantes do EditorConfig
    switch (key) {
      case 'indent_style':
        // Verifica se o valor é 'space' ou 'tab'
        if (value === 'space' || value === 'tab') {
          props.indent_style = value;
        }

        break;
      case 'indent_size':
        // Verifica se o valor é um número válido antes de atribuir à propriedade indent_size
        const n = parseInt(value, 10);
        if (!isNaN(n) && n >= 0) {
          props.indent_size = n;
        }

        break;
      case 'end_of_line':
        // Verifica se o valor é 'lf', 'crlf' ou 'cr'
        if (value === 'lf' || value === 'crlf' || value === 'cr') {
          props.end_of_line = value;
        }

        break;
      case 'insert_final_newline':
        props.insert_final_newline = value === 'true';

        break;
      case 'trim_trailing_whitespace':
        props.trim_trailing_whitespace = value === 'true';

        break;
    }
  }

  return { props, isRoot };
}

/**
 * Função para verificar se um nome de arquivo corresponde a um glob simplificado de editorconfig.
 * Suporta `*`, `?`, `*.ext` e alternação `{ext1,ext2}`. Colchetes (`[...]`) são tratados como caracteres literais.
 * @param pattern O padrão glob do EditorConfig.
 * @param fileName O nome do arquivo a ser verificado.
 * @returns Verdadeiro se o nome do arquivo corresponder ao padrão, falso caso contrário.
 */
export function globMatch (pattern: string, fileName: string): boolean {
  // Suporta o glob universal '*' que corresponde a qualquer arquivo
  if (pattern === '*') {
    return true;
  }

  // Inicializa uma string para regex
  let regex = '';

  // Itera sobre os caracteres do padrão e constrói uma expressão regular correspondente
  for (let i = 0; i < pattern.length; i++) {
    const ch = pattern[i];

    // Verifica os caracteres especiais de glob e os converte para regex
    switch (ch) {
      case '*':
        regex += '[^/]*'; // Qualquer sequência exceto separadores de diretório
        break;
      case '?':
        regex += '[^/]';  // Exatamente um caractere que não seja separador de diretório
        break;
      case '{':
        regex += '(';     // Inicia um grupo de alternativas
        break;
      case '}':
        regex += ')';     // Termina um grupo de alternativas
        break;
      case ',':
        regex += '|';     // Separador de alternativas (OR)
        break;
      default:
        // Escapa caracteres especiais de regex para que sejam tratados literalmente
        regex += '.+^$|()[]\\'.includes(ch) ? '\\' + ch : ch;
        break;
    }
  }

  // Verifica se o nome do arquivo corresponde à expressão regular construída a partir do glob
  return new RegExp('^' + regex + '$').test(fileName);
}
