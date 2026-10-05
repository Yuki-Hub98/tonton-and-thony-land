import { describe, expect, it } from 'vitest';
import { TEST_LEVEL } from './testLevel';

describe('TEST_LEVEL', () => {
  it('tem todas as plataformas dentro do mundo e com tamanho positivo', () => {
    for (const p of TEST_LEVEL.platforms) {
      expect(p.width).toBeGreaterThan(0);
      expect(p.height).toBeGreaterThan(0);
      expect(p.x).toBeGreaterThanOrEqual(0);
      expect(p.y).toBeGreaterThanOrEqual(0);
      expect(p.x + p.width).toBeLessThanOrEqual(TEST_LEVEL.width);
      expect(p.y + p.height).toBeLessThanOrEqual(TEST_LEVEL.height);
    }
  });

  it('faz o jogador nascer em cima de uma plataforma', () => {
    const { spawn } = TEST_LEVEL;
    const below = TEST_LEVEL.platforms.find(
      (p) => p.y === spawn.y && spawn.x >= p.x && spawn.x < p.x + p.width,
    );
    expect(below).toBeDefined();
  });

  it('tem chão do começo ao fim', () => {
    const ground = TEST_LEVEL.platforms.find((p) => p.x === 0 && p.width === TEST_LEVEL.width);
    expect(ground).toBeDefined();
  });
});
