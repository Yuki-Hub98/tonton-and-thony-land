import { describe, expect, it } from 'vitest';
import { LevelSchemaError, bottomCenter, parseLevel } from './levelSchema';

const TILE = 32;

/** Mapa mínimo válido: 4×3 tiles, um tile sólido, spawn e bandeira. */
function validMap(): Record<string, unknown> {
  return {
    orientation: 'orthogonal',
    infinite: false,
    width: 4,
    height: 3,
    tilewidth: TILE,
    tileheight: TILE,
    tilesets: [
      {
        firstgid: 1,
        name: 'tileset',
        image: '../tiles/tileset.png',
        tiles: [{ id: 0, properties: [{ name: 'collides', type: 'bool', value: true }] }],
      },
    ],
    layers: [
      { name: 'ground', type: 'tilelayer', data: [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1] },
      {
        name: 'objects',
        type: 'objectgroup',
        objects: [
          { id: 1, type: 'player-spawn', point: true, x: 16, y: 64, width: 0, height: 0 },
          { id: 2, type: 'flag', x: 96, y: 0, width: 32, height: 64 },
        ],
      },
    ],
  };
}

type Layer = Record<string, unknown>;

/** Pega o item do array e falha o teste se ele não existir. */
function at<T>(items: T[], index: number): T {
  const item = items[index];
  if (item === undefined) throw new Error(`item ${index} não existe`);
  return item;
}
const layersOf = (map: Record<string, unknown>) => map.layers as Layer[];
const objectsOf = (map: Record<string, unknown>) =>
  at(layersOf(map), 1).objects as Record<string, unknown>[];

/** Roda o parse esperando erro e devolve a lista de problemas. */
function problemsOf(map: unknown): string[] {
  try {
    parseLevel(map, TILE);
  } catch (error) {
    if (error instanceof LevelSchemaError) return error.problems;
    throw error;
  }
  throw new Error('era esperado um LevelSchemaError');
}

describe('parseLevel', () => {
  describe('mapa válido', () => {
    it('calcula o tamanho em pixels', () => {
      const level = parseLevel(validMap(), TILE);
      expect(level.widthPx).toBe(128);
      expect(level.heightPx).toBe(96);
    });

    it('usa o ponto de spawn como posição dos pés', () => {
      expect(parseLevel(validMap(), TILE).spawn).toEqual({ x: 16, y: 64 });
    });

    it('lê a bandeira como retângulo', () => {
      expect(parseLevel(validMap(), TILE).flag).toEqual({
        id: 2,
        type: 'flag',
        x: 96,
        y: 0,
        width: 32,
        height: 64,
      });
    });

    it('devolve o nome do tileset', () => {
      expect(parseLevel(validMap(), TILE).tilesetName).toBe('tileset');
    });

    it('aceita "class" no lugar de "type" (Tiled 1.9)', () => {
      const map = validMap();
      const spawn = at(objectsOf(map), 0);
      spawn.class = spawn.type;
      delete spawn.type;
      expect(parseLevel(map, TILE).spawn).toEqual({ x: 16, y: 64 });
    });

    it('converte o y de objetos de tile (gid), que o Tiled mede pela base', () => {
      const map = validMap();
      objectsOf(map)[1] = { id: 2, type: 'flag', gid: 3, x: 96, y: 64, width: 32, height: 64 };
      expect(parseLevel(map, TILE).flag.y).toBe(0);
    });

    it('aceita a camada opcional "hazards"', () => {
      const map = validMap();
      layersOf(map).push({ name: 'hazards', type: 'tilelayer', data: Array(12).fill(0) });
      expect(() => parseLevel(map, TILE)).not.toThrow();
    });
  });

  describe('erros', () => {
    it('rejeita algo que não é objeto', () => {
      expect(problemsOf('nada')).toHaveLength(1);
    });

    it('exige player-spawn', () => {
      const map = validMap();
      objectsOf(map).splice(0, 1);
      expect(problemsOf(map).join()).toContain('player-spawn');
    });

    it('exige flag', () => {
      const map = validMap();
      objectsOf(map).splice(1, 1);
      expect(problemsOf(map).join()).toContain('flag');
    });

    it('rejeita dois player-spawn', () => {
      const map = validMap();
      objectsOf(map).push({ id: 3, type: 'player-spawn', x: 0, y: 0 });
      expect(problemsOf(map).join()).toContain('achei 2');
    });

    it('exige a camada ground', () => {
      const map = validMap();
      layersOf(map).splice(0, 1);
      expect(problemsOf(map).join()).toContain('"ground"');
    });

    it('exige a camada objects', () => {
      const map = validMap();
      layersOf(map).splice(1, 1);
      expect(problemsOf(map).join()).toContain('"objects"');
    });

    it('rejeita tiles em base64 (precisa ser CSV)', () => {
      const map = validMap();
      at(layersOf(map), 0).data = 'AAAA';
      expect(problemsOf(map).join()).toContain('CSV');
    });

    it('rejeita quantidade de tiles diferente do tamanho do mapa', () => {
      const map = validMap();
      at(layersOf(map), 0).data = [0, 0, 1];
      expect(problemsOf(map).join()).toContain('3 tiles');
    });

    it('rejeita tile de tamanho diferente', () => {
      expect(problemsOf({ ...validMap(), tilewidth: 16 }).join()).toContain('32×32');
    });

    it('rejeita mapa infinito', () => {
      expect(problemsOf({ ...validMap(), infinite: true }).join()).toContain('infinito');
    });

    it('rejeita tileset externo e explica como embutir', () => {
      const map = { ...validMap(), tilesets: [{ firstgid: 1, source: 'tileset.tsj' }] };
      expect(problemsOf(map).join()).toContain('Embed Tileset');
    });

    it('exige algum tile com collides: true', () => {
      const map = { ...validMap(), tilesets: [{ firstgid: 1, name: 'tileset', tiles: [] }] };
      expect(problemsOf(map).join()).toContain('collides');
    });

    it('rejeita tipo de objeto desconhecido, citando os tipos válidos', () => {
      const map = validMap();
      objectsOf(map).push({ id: 3, type: 'bandeira', x: 0, y: 0 });
      expect(problemsOf(map).join()).toContain('"bandeira"');
    });

    it('junta vários problemas de uma vez', () => {
      const map = { ...validMap(), orientation: 'isometric', infinite: true };
      expect(problemsOf(map).length).toBeGreaterThanOrEqual(2);
    });
  });
});

describe('bottomCenter', () => {
  it('é o centro da base do retângulo', () => {
    expect(bottomCenter({ id: 1, type: 'flag', x: 10, y: 20, width: 30, height: 40 })).toEqual({
      x: 25,
      y: 60,
    });
  });
});
