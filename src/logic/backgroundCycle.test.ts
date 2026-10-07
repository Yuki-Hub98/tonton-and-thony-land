import { describe, expect, it } from 'vitest';
import { backgroundMix } from './backgroundCycle';

const HOLD = 5000;
const FADE = 1000;

describe('backgroundMix', () => {
  it('começa no primeiro fundo, sem troca', () => {
    expect(backgroundMix(0, 3, HOLD, FADE)).toEqual({ current: 0, next: 1, fade: 0 });
  });

  it('fica parado durante o tempo de exibição', () => {
    expect(backgroundMix(HOLD, 3, HOLD, FADE).fade).toBe(0);
  });

  it('o próximo aparece aos poucos durante a troca', () => {
    expect(backgroundMix(HOLD + FADE / 2, 3, HOLD, FADE)).toEqual({
      current: 0,
      next: 1,
      fade: 0.5,
    });
  });

  it('depois da troca, o próximo vira o atual', () => {
    expect(backgroundMix(HOLD + FADE, 3, HOLD, FADE)).toEqual({ current: 1, next: 2, fade: 0 });
  });

  it('depois do último, volta ao primeiro', () => {
    const lastFade = backgroundMix(3 * HOLD + 2 * FADE + FADE / 2, 3, HOLD, FADE);
    expect(lastFade.current).toBe(2);
    expect(lastFade.next).toBe(0);
    expect(backgroundMix(3 * (HOLD + FADE), 3, HOLD, FADE).current).toBe(0);
  });

  it('com um fundo só, nunca troca', () => {
    expect(backgroundMix(HOLD + FADE / 2, 1, HOLD, FADE)).toEqual({
      current: 0,
      next: 0,
      fade: 0,
    });
  });

  it('tempo negativo conta como o começo', () => {
    expect(backgroundMix(-100, 3, HOLD, FADE)).toEqual({ current: 0, next: 1, fade: 0 });
  });

  it('troca instantânea quando não há tempo de transição', () => {
    expect(backgroundMix(HOLD + 1, 3, HOLD, 0)).toEqual({ current: 1, next: 2, fade: 0 });
  });
});
