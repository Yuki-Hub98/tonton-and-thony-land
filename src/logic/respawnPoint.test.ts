import { describe, expect, it } from 'vitest';
import { furthestRespawnPoint } from './respawnPoint';

describe('furthestRespawnPoint', () => {
  const start = { x: 100, y: 480 };

  it('usa o checkpoint que está mais à frente', () => {
    const checkpoint = { x: 2000, y: 480 };
    expect(furthestRespawnPoint(start, checkpoint)).toBe(checkpoint);
  });

  it('mantém o ponto atual se o checkpoint ficou para trás', () => {
    const current = { x: 3000, y: 384 };
    expect(furthestRespawnPoint(current, { x: 2000, y: 480 })).toBe(current);
  });

  it('tocar de novo no mesmo checkpoint não muda nada', () => {
    const checkpoint = { x: 2000, y: 480 };
    expect(furthestRespawnPoint(checkpoint, { ...checkpoint })).toBe(checkpoint);
  });
});
