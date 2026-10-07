import { describe, expect, it } from 'vitest';
import { layerTilePositionX, layerTileScale, nextDrift } from './parallax';

describe('layerTileScale', () => {
  it('ajusta a textura à altura da tela', () => {
    expect(layerTileScale(540, 900)).toBeCloseTo(0.6);
  });

  it('volta 1 com altura inválida', () => {
    expect(layerTileScale(0, 900)).toBe(1);
    expect(layerTileScale(540, 0)).toBe(1);
  });
});

describe('layerTilePositionX', () => {
  it('camada com fator 0 não anda com a câmera', () => {
    expect(layerTilePositionX(1000, 0, 0)).toBe(0);
  });

  it('anda proporcional ao fator: camada distante anda menos que a próxima', () => {
    expect(layerTilePositionX(1000, 0.25, 0)).toBe(250);
    expect(layerTilePositionX(1000, 0.55, 0)).toBe(550);
  });

  it('soma o deslocamento do vento', () => {
    expect(layerTilePositionX(1000, 0.1, 30)).toBe(130);
  });

  it('converte para pixels da textura conforme a escala', () => {
    expect(layerTilePositionX(1000, 0.5, 0, 2)).toBe(250);
    expect(layerTilePositionX(600, 1, 0, 0.6)).toBeCloseTo(1000);
  });
});

describe('nextDrift', () => {
  it('anda com o vento mesmo com a câmera parada', () => {
    expect(nextDrift(0, 0.02, 1000, 960)).toBeCloseTo(20);
  });

  it('não anda sem vento', () => {
    expect(nextDrift(15, 0, 16, 960)).toBe(15);
  });

  it('dá a volta ao completar a largura da textura', () => {
    expect(nextDrift(950, 0.02, 1000, 960)).toBeCloseTo(10);
  });

  it('dá a volta também com vento para a esquerda', () => {
    expect(nextDrift(5, -0.02, 1000, 960)).toBeCloseTo(945);
  });

  it('sem período válido, só soma', () => {
    expect(nextDrift(5, 0.01, 100, 0)).toBe(6);
  });
});
