import * as childProcess from 'child_process';
import { ExecOptions, ExecResult } from './types';
import { isWindows } from './path';

/**
 * Função para dividir uma linha de comando em argumentos, respeitando aspas e caracteres de escape.
 * @param value A linha de comando a ser dividida.
 * @returns Um array de argumentos.
 */
export function splitCommandLine (value: string): string[] {
  const args: string[] = [];
  let current = '';
  let quote: '"' | '\'' | null = null;
  let escaped = false;

  // Itera sobre cada caractere da string de entrada
  for (const char of value) {
    // Se o caractere anterior foi uma barra invertida, adiciona o caractere atual ao argumento atual e continua
    if (escaped) {
      current += char;
      escaped = false;

      continue;
    }

    // Se o caractere atual for uma barra invertida, define a flag de escape e continua
    if (char === '\\') {
      escaped = true;

      continue;
    }

    // Se estamos dentro de uma citação, adiciona o caractere atual ao argumento atual
    if (quote) {
      // Se o caractere atual for a mesma aspa que abriu a citação, fecha a citação
      if (char === quote) {
        quote = null;
      } else {
        current += char;
      }

      continue;
    }

    // Se o caractere atual for uma aspa, inicia uma citação
    if (char === '"' || char === '\'') {
      quote = char;

      continue;
    }

    // Verifica se o caractere atual é um espaço em branco
    if (/\s/.test(char)) {
      // Se o argumento atual não estiver vazio, adiciona-o à lista de argumentos e reinicia o argumento atual
      if (current.length > 0) {
        args.push(current);
        current = '';
      }

      continue;
    }

    current += char;
  }

  // Se houver um argumento restante após o loop, adiciona-o à lista de argumentos
  if (current.length > 0) {
    args.push(current);
  }

  return args;
}

/**
 * Função para escapar um argumento de linha de comando, adicionando aspas se necessário.
 * @param value O argumento a ser escapado.
 * @returns O argumento escapado, pronto para ser usado em uma linha de comando.
 */
export function quoteCliArg (value: string): string {
  // Verifica se o valor é uma string vazia
  if (value.length === 0) {
    return '""';
  }

  // Verifica se o valor contém espaços em branco ou aspas
  if (!/\s|"|'/.test(value)) {
    return value;
  }

  // Verifica o sistema operacional
  if (isWindows) {
    return `"${value.replace(/"/g, '\\"')}"`;
  }

  return `'${value.replace(/'/g, `'\\''`)}'`;
}

/**
 * Função para executar um processo filho.
 * @param options Opções de execução do processo.
 * @returns Uma promessa que resolve com o resultado da execução.
 */
export function execProcess (options: ExecOptions): Promise<ExecResult> {
  return new Promise((resolve) => {
    const args = options.args ?? [];
    const stdoutChunks: Buffer[] = [];
    const stderrChunks: Buffer[] = [];
    let settled = false;
    let timer: NodeJS.Timeout | undefined;
    let spawnError: Error | undefined;

    /**
     * Função para finalizar a execução do processo, garantindo que a promessa seja resolvida apenas uma vez.
     * @param exitCode O código de saída do processo, ou null se o processo foi finalizado devido a um timeout ou erro de spawn.
     * @param timedOut Indica se o processo foi finalizado devido a um timeout.
     */
    const finish = (exitCode: number | null, timedOut: boolean) => {
      // Garante que a promessa seja resolvida apenas uma vez
      if (settled) {
        return;
      }

      settled = true;

      // Limpa o timer de timeout, se existir
      if (timer) {
        clearTimeout(timer);
      }

      // Resolve a promessa com o resultado da execução do processo
      resolve({
        command: options.command,
        args,
        stdout: Buffer.concat(stdoutChunks).toString(),
        stderr: Buffer.concat(stderrChunks).toString(),
        exitCode,
        timedOut,
        error: spawnError
      });
    };

    // Cria o processo filho
    const child = options.cwd || options.env
      ? childProcess.spawn(options.command, args, {
        cwd: options.cwd,
        env: options.env,
        shell: false
      })
      : childProcess.spawn(options.command, args);

    // Configura os listeners para capturar a saída do processo
    child.stdout.on('data', (chunk: Buffer) => {
      stdoutChunks.push(chunk);
    });

    // Configura os listeners para capturar os erros do processo
    child.stderr.on('data', (chunk: Buffer) => {
      stderrChunks.push(chunk);
    });

    // Configura os listeners para capturar erros de spawn e o fechamento do processo
    child.on('error', (error) => {
      spawnError = error;
      finish(null, false);
    });

    // Configura o listener para capturar o fechamento do processo e resolver a promessa com o código de saída
    child.on('close', (code) => {
      finish(code, false);
    });

    // Escreve a entrada padrão para o processo
    if (typeof options.stdin === 'string') {
      child.stdin.write(options.stdin);
    }

    // Encerra a entrada padrão para indicar que não há mais dados a serem enviados
    child.stdin.end();

    // Configura o timer de timeout
    if (options.timeoutMs && options.timeoutMs > 0) {
      timer = setTimeout(() => {
        child.kill();
        finish(null, true);
      }, options.timeoutMs);
    }
  });
}
