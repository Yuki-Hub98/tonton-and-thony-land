import { describe, expect, it } from 'vitest';
import { moveSelection } from './menuSelection';

describe('moveSelection', () => {
  it('vai para a próxima opção', () => {
    expect(moveSelection(0, 1, 2)).toBe(1);
  });

  it('volta para a opção anterior', () => {
    expect(moveSelection(1, -1, 2)).toBe(0);
  });

  it('da última opção dá a volta para a primeira', () => {
    expect(moveSelection(1, 1, 2)).toBe(0);
  });

  it('da primeira opção dá a volta para a última', () => {
    expect(moveSelection(0, -1, 2)).toBe(1);
  });

  it('com uma opção só, fica nela', () => {
    expect(moveSelection(0, 1, 1)).toBe(0);
  });

  it('falha com menu vazio', () => {
    expect(() => moveSelection(0, 1, 0)).toThrow();
  });
});
