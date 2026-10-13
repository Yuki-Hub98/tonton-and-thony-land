import { describe, expect, it } from 'vitest';
import { canJump, cutJumpVelocity, horizontalVelocity } from './movement';

describe('horizontalVelocity', () => {
  it('fica parado sem input', () => {
    expect(horizontalVelocity({ left: false, right: false }, 200)).toBe(0);
  });

  it('anda para a direita com velocidade positiva', () => {
    expect(horizontalVelocity({ left: false, right: true }, 200)).toBe(200);
  });

  it('anda para a esquerda com velocidade negativa', () => {
    expect(horizontalVelocity({ left: true, right: false }, 200)).toBe(-200);
  });

  it('fica parado com as duas direções apertadas', () => {
    expect(horizontalVelocity({ left: true, right: true }, 200)).toBe(0);
  });
});

describe('canJump', () => {
  it('pula ao apertar no chão', () => {
    expect(canJump(true, true)).toBe(true);
  });

  it('não pula no ar (sem pulo duplo)', () => {
    expect(canJump(true, false)).toBe(false);
  });

  it('não pula sem apertar', () => {
    expect(canJump(false, true)).toBe(false);
  });
});

describe('cutJumpVelocity', () => {
  it('corta a subida no frame em que o botão é solto', () => {
    expect(cutJumpVelocity(-600, true, 0.5)).toBe(-300);
  });

  it('mantém a subida nos outros frames', () => {
    expect(cutJumpVelocity(-600, false, 0.5)).toBe(-600);
  });

  it('não mexe na queda', () => {
    expect(cutJumpVelocity(300, true, 0.5)).toBe(300);
  });
});
