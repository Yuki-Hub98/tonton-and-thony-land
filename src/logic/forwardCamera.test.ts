import { describe, expect, it } from 'vitest';
import { minPlayerX, nextCameraScrollX, type ForwardCameraParams } from './forwardCamera';

const base: ForwardCameraParams = {
  currentScrollX: 0,
  targetX: 0,
  viewportWidth: 960,
  worldWidth: 4000,
  leadRatio: 0.4,
};

describe('nextCameraScrollX', () => {
  it('fica no começo enquanto o jogador não passou do ponto de avanço', () => {
    expect(nextCameraScrollX({ ...base, targetX: 200 })).toBe(0);
  });

  it('avança mantendo o jogador na posição leadRatio da tela', () => {
    // 1000 - 960 * 0.4 = 616
    expect(nextCameraScrollX({ ...base, targetX: 1000 })).toBe(616);
  });

  it('nunca volta quando o jogador anda para a esquerda', () => {
    expect(nextCameraScrollX({ ...base, currentScrollX: 616, targetX: 700 })).toBe(616);
  });

  it('para no fim do mundo', () => {
    expect(nextCameraScrollX({ ...base, targetX: 3900 })).toBe(4000 - 960);
  });

  it('fica em 0 se o mundo for menor que a tela', () => {
    expect(nextCameraScrollX({ ...base, worldWidth: 500, targetX: 400 })).toBe(0);
  });
});

describe('minPlayerX', () => {
  it('é a borda esquerda da câmera mais meia largura do jogador', () => {
    expect(minPlayerX(616, 16)).toBe(632);
  });
});
