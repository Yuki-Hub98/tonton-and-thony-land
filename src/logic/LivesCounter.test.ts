import { describe, expect, it } from 'vitest';
import { LivesCounter } from './LivesCounter';

describe('LivesCounter', () => {
  it('começa com as vidas pedidas', () => {
    const counter = new LivesCounter(3);
    expect(counter.lives).toBe(3);
    expect(counter.isGameOver).toBe(false);
  });

  it('perde uma vida por vez e devolve quantas sobraram', () => {
    const counter = new LivesCounter(3);
    expect(counter.loseLife()).toBe(2);
    expect(counter.loseLife()).toBe(1);
    expect(counter.lives).toBe(1);
    expect(counter.isGameOver).toBe(false);
  });

  it('é game over ao perder a última vida', () => {
    const counter = new LivesCounter(1);
    expect(counter.loseLife()).toBe(0);
    expect(counter.isGameOver).toBe(true);
  });

  it('não fica negativo', () => {
    const counter = new LivesCounter(1);
    counter.loseLife();
    expect(counter.loseLife()).toBe(0);
  });

  it.each([0, -1, 1.5, Number.NaN])('recusa começar com %s vidas', (initial) => {
    expect(() => new LivesCounter(initial)).toThrow();
  });
});
