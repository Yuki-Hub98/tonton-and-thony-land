// Patrulha do inimigo básico, sem Phaser: anda e vira na parede ou na beirada.

/** -1 = esquerda, 1 = direita. */
export type Direction = -1 | 1;

export interface PatrolSensors {
  blockedLeft: boolean;
  blockedRight: boolean;
  onGround: boolean;
  /** Existe chão logo à frente do pé, no sentido em que ele anda. */
  groundAhead: boolean;
}

/** Nova direção: vira ao bater numa parede ou ao chegar na beirada (para não cair). */
export function nextPatrolDirection(direction: Direction, sensors: PatrolSensors): Direction {
  if (direction < 0 && sensors.blockedLeft) return 1;
  if (direction > 0 && sensors.blockedRight) return -1;
  // No ar (caindo) não dá para saber onde fica a beirada: segue em frente.
  if (sensors.onGround && !sensors.groundAhead) return direction < 0 ? 1 : -1;
  return direction;
}
