// Direção automática do carrinho, sem Phaser: ele só anda para a direita e pula sozinho.

export interface DriveSensors {
  onGround: boolean;
  /** Tem parede (ou degrau) encostada na frente. */
  blockedAhead: boolean;
  /** Tem chão logo depois da frente do carro (se não tiver, é beirada de buraco). */
  groundAhead: boolean;
}

/** Pula quando está no chão e vai bater numa parede ou cair num buraco. */
export function shouldAutoJump({ onGround, blockedAhead, groundAhead }: DriveSensors): boolean {
  return onGround && (blockedAhead || !groundAhead);
}
