import { describe, expect, it } from 'vitest';
import { SAVE_KEY, SaveManager, type KeyValueStorage } from './SaveManager';

const LEVEL_COUNT = 3;

/** localStorage de mentira, em memória. */
class MemoryStorage implements KeyValueStorage {
  readonly items = new Map<string, string>();
  getItem(key: string): string | null {
    return this.items.get(key) ?? null;
  }
  setItem(key: string, value: string): void {
    this.items.set(key, value);
  }
  removeItem(key: string): void {
    this.items.delete(key);
  }
}

/** localStorage que sempre dá erro (modo anônimo, bloqueado, cheio). */
class BrokenStorage implements KeyValueStorage {
  getItem(): string | null {
    throw new Error('bloqueado');
  }
  setItem(): void {
    throw new Error('bloqueado');
  }
  removeItem(): void {
    throw new Error('bloqueado');
  }
}

describe('SaveManager', () => {
  it('sem nada salvo, começa do início', () => {
    expect(new SaveManager(new MemoryStorage(), LEVEL_COUNT).continueLevel('anthony')).toBe(0);
  });

  it('salva e carrega a fase alcançada', () => {
    const storage = new MemoryStorage();
    new SaveManager(storage, LEVEL_COUNT).recordLevelReached('anthony', 2);
    // Outra instância lendo o mesmo armazenamento (como reabrir o jogo).
    expect(new SaveManager(storage, LEVEL_COUNT).continueLevel('anthony')).toBe(2);
  });

  it('guarda o progresso de cada personagem separado', () => {
    const save = new SaveManager(new MemoryStorage(), LEVEL_COUNT);
    save.recordLevelReached('anthony', 2);
    save.recordLevelReached('antonela', 1);
    expect(save.continueLevel('anthony')).toBe(2);
    expect(save.continueLevel('antonela')).toBe(1);
  });

  it('não volta para trás ao registrar uma fase anterior', () => {
    const save = new SaveManager(new MemoryStorage(), LEVEL_COUNT);
    save.recordLevelReached('anthony', 2);
    save.recordLevelReached('anthony', 1);
    expect(save.continueLevel('anthony')).toBe(2);
  });

  it.each([-1, 3, 1.5, Number.NaN])('ignora fase inválida (%s)', (level) => {
    const storage = new MemoryStorage();
    new SaveManager(storage, LEVEL_COUNT).recordLevelReached('anthony', level);
    expect(storage.items.size).toBe(0);
  });

  it('clearProgress volta ao início só daquele personagem', () => {
    const save = new SaveManager(new MemoryStorage(), LEVEL_COUNT);
    save.recordLevelReached('anthony', 2);
    save.recordLevelReached('antonela', 1);
    save.clearProgress('anthony');
    expect(save.continueLevel('anthony')).toBe(0);
    expect(save.continueLevel('antonela')).toBe(1);
  });

  it('se o jogo perdeu fases, não continua de uma que não existe mais', () => {
    const storage = new MemoryStorage();
    new SaveManager(storage, 5).recordLevelReached('anthony', 4);
    expect(new SaveManager(storage, LEVEL_COUNT).continueLevel('anthony')).toBe(2);
  });

  describe('localStorage indisponível ou estragado', () => {
    it('sem localStorage: começa do início e salvar não quebra', () => {
      const save = new SaveManager(undefined, LEVEL_COUNT);
      expect(() => save.recordLevelReached('anthony', 1)).not.toThrow();
      expect(save.continueLevel('anthony')).toBe(0);
    });

    it('localStorage que dá erro: começa do início e nada lança erro', () => {
      const save = new SaveManager(new BrokenStorage(), LEVEL_COUNT);
      expect(save.continueLevel('anthony')).toBe(0);
      expect(() => save.recordLevelReached('anthony', 1)).not.toThrow();
      expect(() => save.clearProgress('anthony')).not.toThrow();
    });

    it.each([
      ['texto que não é JSON', 'isso não é json'],
      ['JSON vazio', '{}'],
      ['versão diferente', JSON.stringify({ version: 99, reachedLevel: { anthony: 2 } })],
      ['lista no lugar do objeto', JSON.stringify([1, 2, 3])],
      ['null', 'null'],
    ])('dado estragado (%s): começa do início', (_label, raw) => {
      const storage = new MemoryStorage();
      storage.setItem(SAVE_KEY, raw);
      expect(new SaveManager(storage, LEVEL_COUNT).continueLevel('anthony')).toBe(0);
    });

    it('valor estragado de um personagem não estraga o do outro', () => {
      const storage = new MemoryStorage();
      storage.setItem(
        SAVE_KEY,
        JSON.stringify({ version: 1, reachedLevel: { anthony: 'dois', antonela: 2 } }),
      );
      const save = new SaveManager(storage, LEVEL_COUNT);
      expect(save.continueLevel('anthony')).toBe(0);
      expect(save.continueLevel('antonela')).toBe(2);
    });

    it('dá para salvar por cima de um dado estragado', () => {
      const storage = new MemoryStorage();
      storage.setItem(SAVE_KEY, 'lixo');
      const save = new SaveManager(storage, LEVEL_COUNT);
      save.recordLevelReached('anthony', 1);
      expect(save.continueLevel('anthony')).toBe(1);
    });
  });
});
