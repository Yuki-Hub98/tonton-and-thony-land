import { describe, expect, it } from 'vitest';
import { PlayerStateMachine, type PlayerEvent } from './PlayerStateMachine';

const INVINCIBLE_MS = 2000;

function deadMachine(): PlayerStateMachine {
  const machine = new PlayerStateMachine(INVINCIBLE_MS);
  machine.send('damage', 0);
  return machine;
}

describe('PlayerStateMachine', () => {
  it('começa normal e sem invencibilidade', () => {
    const machine = new PlayerStateMachine(INVINCIBLE_MS);
    expect(machine.state).toBe('normal');
    expect(machine.isInvincible(0)).toBe(false);
  });

  describe('no estado normal', () => {
    it('morre ao levar dano (sem equipamento)', () => {
      expect(new PlayerStateMachine(INVINCIBLE_MS).send('damage', 100)).toBe('dead');
    });

    it('morre ao cair no buraco', () => {
      expect(new PlayerStateMachine(INVINCIBLE_MS).send('fall', 100)).toBe('dead');
    });

    it('termina a fase ao chegar na bandeira', () => {
      expect(new PlayerStateMachine(INVINCIBLE_MS).send('reachFlag', 100)).toBe('levelComplete');
    });

    it.each<PlayerEvent>(['respawn', 'gameOver'])('ignora %s', (event) => {
      expect(new PlayerStateMachine(INVINCIBLE_MS).send(event, 100)).toBe('normal');
    });
  });

  describe('morto', () => {
    it('volta ao normal no respawn, invencível por um tempo', () => {
      const machine = deadMachine();
      expect(machine.send('respawn', 1000)).toBe('normal');
      expect(machine.invincibleUntil).toBe(1000 + INVINCIBLE_MS);
      expect(machine.isInvincible(1000)).toBe(true);
      expect(machine.isInvincible(1000 + INVINCIBLE_MS - 1)).toBe(true);
      expect(machine.isInvincible(1000 + INVINCIBLE_MS)).toBe(false);
    });

    it('vai para game over', () => {
      expect(deadMachine().send('gameOver', 1000)).toBe('gameOver');
    });

    it.each<PlayerEvent>(['damage', 'fall', 'reachFlag'])('ignora %s', (event) => {
      expect(deadMachine().send(event, 1000)).toBe('dead');
    });

    it('não conta como invencível', () => {
      expect(deadMachine().isInvincible(0)).toBe(false);
    });
  });

  describe('invencível depois do respawn', () => {
    it('ignora dano', () => {
      const machine = deadMachine();
      machine.send('respawn', 1000);
      expect(machine.send('damage', 1500)).toBe('normal');
    });

    it('volta a morrer com dano quando a invencibilidade acaba', () => {
      const machine = deadMachine();
      machine.send('respawn', 1000);
      expect(machine.send('damage', 1000 + INVINCIBLE_MS)).toBe('dead');
    });

    it('morre ao cair no buraco mesmo invencível', () => {
      const machine = deadMachine();
      machine.send('respawn', 1000);
      expect(machine.send('fall', 1500)).toBe('dead');
    });
  });

  it.each<PlayerEvent>(['damage', 'fall', 'respawn', 'gameOver'])(
    'fase concluída é final: ignora %s',
    (event) => {
      const machine = new PlayerStateMachine(INVINCIBLE_MS);
      machine.send('reachFlag', 0);
      expect(machine.send(event, 100)).toBe('levelComplete');
    },
  );

  it.each<PlayerEvent>(['damage', 'fall', 'reachFlag', 'respawn'])(
    'game over é final: ignora %s',
    (event) => {
      const machine = deadMachine();
      machine.send('gameOver', 0);
      expect(machine.send(event, 100)).toBe('gameOver');
    },
  );
});
