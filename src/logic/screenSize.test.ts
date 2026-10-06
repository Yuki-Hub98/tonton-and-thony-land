import { describe, expect, it } from 'vitest';
import { gameWidthFor } from './screenSize';

const HEIGHT = 540;
const MIN = 720;
const MAX = 1280;

describe('gameWidthFor', () => {
  it('tela 16:9 fica com 960', () => {
    expect(gameWidthFor(1920, 1080, HEIGHT, MIN, MAX)).toBe(960);
  });

  it('celular deitado (19,5:9) fica mais largo', () => {
    expect(gameWidthFor(844, 390, HEIGHT, MIN, MAX)).toBe(1169);
  });

  it('tablet 4:3 fica no mínimo', () => {
    expect(gameWidthFor(1024, 768, HEIGHT, MIN, MAX)).toBe(720);
  });

  it('nunca passa do máximo', () => {
    expect(gameWidthFor(3440, 1000, HEIGHT, MIN, MAX)).toBe(MAX);
  });

  it('nunca fica abaixo do mínimo (ex.: celular em pé)', () => {
    expect(gameWidthFor(390, 844, HEIGHT, MIN, MAX)).toBe(MIN);
  });

  it('tela sem tamanho ainda usa o mínimo', () => {
    expect(gameWidthFor(0, 0, HEIGHT, MIN, MAX)).toBe(MIN);
  });
});
