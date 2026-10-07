import { describe, expect, it } from 'vitest';
import { IMAGE_ASSETS } from './assets';
import {
  BACKGROUND_ASSETS,
  BACKGROUND_IDS,
  BACKGROUND_LAYERS,
  BACKGROUNDS,
  backgroundLayerKey,
  celestialKey,
} from './backgrounds';
import { LEVELS } from './levels';

// Só a lista de arquivos (sem carregar as imagens), para conferir se cada caminho existe.
const bgFiles = Object.keys(import.meta.glob('../../public/assets/bg/**/*.png'));
const fileExists = (path: string) => bgFiles.includes(`../../public/${path}`);

describe('BACKGROUNDS', () => {
  it.each(BACKGROUND_IDS)('%s tem o id igual à chave', (id) => {
    expect(BACKGROUNDS[id].id).toBe(id);
  });

  it.each(BACKGROUND_IDS)('%s tem as 4 camadas na ordem, do fundo para a frente', (id) => {
    expect(BACKGROUNDS[id].layers.map((layer) => layer.name)).toEqual([...BACKGROUND_LAYERS]);
  });

  it.each(BACKGROUND_IDS)('%s: camada mais próxima anda mais rápido que a distante', (id) => {
    const factors = BACKGROUNDS[id].layers.map((layer) => layer.scrollFactor);
    expect(factors[0]).toBe(0);
    for (let i = 1; i < factors.length; i++) {
      expect(factors[i]).toBeGreaterThan(factors[i - 1] ?? 0);
    }
    // Nenhuma camada de fundo anda junto ou mais rápido que a fase.
    expect(Math.max(...factors)).toBeLessThan(1);
  });

  it.each(BACKGROUND_IDS)('%s tem nuvens com vento', (id) => {
    const clouds = BACKGROUNDS[id].layers.find((layer) => layer.name === 'clouds');
    expect(clouds?.windSpeed).toBeGreaterThan(0);
  });

  it.each(BACKGROUND_IDS)('%s tem o sol/lua dentro da tela', (id) => {
    const { x, y } = BACKGROUNDS[id].celestial;
    for (const value of [x, y]) {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(1);
    }
  });
});

describe('BACKGROUND_ASSETS', () => {
  it('tem as 4 camadas e o sol/lua de cada fundo', () => {
    const keys = BACKGROUND_ASSETS.map((asset) => asset.key);
    for (const id of BACKGROUND_IDS) {
      for (const layer of BACKGROUND_LAYERS) expect(keys).toContain(backgroundLayerKey(id, layer));
      expect(keys).toContain(celestialKey(id));
    }
  });

  it('não repete chave, nem com as outras imagens do jogo', () => {
    const keys = [...BACKGROUND_ASSETS, ...IMAGE_ASSETS].map((asset) => asset.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it.each(BACKGROUND_ASSETS)('$key aponta para um PNG que existe', ({ path }) => {
    expect(path).toMatch(/^assets\/bg\/.+\.png$/);
    expect(fileExists(path)).toBe(true);
  });
});

describe('fundos das fases', () => {
  it.each(LEVELS)('$key usa um fundo que existe', ({ background }) => {
    expect(BACKGROUND_IDS).toContain(background);
  });

  it('cada fase tem um fundo diferente', () => {
    const backgrounds = LEVELS.map((level) => level.background);
    expect(new Set(backgrounds).size).toBe(backgrounds.length);
  });
});
