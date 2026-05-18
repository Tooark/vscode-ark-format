import * as vscode from 'vscode';
import * as child_process from 'child_process';
import { ShfmtResult } from './types';

/**
 * Função que executa o binário `shfmt` para formatar o conteúdo de um documento shell.
 * @param content O texto a ser formatado.
 * @param shfmtPath Caminho absoluto para o binário shfmt.
 * @param flags Flags adicionais para o shfmt (ex: "-i 2 -ci").
 * @param fileName Nome do arquivo (usado para detecção de linguagem .bats).
 * @returns Resultado com o texto formatado ou informações de erro.
 */
export function runShfmt (content: string, shfmtPath: string, flags: string, fileName: string): Promise<ShfmtResult> {
  return new Promise((resolve) => {
    const args: string[] = [];

    // Detecta arquivos .bats automaticamente
    if (/\.bats$/.test(fileName)) {
      args.push('--ln=bats');
    }

    // Adiciona flags do usuário
    if (flags) {
      const userFlags = flags.split(/\s+/).filter(f => f.length > 0);

      // Rejeita a flag -w|--write que reescreve o arquivo (incompatível com formatação via editor)
      for (const f of userFlags) {
        // Verifica se a flag é -w ou --write
        if (f === '-w' || f === '--write') {
          resolve({
            success: false,
            errorMessage: vscode.l10n.t('ark.incompatible.flag')
          });

          return;
        }
      }

      args.push(...userFlags);
    }

    try {
      // Executa o shfmt como um processo filho
      const shfmt = child_process.spawn(shfmtPath, args);

      const stdoutChunks: Buffer[] = [];
      const stderrChunks: Buffer[] = [];

      // Coleta os dados de stdout para obter o resultado formatado
      shfmt.stdout.on('data', (chunk: Buffer) => {
        stdoutChunks.push(chunk);
      });

      // Coleta os dados de stderr para obter mensagens de erro
      shfmt.stderr.on('data', (chunk: Buffer) => {
        stderrChunks.push(chunk);
      });

      // Trata erros de execução do processo (ex: binário não encontrado)
      shfmt.on('error', (err) => {
        resolve({
          success: false,
          errorMessage: vscode.l10n.t('ark.failed.shfmt', err.message)
        });
      });

      // Trata o encerramento do processo para processar o resultado ou os erros de formatação
      shfmt.on('close', (code) => {
        // Verificar se o processo terminou com sucesso (código 0)
        if (code === 0) {
          const result = Buffer.concat(stdoutChunks).toString();

          resolve({ success: true, formatted: result });
        } else {
          const errMsg = Buffer.concat(stderrChunks).toString();

          // Tenta extrair linha e coluna do erro: <standard input>:linha:coluna: mensagem
          const errLoc = /^<standard input>:(\d+):(\d+):(.*)$/m.exec(errMsg);

          resolve({
            success: false,
            errorLine: errLoc ? parseInt(errLoc[1], 10) : undefined,
            errorColumn: errLoc ? parseInt(errLoc[2], 10) : undefined,
            errorMessage: errLoc ? errLoc[3].trim() : errMsg.trim()
          });
        }
      });

      // Escreve o conteúdo a ser formatado na entrada padrão do processo shfmt
      shfmt.stdin.write(content);

      // Encerra a entrada padrão para sinalizar que não há mais dados a serem enviados
      shfmt.stdin.end();
    } catch (e: any) {
      resolve({
        success: false,
        errorMessage: vscode.l10n.t('ark.error.shfmt', e.message)
      });
    }
  });
}
