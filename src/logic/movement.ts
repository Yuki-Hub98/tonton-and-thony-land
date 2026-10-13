// Regras de movimento do jogador, sem Phaser: recebem números e booleanos e devolvem números.

export interface HorizontalInput {
  left: boolean;
  right: boolean;
}

/** Velocidade horizontal a partir das direções apertadas. As duas juntas se anulam. */
export function horizontalVelocity({ left, right }: HorizontalInput, speed: number): number {
  if (left === right) return 0;
  return left ? -speed : speed;
}

/** Só pula quem está no chão e acabou de apertar o botão (segurar não repete o pulo). */
export function canJump(jumpJustPressed: boolean, onGround: boolean): boolean {
  return jumpJustPressed && onGround;
}

/**
 * Pulo variável: no frame em que o botão é solto, se ainda está subindo, a subida é cortada.
 * Toque rápido = pulo baixo; segurar = pulo alto. Velocidade negativa = subindo.
 */
export function cutJumpVelocity(
  velocityY: number,
  jumpJustReleased: boolean,
  cutFactor: number,
): number {
  const rising = velocityY < 0;
  return rising && jumpJustReleased ? velocityY * cutFactor : velocityY;
}
