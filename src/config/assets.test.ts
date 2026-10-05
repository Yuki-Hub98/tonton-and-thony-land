import { describe, expect, it } from 'vitest';
import { IMAGE_ASSETS } from './assets';
import { TextureKeys } from './keys';

describe('IMAGE_ASSETS', () => {
  it('não repete chave de textura', () => {
    const keys = IMAGE_ASSETS.map((asset) => asset.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('tem um asset para cada TextureKey', () => {
    const keys = IMAGE_ASSETS.map((asset) => asset.key);
    expect(keys.sort()).toEqual(Object.values(TextureKeys).sort());
  });

  it('usa caminhos relativos dentro de assets/, para funcionar com o base do GitHub Pages', () => {
    for (const asset of IMAGE_ASSETS) {
      expect(asset.path).toMatch(/^assets\/.+\.png$/);
    }
  });

  it('define placeholder com tamanho positivo e cor válida', () => {
    for (const { placeholder } of IMAGE_ASSETS) {
      expect(placeholder.width).toBeGreaterThan(0);
      expect(placeholder.height).toBeGreaterThan(0);
      expect(placeholder.color).toBeGreaterThanOrEqual(0x000000);
      expect(placeholder.color).toBeLessThanOrEqual(0xffffff);
    }
  });
});
