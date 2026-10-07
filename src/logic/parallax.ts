// Contas do fundo em camadas (parallax), sem Phaser.

/**
 * Escala que faz a textura da camada ocupar a altura inteira da tela.
 * Altura inválida (0, negativa) volta 1, para não sumir com a camada.
 */
export function layerTileScale(screenHeight: number, textureHeight: number): number {
  if (screenHeight <= 0 || textureHeight <= 0) return 1;
  return screenHeight / textureHeight;
}

/**
 * Deslocamento horizontal da textura dentro da camada.
 * - scrollX: quanto a câmera já andou na fase;
 * - scrollFactor: 0 = parada na tela, 1 = anda junto com a fase;
 * - drift: quanto o vento já empurrou a camada, em pixels da tela;
 * - tileScale: escala da textura (tilePosition é medido em pixels da textura, não da tela).
 */
export function layerTilePositionX(
  scrollX: number,
  scrollFactor: number,
  drift: number,
  tileScale = 1,
): number {
  return (scrollX * scrollFactor + drift) / tileScale;
}

/**
 * Quanto o vento empurra a camada, guardado só dentro de uma volta da textura
 * (period, em pixels da tela), para o número não crescer sem parar.
 * Como a textura emenda nas bordas, voltar uma volta inteira não muda nada na tela.
 */
export function nextDrift(
  drift: number,
  windSpeed: number,
  deltaMs: number,
  period: number,
): number {
  const next = drift + windSpeed * deltaMs;
  if (period <= 0) return next;
  return ((next % period) + period) % period;
}
