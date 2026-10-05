// Regras da câmera que só avança, sem Phaser.

export interface ForwardCameraParams {
  /** Posição x atual da borda esquerda da câmera no mundo. */
  currentScrollX: number;
  /** Posição x do alvo (o jogador) no mundo. */
  targetX: number;
  viewportWidth: number;
  worldWidth: number;
  /** Onde o alvo fica na tela, de 0 (borda esquerda) a 1 (borda direita). */
  leadRatio: number;
}

/**
 * Próxima posição da câmera: acompanha o alvo para a direita, nunca volta
 * e não passa do começo nem do fim do mundo.
 */
export function nextCameraScrollX({
  currentScrollX,
  targetX,
  viewportWidth,
  worldWidth,
  leadRatio,
}: ForwardCameraParams): number {
  const desired = targetX - viewportWidth * leadRatio;
  const maxScroll = Math.max(0, worldWidth - viewportWidth);
  const forwardOnly = Math.max(currentScrollX, desired);
  return Math.min(Math.max(forwardOnly, 0), maxScroll);
}

/** Posição x mínima do centro do jogador para o corpo não sair pela borda esquerda da tela. */
export function minPlayerX(cameraScrollX: number, playerHalfWidth: number): number {
  return cameraScrollX + playerHalfWidth;
}
