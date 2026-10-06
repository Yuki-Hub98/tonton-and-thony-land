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

  it.each(LEVELS)('$key tem todos os objetos dentro do mapa', ({ path }) => {
    const level = parseLevel(fileFor(path), TILE_SIZE);
    for (const object of level.objects) {
      expect(object.x).toBeGreaterThanOrEqual(0);
      expect(object.x + object.width).toBeLessThanOrEqual(level.widthPx);
      expect(object.y).toBeGreaterThanOrEqual(0);
      expect(object.y + object.height).toBeLessThanOrEqual(level.heightPx);
    }
  });

  it.each(LEVELS)('$key tem pelo menos um equipamento entre o início e a bandeira', ({ path }) => {
    const level = parseLevel(fileFor(path), TILE_SIZE);
    const equipment = level.objects.filter((o) => o.type === 'equipment');
    expect(equipment.length).toBeGreaterThan(0);
    for (const item of equipment) {
      expect(item.x).toBeGreaterThan(level.spawn.x);
      expect(item.x).toBeLessThan(level.flag.x);
    }
  });

  it.each(LEVELS)('$key tem no máximo um carro, entre o início e a bandeira', ({ path }) => {
    const level = parseLevel(fileFor(path), TILE_SIZE);
    const cars = level.objects.filter((o) => o.type === 'car');
    expect(cars.length).toBeLessThanOrEqual(1);
    for (const car of cars) {
      expect(car.x).toBeGreaterThan(level.spawn.x);
      expect(car.x).toBeLessThan(level.flag.x);
    }
  });

  it('o carro aparece só na última fase', () => {
    LEVELS.forEach(({ path }, index) => {
      const level = parseLevel(fileFor(path), TILE_SIZE);
      const hasCar = level.objects.some((o) => o.type === 'car');
      expect(hasCar).toBe(index === LEVELS.length - 1);
    });
  });

  it('tem as 3 fases do jogo', () => {
    expect(LEVELS).toHaveLength(3);
  });

  it.each(LEVELS)('$key tem os checkpoints entre o início e a bandeira', ({ path }) => {
    const level = parseLevel(fileFor(path), TILE_SIZE);
    for (const checkpoint of level.objects.filter((o) => o.type === 'checkpoint')) {
      expect(checkpoint.x).toBeGreaterThan(level.spawn.x);
      expect(checkpoint.x).toBeLessThan(level.flag.x);
    }
  });
});
