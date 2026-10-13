// Regras do golpe com o equipamento, sem Phaser.
import type { Rect } from './collisionRules';
import type { Direction } from './enemyPatrol';

/**
 * Área que o golpe acerta: do meio do corpo até `reach` pixels além da frente dele,
 * na altura do corpo. Começa no meio para acertar também um inimigo colado no jogador.
 */
export function attackHitbox(body: Rect, facing: Direction, reach: number): Rect {
  const centerX = (body.left + body.right) / 2;
  const { top, bottom } = body;
  if (facing > 0) return { left: centerX, right: body.right + reach, top, bottom };
  return { left: body.left - reach, right: centerX, top, bottom };
}

/** Pode bater de novo: já passou o tempo de recarga desde o último golpe. */
export function isAttackReady(now: number, lastAttackAt: number, cooldownMs: number): boolean {
  return now - lastAttackAt >= cooldownMs;
}
