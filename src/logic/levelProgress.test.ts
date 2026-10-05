import { describe, expect, it } from 'vitest';
import { nextLevelIndex } from './levelProgress';

describe('nextLevelIndex', () => {
  it('vai para a próxima fase', () => {
    expect(nextLevelIndex(0, 3)).toBe(1);
  });

  it('devolve null depois da última fase', () => {
    expect(nextLevelIndex(2, 3)).toBeNull();
  });

  it('com uma fase só, a primeira já é a última', () => {
    expect(nextLevelIndex(0, 1)).toBeNull();
  });
});
