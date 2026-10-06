import { describe, expect, it } from 'vitest';
import { isBlinkVisible } from './blink';

describe('isBlinkVisible', () => {
  it('fica visível quando não está invencível', () => {
    expect(isBlinkVisible(1000, 1000, 100)).toBe(true);
    expect(isBlinkVisible(5000, 1000, 100)).toBe(true);
  });

  it('alterna a cada blinkMs enquanto está invencível', () => {
    const until = 1000;
    const frames = [0, 100, 200, 300].map((t) => isBlinkVisible(t, until, 100));
    expect(frames).toEqual([true, false, true, false]);
  });

  it('o último trecho antes do fim já é visível, para não piscar ao acabar', () => {
    expect(isBlinkVisible(850, 1000, 100)).toBe(false);
    expect(isBlinkVisible(950, 1000, 100)).toBe(true);
  });
});
