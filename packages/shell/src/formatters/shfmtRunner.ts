import * as vscode from 'vscode';
import { mapExitCode, toUserMessage } from '@tooark/ark-format-shared/errors';
import { execProcess, splitCommandLine } from '@tooark/ark-format-shared/process';
import { ShfmtResult } from './types';

function withDetail (message: string, detail: string): string {
  return message.includes(detail) ? message : `${message}: ${detail}`;
}

/**
 * Função que executa o binário `shfmt` para formatar o conteúdo de um documento shell.
 * @param content O texto a ser formatado.
 * @param shfmtPath Caminho absoluto para o binário shfmt.
 * @param flags Flags adicionais para o shfmt (ex: "-i 2 -ci").
 * @param fileName Nome do arquivo (usado para detecção de linguagem .bats).
 * @returns Resultado com o texto formatado ou informações de erro.
 */
export function runShfmt (content: string, shfmtPath: string, flags: string, fileName: string): Promise<ShfmtResult> {
  return new Promise(async (resolve) => {
    const args: string[] = [];

    // Detecta arquivos .bats automaticamente
    if (/\.bats$/.test(fileName)) {
      args.push('--ln=bats');
    }

    // Adiciona flags do usuário
    if (flags) {
      const userFlags = splitCommandLine(flags).filter(f => f.length > 0);

      // Rejeita a flag -w|--write que reescreve o arquivo (incompatível com formatação via editor)
      for (const f of userFlags) {
        // Verifica se a flag é -w ou --write
        if (f === '-w' || f === '--write') {
          const baseMessage = vscode.l10n.t('ark.incompatible.flag');

          resolve({
            success: false,
            errorMessage: withDetail(baseMessage, '-w/--write')
          });

          return;
        }
      }

      args.push(...userFlags);
    }

    try {
      const result = await execProcess({
        command: shfmtPath,
        args,
        stdin: content
      });

      if (result.error) {
        const detail = toUserMessage(result.error);

        resolve({
          success: false,
          errorMessage: withDetail(vscode.l10n.t('ark.failed.shfmt', detail), detail)
        });

        return;
      }

      if (result.exitCode === 0) {
        resolve({ success: true, formatted: result.stdout });

        return;
      }

      const errMsg = result.stderr.trim() || mapExitCode(result.exitCode);

      // Tenta extrair linha e coluna do erro: <standard input>:linha:coluna: mensagem
      const errLoc = /^<standard input>:(\d+):(\d+):(.*)$/m.exec(errMsg);

      resolve({
        success: false,
        errorLine: errLoc ? parseInt(errLoc[1], 10) : undefined,
        errorColumn: errLoc ? parseInt(errLoc[2], 10) : undefined,
        errorMessage: errLoc ? errLoc[3].trim() : errMsg
      });
    } catch (e: unknown) {
      const detail = toUserMessage(e);

      resolve({
        success: false,
        errorMessage: withDetail(vscode.l10n.t('ark.error.shfmt', detail), detail)
      });
    }
  });
}
