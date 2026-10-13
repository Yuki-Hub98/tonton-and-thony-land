import { describe, expect, it } from 'vitest';
import { PlayerStateMachine, type PlayerEvent } from './PlayerStateMachine';

const INVINCIBLE_MS = 2000;

function armedMachine(): PlayerStateMachine {
  const machine = new PlayerStateMachine(INVINCIBLE_MS);
  machine.send('pickupEquipment', 0);
  return machine;
}

function carMachine(): PlayerStateMachine {
  const machine = new PlayerStateMachine(INVINCIBLE_MS);
  machine.send('pickupCar', 0);
  return machine;
}

function deadMachine(): PlayerStateMachine {
  const machine = new PlayerStateMachine(INVINCIBLE_MS);
  machine.send('damage', 0);
  return machine;
}

describe('PlayerStateMachine', () => {
  it('começa normal, sem invencibilidade e sem poder bater', () => {
    const machine = new PlayerStateMachine(INVINCIBLE_MS);
    expect(machine.state).toBe('normal');
    expect(machine.isInvincible(0)).toBe(false);
    expect(machine.canAttack).toBe(false);
    expect(machine.isInPlay).toBe(true);
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

    it('fica armado ao pegar o equipamento', () => {
      expect(new PlayerStateMachine(INVINCIBLE_MS).send('pickupEquipment', 100)).toBe('armed');
    });

    it('vira carro ao pegar o carro', () => {
      expect(new PlayerStateMachine(INVINCIBLE_MS).send('pickupCar', 100)).toBe('car');
    });

    it('não dirige sozinho', () => {
      expect(new PlayerStateMachine(INVINCIBLE_MS).isAutoDriving).toBe(false);
    });

    it.each<PlayerEvent>(['respawn', 'gameOver'])('ignora %s', (event) => {
      expect(new PlayerStateMachine(INVINCIBLE_MS).send(event, 100)).toBe('normal');
    });
  });

  describe('armado', () => {
    it('pode bater e continua em jogo', () => {
      const machine = armedMachine();
      expect(machine.canAttack).toBe(true);
      expect(machine.isInPlay).toBe(true);
    });

    it('perde o equipamento ao levar dano, sem morrer, e fica invencível', () => {
      const machine = armedMachine();
      expect(machine.send('damage', 1000)).toBe('normal');
      expect(machine.canAttack).toBe(false);
      expect(machine.invincibleUntil).toBe(1000 + INVINCIBLE_MS);
      expect(machine.isInvincible(1000 + INVINCIBLE_MS - 1)).toBe(true);
    });

    it('não morre com um segundo dano durante a invencibilidade', () => {
      const machine = armedMachine();
      machine.send('damage', 1000);
      expect(machine.send('damage', 1500)).toBe('normal');
    });

    it('morre com o segundo dano depois que a invencibilidade acaba', () => {
      const machine = armedMachine();
      machine.send('damage', 1000);
      expect(machine.send('damage', 1000 + INVINCIBLE_MS)).toBe('dead');
    });

    it('pode pegar o equipamento de novo depois de perder', () => {
      const machine = armedMachine();
      machine.send('damage', 1000);
      expect(machine.send('pickupEquipment', 1100)).toBe('armed');
    });

    it('não perde o equipamento com dano durante a invencibilidade do respawn', () => {
      const machine = deadMachine();
      machine.send('respawn', 1000);
      machine.send('pickupEquipment', 1100);
      expect(machine.send('damage', 1200)).toBe('armed');
    });

    it('morre ao cair no buraco mesmo armado', () => {
      expect(armedMachine().send('fall', 100)).toBe('dead');
    });

    it('termina a fase ao chegar na bandeira', () => {
      expect(armedMachine().send('reachFlag', 100)).toBe('levelComplete');
    });

    it('vira carro ao pegar o carro', () => {
      expect(armedMachine().send('pickupCar', 100)).toBe('car');
    });

    it.each<PlayerEvent>(['pickupEquipment', 'respawn', 'gameOver'])('ignora %s', (event) => {
      expect(armedMachine().send(event, 100)).toBe('armed');
    });
  });

  describe('no carro', () => {
    it('dirige sozinho, sem poder bater, e continua em jogo', () => {
      const machine = carMachine();
      expect(machine.isAutoDriving).toBe(true);
      expect(machine.canAttack).toBe(false);
      expect(machine.isInPlay).toBe(true);
    });

    it('é invencível o tempo todo', () => {
      const machine = carMachine();
      expect(machine.isInvincible(0)).toBe(true);
      expect(machine.isInvincible(1_000_000)).toBe(true);
    });

    it('termina a fase ao chegar na bandeira', () => {
      expect(carMachine().send('reachFlag', 100)).toBe('levelComplete');
    });

    it.each<PlayerEvent>(['damage', 'fall', 'pickupEquipment', 'pickupCar', 'respawn', 'gameOver'])(
      'ignora %s',
      (event) => {
        expect(carMachine().send(event, 100)).toBe('car');
      },
    );

    it('não dirige mais depois da bandeira', () => {
      const machine = carMachine();
      machine.send('reachFlag', 100);
      expect(machine.isAutoDriving).toBe(false);
      expect(machine.isInvincible(100)).toBe(false);
    });
  });

  describe('morto', () => {
    it('volta ao normal (sem equipamento) no respawn, invencível por um tempo', () => {
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

    it.each<PlayerEvent>(['pickupEquipment', 'pickupCar', 'damage', 'fall', 'reachFlag'])(
      'ignora %s',
      (event) => {
        expect(deadMachine().send(event, 1000)).toBe('dead');
      },
    );

    it('não conta como invencível nem em jogo', () => {
      expect(deadMachine().isInvincible(0)).toBe(false);
      expect(deadMachine().isInPlay).toBe(false);
    });

    it('perde o equipamento ao morrer armado', () => {
      const machine = armedMachine();
      machine.send('fall', 100);
      machine.send('respawn', 1000);
      expect(machine.state).toBe('normal');
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

  it.each<PlayerEvent>(['pickupEquipment', 'pickupCar', 'damage', 'fall', 'respawn', 'gameOver'])(
    'fase concluída é final: ignora %s',
    (event) => {
      const machine = new PlayerStateMachine(INVINCIBLE_MS);
      machine.send('reachFlag', 0);
      expect(machine.send(event, 100)).toBe('levelComplete');
    },
  );

  it.each<PlayerEvent>(['pickupEquipment', 'pickupCar', 'damage', 'fall', 'reachFlag', 'respawn'])(
    'game over é final: ignora %s',
    (event) => {
      const machine = deadMachine();
      machine.send('gameOver', 0);
      expect(machine.send(event, 100)).toBe('gameOver');
    },
  );
});
