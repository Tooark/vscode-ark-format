import * as fs from 'fs';
import * as path from 'path';
import { ShellFormatterOptions, LineEnding, EditorConfigProperties } from './types';

/**
 * Função principal para ler as configurações do EditorConfig a partir do caminho de um arquivo.
 * Percorre os diretórios de baixo para cima procurando por arquivos `.editorconfig` e mesclando
 * as propriedades encontradas. Suporta globs simples para determinar se as seções do EditorConfig
 * se aplicam ao arquivo.
 * Suporta globs simples: `*`, `[ext]` e `[ext1|ext2]` (sem negação avançada). * 
 * @param filePath Caminho absoluto do arquivo para o qual as configurações do EditorConfig devem ser lidas.
 * @returns Um objeto contendo as propriedades do EditorConfig que se aplicam ao arquivo.
 */
export function parseEditorConfig (filePath: string): EditorConfigProperties {
  const props: EditorConfigProperties = {};
  let dir = path.dirname(filePath);
  const fileName = path.basename(filePath);

  // Percorre diretórios de baixo para cima
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

      // Faz o parse do conteúdo do .editorconfig e obtém as propriedades que se aplicam ao arquivo
      const result = parseEditorConfigContent(content, fileName);

      // Verifica se as propriedades encontradas devem sobrescrever as propriedades atuais (somente se definidas)
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

      // Se a seção root foi encontrada, para o loop (não procura mais em diretórios superiores)
      if (result.isRoot) {
        break;
      }
    }

    // Se chegou na raiz do sistema de arquivos, para o loop
    const parent = path.dirname(dir);
    if (parent === dir) {
      break;
    }

    dir = parent;
  }

  return props;
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

  // Divide o conteúdo em linhas suportando: \r\n (Windows), \n (Unix/Linux/macOS atual) e \r (macOS legado pre-OS X)
  const lines = content.split(/\r\n|\r|\n/);

  // Itera sobre as linhas do conteúdo do .editorconfig
  for (const rawLine of lines) {
    const line = rawLine.trim();

    // Ignora linhas vazias e comentários
    if (line === '' || line.startsWith('#') || line.startsWith(';')) {
      continue;
    }

    // Detecta seção [glob]: linha que começa com '[' e termina com ']', capturando o padrão glob interno
    const sectionMatch = line.match(/^\[(.+)\]$/);
    if (sectionMatch) {
      sectionApplies = globMatch(sectionMatch[1].trim(), fileName);

      continue;
    }

    // Detecta par chave=valor: captura tudo antes do '=' como chave e tudo após como valor (valor pode ser vazio)
    const kvMatch = line.match(/^([^=]+)=(.*)$/);
    if (!kvMatch) {
      continue;
    }

    const key = kvMatch[1].trim().toLowerCase();
    const value = kvMatch[2].trim().toLowerCase();

    // Propriedade root (nível global, fora de seções)
    if (key === 'root' && value === 'true') {
      isRoot = true;

      continue;
    }

    // Verifica se a seção atual se aplica ao arquivo. Propriedades fora de seções ou na seção [*] se aplicam a todos os arquivos.
    if (!sectionApplies) {
      continue;
    }

    // Processa as propriedades relevantes do EditorConfig
    switch (key) {
      case 'indent_style':
        if (value === 'space' || value === 'tab') {
          props.indent_style = value;
        }

        break;
      case 'indent_size':
        const n = parseInt(value, 10);

        // O valor de indent_size deve ser um número inteiro não negativo
        if (!isNaN(n) && n >= 0) {
          props.indent_size = n;
        }

        break;
      case 'end_of_line':
        // O valor de end_of_line deve ser 'lf', 'crlf' ou 'cr'
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
 * Suporta `*`, `*.ext`, `{ext1,ext2}`, `[ext]` simples.
 * @param pattern O padrão glob do EditorConfig.
 * @param fileName O nome do arquivo a ser verificado.
 * @returns Verdadeiro se o nome do arquivo corresponder ao padrão, falso caso contrário.
 */
export function globMatch (pattern: string, fileName: string): boolean {
  // * sozinho casa com tudo
  if (pattern === '*') {
    return true;
  }

  // Converte o padrão para regex simples
  let regex = '';

  // Itera sobre os caracteres do padrão e constrói uma expressão regular correspondente
  for (let i = 0; i < pattern.length; i++) {
    const ch = pattern[i];

    switch (ch) {
      case '*':
        regex += '[^/]*'; // qualquer sequência exceto separador de diretório
        break;
      case '?':
        regex += '[^/]'; // exatamente um caractere exceto separador de diretório
        break;
      case '{':
        regex += '('; // início de grupo de alternativas
        break;
      case '}':
        regex += ')'; // fim de grupo de alternativas
        break;
      case ',':
        regex += '|'; // separador de alternativas (OR)
        break;
      default:
        // Escapa caracteres especiais de regex para tratá-los como literais
        regex += '.+^$|()[]\\'.includes(ch) ? '\\' + ch : ch;
        break;
    }
  }

  // Verifica se o nome do arquivo corresponde à regex construída a partir do padrão
  return new RegExp('^' + regex + '$').test(fileName);
}

/**
 * Função para aplicar as propriedades do EditorConfig sobre as opções padrão do formatador de shell.
 * As propriedades do EditorConfig sobrescrevem as opções padrão apenas quando definidas.
 * @param baseOpts Opções atuais do formatador.
 * @param ecProps Propriedades lidas do EditorConfig.
 * @returns Novas opções do formatador com as propriedades do EditorConfig aplicadas.
 */
export function applyEditorConfigOverrides (baseOpts: ShellFormatterOptions, ecProps: EditorConfigProperties): ShellFormatterOptions {
  const opts = { ...baseOpts };

  // Verifica se a propriedade indent_style é 'space' e se indent_size está definida para aplicar a configuração de indentação
  if (ecProps.indent_style === 'space' && ecProps.indent_size !== undefined) {
    opts.indentSize = ecProps.indent_size;
  }

  // Verifica se a propriedade end_of_line está definida para aplicar a configuração de quebra de linha
  if (ecProps.end_of_line !== undefined) {
    const map: Record<string, LineEnding> = { lf: 'LF', crlf: 'CRLF', cr: 'LF' };
    opts.lineEnding = map[ecProps.end_of_line] ?? opts.lineEnding;
  }

  // Verifica se a propriedade insert_final_newline está definida para aplicar a configuração de nova linha no final do arquivo
  if (ecProps.insert_final_newline !== undefined) {
    opts.insertFinalNewline = ecProps.insert_final_newline;
  }

  // Verifica se a propriedade trim_trailing_whitespace está definida para aplicar a configuração de remoção de espaços em branco no final das linhas
  if (ecProps.trim_trailing_whitespace !== undefined) {
    opts.trimTrailingWhitespace = ecProps.trim_trailing_whitespace;
  }

  return opts;
}
