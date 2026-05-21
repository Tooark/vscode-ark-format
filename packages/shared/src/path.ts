import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as vscode from 'vscode';

/**
 * Indica se o sistema operacional é Windows.
 * @returns Se o sistema operacional é Windows, retorna true; caso contrário, retorna false.
 */
export const isWindows = process.platform === 'win32';

/**
 * Função para localizar o caminho completo de um comando executável, similar ao comando 'which' em sistemas Unix.
 * @param command O nome do comando a ser localizado.
 * @param env O ambiente de variáveis de processo a ser usado para localizar o comando. Se não for fornecido, será usado o ambiente atual do processo.
 * @returns O caminho completo do comando se encontrado; caso contrário, retorna undefined.
 */
export function which (command: string, env: NodeJS.ProcessEnv = process.env): string | undefined {
  const pathValue = env.PATH ?? '';
  const pathExts = isWindows ? (env.PATHEXT ?? '.EXE;.CMD;.BAT;.COM').split(';') : [''];

  // Itera sobre cada diretório no PATH e verifica se o comando existe em algum deles
  for (const part of pathValue.split(path.delimiter)) {
    // Se o diretório atual estiver vazio, pula para o próximo
    if (!part) {
      continue;
    }

    // Itera sobre as extensões de arquivo permitidas (apenas para Windows)
    for (const ext of pathExts) {
      const candidate = path.join(part, isWindows ? `${command}${ext}` : command);

      // Verifica se o arquivo candidato existe
      if (fs.existsSync(candidate)) {
        return candidate;
      }
    }
  }

  return undefined;
}

/**
 * Função para resolver o caminho absoluto de um arquivo ou diretório dentro do workspace.
 * @param relativePath O caminho relativo dentro do workspace.
 * @param folder A pasta do workspace a ser usada como base. Se não for fornecida, será usada a primeira pasta do workspace.
 * @returns O caminho absoluto se o workspace estiver disponível; caso contrário, retorna undefined.
 */
export function resolveWorkspacePath (relativePath: string, folder?: vscode.WorkspaceFolder): string | undefined {
  const workspaceFolder = folder ?? vscode.workspace.workspaceFolders?.[0];

  // Se não houver um workspace aberto, retorna undefined
  if (!workspaceFolder) {
    return undefined;
  }

  return path.join(workspaceFolder.uri.fsPath, relativePath);
}

/**
 * Função para criar um diretório temporário.
 * @param prefix O prefixo a ser usado para o nome do diretório temporário.
 * @returns Uma promessa que resolve com o caminho do diretório temporário criado.
 */
export function createTempDir (prefix = 'ark-format-'): Promise<string> {
  return fs.promises.mkdtemp(path.join(os.tmpdir(), prefix));
}
