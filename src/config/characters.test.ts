import { describe, expect, it } from 'vitest';
import { CHARACTER_IDS, CHARACTERS, DEFAULT_CHARACTER_ID, headTextureKey } from './characters';

describe('CHARACTERS', () => {
  it.each(CHARACTER_IDS)('%s tem id igual à chave do registro', (id) => {
    expect(CHARACTERS[id].id).toBe(id);
  });

  it.each(CHARACTER_IDS)('%s tem nome de exibição', (id) => {
    expect(CHARACTERS[id].displayName.trim()).not.toBe('');
  });

  it.each(CHARACTER_IDS)('%s aparece na tela com o apelido, não com o nome real', (id) => {
    // Privacidade: o jogo é publicado num site público. O id é o nome real (uso interno).
    expect(CHARACTERS[id].displayName.toLowerCase()).not.toBe(id);
    expect(['Thony', 'Tonton']).toContain(CHARACTERS[id].displayName);
  });

  it.each(CHARACTER_IDS)('%s tem 3 fotos idle, sad e happy no padrão <id>-<pose>', (id) => {
    const { heads } = CHARACTERS[id];
    expect(heads.idle).toEqual([
      headTextureKey(id, 'idle-1'),
      headTextureKey(id, 'idle-2'),
      headTextureKey(id, 'idle-3'),
    ]);
    expect(heads.sad).toBe(headTextureKey(id, 'sad'));
    expect(heads.happy).toBe(headTextureKey(id, 'happy'));
  });

  it.each(CHARACTER_IDS)('%s tem equipamento com nome e pelo menos uma textura', (id) => {
    const { equipment } = CHARACTERS[id];
    expect(equipment.name.trim()).not.toBe('');
    expect(equipment.textures.length).toBeGreaterThan(0);
  });

  it('não repete foto entre personagens', () => {
    const all = CHARACTER_IDS.flatMap((id) => {
      const { heads } = CHARACTERS[id];
      return [...heads.idle, heads.sad, heads.happy];
    });
    expect(new Set(all).size).toBe(all.length);
  });

  it('tem um personagem padrão válido', () => {
    expect(CHARACTER_IDS).toContain(DEFAULT_CHARACTER_ID);
  });
});
