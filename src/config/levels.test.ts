import { describe, expect, it } from 'vitest';
import { parseLevel } from '../logic/levelSchema';
import { TILE_SIZE } from './constants';
import { LEVELS } from './levels';

// O Vite junta todos os JSON da pasta de fases (o mesmo arquivo que o jogo carrega).
const levelFiles = import.meta.glob<unknown>('../../public/assets/levels/*.json', {
  eager: true,
  import: 'default',
});

const fileFor = (path: string) => levelFiles[`../../public/${path}`];

describe('LEVELS', () => {
  it('tem pelo menos uma fase', () => {
    expect(LEVELS.length).toBeGreaterThan(0);
  });

  it('não repete chave', () => {
    const keys = LEVELS.map((level) => level.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it.each(LEVELS)('$key aponta para um arquivo que existe', ({ path }) => {
    expect(path).toMatch(/^assets\/levels\/.+\.json$/);
    expect(fileFor(path)).toBeDefined();
  });

  it.each(LEVELS)('$key é um JSON do Tiled válido, com player-spawn e flag', ({ path }) => {
    const level = parseLevel(fileFor(path), TILE_SIZE);
    expect(level.spawn).toBeDefined();
    expect(level.flag).toBeDefined();
  });

  it.each(LEVELS)('$key tem a bandeira à direita do início', ({ path }) => {
    const level = parseLevel(fileFor(path), TILE_SIZE);
    expect(level.flag.x).toBeGreaterThan(level.spawn.x);
  });
});
