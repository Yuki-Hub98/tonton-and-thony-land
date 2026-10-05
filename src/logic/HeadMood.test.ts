import { describe, expect, it } from 'vitest';
import { HeadMood, resolveHeadTexture, type HeadMoodTiming, type HeadPoses } from './HeadMood';

const timing: HeadMoodTiming = {
  idleFrames: 3,
  idleSlideMs: 1000,
  happyDurationMs: 2000,
  sadDurationMs: 1500,
};

const poses: HeadPoses = {
  idle: ['idle-1', 'idle-2', 'idle-3'],
  sad: 'sad',
  happy: 'happy',
};

describe('HeadMood', () => {
  describe('ciclo idle', () => {
    it('começa na primeira foto', () => {
      expect(new HeadMood(timing, 0).current(0)).toEqual({ kind: 'idle', index: 0 });
    });

    it('troca de foto a cada idleSlideMs', () => {
      const mood = new HeadMood(timing, 0);
      expect(mood.current(999)).toEqual({ kind: 'idle', index: 0 });
      expect(mood.current(1000)).toEqual({ kind: 'idle', index: 1 });
      expect(mood.current(2500)).toEqual({ kind: 'idle', index: 2 });
    });

    it('volta para a primeira foto depois da última', () => {
      expect(new HeadMood(timing, 0).current(3000)).toEqual({ kind: 'idle', index: 0 });
    });

    it('conta o tempo a partir do início informado', () => {
      expect(new HeadMood(timing, 5000).current(6000)).toEqual({ kind: 'idle', index: 1 });
    });
  });

  describe('pegou item', () => {
    it('fica feliz durante happyDurationMs', () => {
      const mood = new HeadMood(timing, 0);
      mood.notify('pickedItem', 100);
      expect(mood.current(100)).toEqual({ kind: 'happy' });
      expect(mood.current(2099)).toEqual({ kind: 'happy' });
    });

    it('volta ao normal depois, recomeçando o slide na primeira foto', () => {
      const mood = new HeadMood(timing, 0);
      mood.notify('pickedItem', 100);
      expect(mood.current(2100)).toEqual({ kind: 'idle', index: 0 });
      expect(mood.current(3100)).toEqual({ kind: 'idle', index: 1 });
    });

    it('pegar outro item renova o tempo feliz', () => {
      const mood = new HeadMood(timing, 0);
      mood.notify('pickedItem', 0);
      mood.notify('pickedItem', 1500);
      expect(mood.current(3000)).toEqual({ kind: 'happy' });
    });
  });

  describe('levou dano', () => {
    it('fica triste durante sadDurationMs e depois volta ao normal', () => {
      const mood = new HeadMood(timing, 0);
      mood.notify('damaged', 0);
      expect(mood.current(1499)).toEqual({ kind: 'sad' });
      expect(mood.current(1500)).toEqual({ kind: 'idle', index: 0 });
    });

    it('dano durante o feliz troca para triste', () => {
      const mood = new HeadMood(timing, 0);
      mood.notify('pickedItem', 0);
      mood.notify('damaged', 500);
      expect(mood.current(600)).toEqual({ kind: 'sad' });
    });
  });

  describe('morreu', () => {
    it('fica triste até o respawn, sem limite de tempo', () => {
      const mood = new HeadMood(timing, 0);
      mood.notify('died', 0);
      expect(mood.current(1_000_000)).toEqual({ kind: 'sad' });
    });

    it('ignora itens e dano enquanto está morto', () => {
      const mood = new HeadMood(timing, 0);
      mood.notify('died', 0);
      mood.notify('pickedItem', 100);
      mood.notify('damaged', 200);
      expect(mood.current(10_000)).toEqual({ kind: 'sad' });
    });

    it('volta ao ciclo idle no respawn', () => {
      const mood = new HeadMood(timing, 0);
      mood.notify('died', 0);
      mood.notify('respawned', 4000);
      expect(mood.current(4000)).toEqual({ kind: 'idle', index: 0 });
      expect(mood.current(5000)).toEqual({ kind: 'idle', index: 1 });
    });
  });
});

describe('resolveHeadTexture', () => {
  it('usa a foto idle do índice', () => {
    expect(resolveHeadTexture({ kind: 'idle', index: 1 }, poses)).toBe('idle-2');
  });

  it('usa a foto sad quando triste', () => {
    expect(resolveHeadTexture({ kind: 'sad' }, poses)).toBe('sad');
  });

  it('usa a foto happy quando feliz', () => {
    expect(resolveHeadTexture({ kind: 'happy' }, poses)).toBe('happy');
  });

  it('dá a volta se o índice passar do número de fotos', () => {
    expect(resolveHeadTexture({ kind: 'idle', index: 4 }, poses)).toBe('idle-2');
  });

  it('falha se não houver foto idle', () => {
    expect(() => resolveHeadTexture({ kind: 'idle', index: 0 }, { ...poses, idle: [] })).toThrow();
  });
});
