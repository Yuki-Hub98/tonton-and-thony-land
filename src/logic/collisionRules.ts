// Regras de encostar em coisas, sem Phaser. Coordenadas do mundo: y cresce para baixo.

export interface Rect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export interface StompCheck {
  /** Velocidade vertical do jogador (positiva = caindo). */
  playerVelocityY: number;
  /** Base dos pés do jogador no frame anterior. */
  playerPrevBottom: number;
  enemyTop: number;
  /** Folga em pixels: pés um pouco abaixo do topo ainda contam como pisão. */
  tolerance: number;
}

/** Pisou no inimigo: estava caindo e, no frame anterior, os pés estavam acima da cabeça dele. */
export function isStomp({
  playerVelocityY,
  playerPrevBottom,
  enemyTop,
  tolerance,
}: StompCheck): boolean {
  return playerVelocityY > 0 && playerPrevBottom <= enemyTop + tolerance;
}

/** Caiu para fora do mapa (no buraco): o topo do corpo passou da base do mundo. */
export function hasFallenOut(bodyTop: number, worldHeight: number): boolean {
  return bodyTop > worldHeight;
}

/**
 * Os retângulos se cruzam, encolhendo `b` em `inset` pixels de cada lado.
 * Usado nos espinhos: só raspar na beirada do tile não machuca.
 */
export function overlapsWithInset(a: Rect, b: Rect, inset: number): boolean {
  return (
    a.left < b.right - inset &&
    a.right > b.left + inset &&
    a.top < b.bottom - inset &&
    a.bottom > b.top + inset
  );
}
