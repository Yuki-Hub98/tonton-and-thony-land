import { describe, expect, it } from 'vitest';
import { coverScale } from './coverScale';

describe('coverScale', () => {
  it('imagem do mesmo tamanho não muda', () => {
    expect(coverScale(960, 540, 960, 540)).toBe(1);
  });

  it('imagem 16:9 maior encolhe na medida exata', () => {
    expect(coverScale(1920, 1080, 960, 540)).toBe(0.5);
  });

  it('imagem mais larga que a tela: a altura encaixa e sobra largura', () => {
    const scale = coverScale(1408, 768, 960, 540);
    expect(768 * scale).toBeCloseTo(540);
    expect(1408 * scale).toBeGreaterThan(960);
  });

  it('imagem mais alta que a tela: a largura encaixa e sobra altura', () => {
    const scale = coverScale(800, 800, 960, 540);
    expect(800 * scale).toBeCloseTo(960);
    expect(800 * scale).toBeGreaterThan(540);
  });
});
