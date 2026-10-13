import { describe, expect, it } from 'vitest';
import { chooseBodyAnimation, attachmentOffset, pointForFrame } from './bodyAnimation';

const MIN = 5;

describe('chooseBodyAnimation', () => {
  it('parado no chão', () => {
    expect(chooseBodyAnimation({ onGround: true, velocityX: 0, minWalkSpeed: MIN })).toBe('idle');
  });

  it('andando para a direita ou para a esquerda', () => {
    expect(chooseBodyAnimation({ onGround: true, velocityX: 220, minWalkSpeed: MIN })).toBe('walk');
    expect(chooseBodyAnimation({ onGround: true, velocityX: -220, minWalkSpeed: MIN })).toBe(
      'walk',
    );
  });

  it('velocidade muito pequena conta como parado', () => {
    expect(chooseBodyAnimation({ onGround: true, velocityX: MIN, minWalkSpeed: MIN })).toBe('idle');
  });

  it('no ar é pulo, andando ou não', () => {
    expect(chooseBodyAnimation({ onGround: false, velocityX: 0, minWalkSpeed: MIN })).toBe('jump');
    expect(chooseBodyAnimation({ onGround: false, velocityX: 220, minWalkSpeed: MIN })).toBe(
      'jump',
    );
  });
});

describe('pointForFrame', () => {
  const neck = [
    { x: 102.9, y: 0 },
    { x: 102.9, y: 5 },
  ];
  const fallback = { x: 88, y: 0 };

  it('devolve o pescoço do quadro', () => {
    expect(pointForFrame(1, neck, fallback)).toEqual({ x: 102.9, y: 5 });
  });

  it('quadro sem dado usa o fallback', () => {
    expect(pointForFrame(9, neck, fallback)).toBe(fallback);
    expect(pointForFrame(Number.NaN, neck, fallback)).toBe(fallback);
  });
});

describe('attachmentOffset', () => {
  // Quadro 176×160 em 1/4: pescoço 15 px à direita do meio e 5 px abaixo do topo.
  const neck = { x: 103, y: 5 };

  it('olhando para a direita: um pouco à direita do meio, no topo do corpo', () => {
    const offset = attachmentOffset(neck, 176, 160, 0.25, 1);
    expect(offset.x).toBeCloseTo(3.75);
    expect(offset.y).toBeCloseTo(-38.75);
  });

  it('olhando para a esquerda: o deslocamento em x inverte, o y não', () => {
    const offset = attachmentOffset(neck, 176, 160, 0.25, -1);
    expect(offset.x).toBeCloseTo(-3.75);
    expect(offset.y).toBeCloseTo(-38.75);
  });

  it('pescoço no meio e no topo do quadro: cabeça bem em cima dos pés, na altura do corpo', () => {
    expect(attachmentOffset({ x: 88, y: 0 }, 176, 160, 0.25, 1)).toEqual({ x: 0, y: -40 });
  });
});
