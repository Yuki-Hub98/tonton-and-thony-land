import { describe, expect, it } from 'vitest';
import {
  BODY_ANIMATION_FRAMES,
  BODY_FRAME_COUNT,
  BODY_FRAME_HEIGHT,
  BODY_FRAME_WIDTH,
} from './bodySprite';
import {
  bodyTextureKey,
  CHARACTER_IDS,
  CHARACTERS,
  DEFAULT_CHARACTER_ID,
  headTextureKey,
} from './characters';

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

  it.each(CHARACTER_IDS)('%s tem corpo animado no padrão body-<id>', (id) => {
    expect(CHARACTERS[id].body.texture).toBe(bodyTextureKey(id));
  });

  it.each(CHARACTER_IDS)('%s tem o pescoço de cada quadro dentro do quadro', (id) => {
    const { neck } = CHARACTERS[id].body;
    expect(neck).toHaveLength(BODY_FRAME_COUNT);
    for (const { x, y } of neck) {
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThanOrEqual(BODY_FRAME_WIDTH);
      expect(y).toBeGreaterThanOrEqual(0);
      expect(y).toBeLessThan(BODY_FRAME_HEIGHT);
    }
  });

  it('as animações só usam quadros que existem no spritesheet', () => {
    for (const frames of Object.values(BODY_ANIMATION_FRAMES)) {
      expect(frames.length).toBeGreaterThan(0);
      for (const frame of frames) {
        expect(frame).toBeGreaterThanOrEqual(0);
        expect(frame).toBeLessThan(BODY_FRAME_COUNT);
      }
    }
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
