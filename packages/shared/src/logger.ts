import * as vscode from 'vscode';
import { Logger } from './types';

/**
 * Função para criar um logger que escreve mensagens em um canal de saída do VS Code.
 * @param name O nome do canal de saída.
 * @returns Um objeto Logger com métodos para registrar mensagens de informação, aviso e erro.
 */
export function createLogger (name: string): Logger {
  const channel = vscode.window.createOutputChannel(name);

  return {
    channel,
    info: (message: string) => channel.appendLine(`[info] ${message}`),
    warn: (message: string) => channel.appendLine(`[warn] ${message}`),
    error: (message: string) => channel.appendLine(`[error] ${message}`),
    dispose: () => channel.dispose()
  };
}
