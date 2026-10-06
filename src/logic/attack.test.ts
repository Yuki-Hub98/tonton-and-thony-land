import { describe, expect, it } from 'vitest';
import { attackHitbox, isAttackReady } from './attack';

const body = { left: 100, right: 132, top: 200, bottom: 240 };

describe('attackHitbox', () => {
  it('olhando para a direita, vai do meio do corpo até o alcance à frente', () => {
    expect(attackHitbox(body, 1, 40)).toEqual({ left: 116, right: 172, top: 200, bottom: 240 });
  });

  it('olhando para a esquerda, vai do alcance à frente até o meio do corpo', () => {
    expect(attackHitbox(body, -1, 40)).toEqual({ left: 60, right: 116, top: 200, bottom: 240 });
  });

  it('não alcança nada atrás do jogador', () => {
    expect(attackHitbox(body, 1, 40).left).toBeGreaterThan(body.left);
    expect(attackHitbox(body, -1, 40).right).toBeLessThan(body.right);
  });
});

describe('isAttackReady', () => {
  it('o primeiro golpe sempre pode', () => {
    expect(isAttackReady(0, Number.NEGATIVE_INFINITY, 300)).toBe(true);
  });

  it('não pode durante a recarga', () => {
    expect(isAttackReady(1299, 1000, 300)).toBe(false);
  });

  it('pode quando a recarga termina', () => {
    expect(isAttackReady(1300, 1000, 300)).toBe(true);
  });
});
