import * as vscode from 'vscode';

/**
 * Função para construir as edições que substituem o conteúdo inteiro de um documento pelo texto formatado.
 * Retorna um array vazio quando o texto formatado é idêntico ao original, evitando edições desnecessárias.
 * @param document O documento do VS Code a ser formatado.
 * @param formatText Função que recebe o texto original e retorna o texto formatado.
 * @returns Um array de edições de texto que aplicam o formato ao documento.
 */
export function buildFullDocumentEdits (document: vscode.TextDocument, formatText: (original: string) => string): vscode.TextEdit[] {
  // Carrega o texto original do documento e formata-o usando a função fornecida
  const original = document.getText();
  const formatted = formatText(original);

  // Verifica se o texto formatado é diferente do original. Se for igual, não há edições a serem feitas.
  if (formatted === original) {
    return [];
  }

  // Cria um intervalo que abrange todo o documento para substituir o conteúdo inteiro pelo texto formatado
  const fullRange = new vscode.Range(document.positionAt(0), document.positionAt(original.length));

  return [vscode.TextEdit.replace(fullRange, formatted)];
}

/**
 * Função para construir as edições que substituem um intervalo de um documento pelo texto formatado.
 * Retorna um array vazio quando o texto formatado é idêntico à seleção original.
 * @param document O documento do VS Code que contém o texto a ser formatado.
 * @param range O intervalo de texto a ser formatado.
 * @param formatSelection Função que recebe o texto selecionado e retorna o texto formatado.
 * @returns Um array de edições de texto que aplicam o formato ao intervalo.
 */
export function buildRangeEdits (document: vscode.TextDocument, range: vscode.Range, formatSelection: (selected: string) => string): vscode.TextEdit[] {
  const selected = document.getText(range);
  const formatted = formatSelection(selected);

  // Verifica se o texto formatado é igual ao texto selecionado.
  if (formatted === selected) {
    return [];
  }

  return [vscode.TextEdit.replace(range, formatted)];
}
