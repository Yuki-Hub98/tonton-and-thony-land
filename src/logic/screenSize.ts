// Tamanho lógico do jogo conforme a tela do aparelho, sem Phaser.

/**
 * Largura do jogo para preencher a tela inteira: a altura é fixa e a largura acompanha
 * a proporção da tela (celular deitado = mais largo; tablet = mais estreito).
 * Fica entre `minWidth` e `maxWidth` para os menus caberem e a fase não ficar larga demais;
 * fora desse intervalo, sobram faixas pequenas nas bordas.
 */
export function gameWidthFor(
  viewportWidth: number,
  viewportHeight: number,
  gameHeight: number,
  minWidth: number,
  maxWidth: number,
): number {
  if (viewportWidth <= 0 || viewportHeight <= 0) return minWidth;
  const width = Math.round((gameHeight * viewportWidth) / viewportHeight);
  return Math.min(Math.max(width, minWidth), maxWidth);
}
