import { describe, expect, it } from 'vitest';
import {
  canJump,
  cutJumpVelocity,
  horizontalVelocity,
  jumpHeight,
  shouldCutJump,
} from './movement';

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

describe('shouldCutJump', () => {
  it('soltar a tecla corta o pulo (segurar = pulo alto, tocar = pulo baixo)', () => {
    expect(shouldCutJump({ keyboard: true, touch: false })).toBe(true);
  });

  it('soltar o botão de toque não corta: no celular o pulo é sempre alto', () => {
    expect(shouldCutJump({ keyboard: false, touch: true })).toBe(false);
  });

  it('sem soltar nada, não corta', () => {
    expect(shouldCutJump({ keyboard: false, touch: false })).toBe(false);
  });
});

describe('jumpHeight', () => {
  it('é velocidade² / (2 × gravidade)', () => {
    expect(jumpHeight(-600, 1200)).toBe(150);
  });

  it('não depende do sinal da velocidade', () => {
    expect(jumpHeight(600, 1200)).toBe(jumpHeight(-600, 1200));
  });
});
