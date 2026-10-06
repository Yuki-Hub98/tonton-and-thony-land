import { describe, expect, it } from 'vitest';
import { IMAGE_ASSETS } from './assets';
import { CHARACTER_IDS, CHARACTERS } from './characters';
import { TextureKeys } from './keys';

describe('IMAGE_ASSETS', () => {
  it('não repete chave de textura', () => {
    const keys = IMAGE_ASSETS.map((asset) => asset.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('tem um asset para cada TextureKey', () => {
    const keys = IMAGE_ASSETS.map((asset) => asset.key);
    for (const key of Object.values(TextureKeys)) {
      expect(keys).toContain(key);
    }
  });

  it.each(CHARACTER_IDS)('carrega todas as fotos de cabeça de %s', (id) => {
    const { heads } = CHARACTERS[id];
    const keys = IMAGE_ASSETS.map((asset) => asset.key);
    for (const key of [...heads.idle, heads.sad, heads.happy]) {
      expect(keys).toContain(key);
    }
  });

  it.each(CHARACTER_IDS)('carrega as texturas do equipamento de %s', (id) => {
    const keys = IMAGE_ASSETS.map((asset) => asset.key);
    for (const key of CHARACTERS[id].equipment.textures) {
      expect(keys).toContain(key);
    }
  });

  it('procura as fotos em assets/characters/<id>/<pose>.png', () => {
    const asset = IMAGE_ASSETS.find((a) => a.key === 'anthony-idle-1');
    expect(asset?.path).toBe('assets/characters/anthony/idle-1.png');
  });

  it('usa caminhos relativos dentro de assets/, para funcionar com o base do GitHub Pages', () => {
    for (const asset of IMAGE_ASSETS) {
      expect(asset.path).toMatch(/^assets\/.+\.(png|jpg)$/);
    }
  });

  it('usa PNG nas fotos de cabeça (precisam de fundo transparente)', () => {
    for (const id of CHARACTER_IDS) {
      const { heads } = CHARACTERS[id];
      for (const key of [...heads.idle, heads.sad, heads.happy]) {
        expect(IMAGE_ASSETS.find((a) => a.key === key)?.path).toMatch(/\.png$/);
      }
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
