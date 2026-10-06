export interface Point {
  x: number;
  y: number;
}

/**
 * Onde o jogador volta depois de morrer: o ponto mais à frente entre o atual e o checkpoint
 * que acabou de tocar. Assim um checkpoint antigo nunca "rouba" o progresso.
 */
export function furthestRespawnPoint(current: Point, checkpoint: Point): Point {
  return checkpoint.x > current.x ? checkpoint : current;
}
