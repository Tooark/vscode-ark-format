/**
 * Função para extrair uma mensagem de erro amigável para o usuário a partir de um objeto de erro genérico.
 * @param error O objeto de erro a ser processado.
 * @param fallback A mensagem de fallback a ser usada se não for possível extrair uma mensagem do erro (opcional).
 * @returns A mensagem de erro amigável para o usuário.
 */
export function toUserMessage (error: unknown, fallback = 'Unknown error'): string {
  // Verifica se o erro é uma instância de Error e possui uma mensagem
  if (error instanceof Error && error.message) {
    return error.message;
  }

  // Se o erro for uma string não vazia, retorna a string
  if (typeof error === 'string' && error.trim().length > 0) {
    return error;
  }

  return fallback;
}

/**
 * Função para mapear um código de saída de processo para uma mensagem de erro amigável.
 * @param exitCode O código de saída do processo.
 * @returns Uma mensagem de erro amigável baseada no código de saída.
 */
export function mapExitCode (exitCode: number | null): string {
  // Verifica se o código de saída é nulo
  if (exitCode === null) {
    return 'Process terminated unexpectedly.';
  }

  return `Process exited with code ${exitCode}.`;
}
