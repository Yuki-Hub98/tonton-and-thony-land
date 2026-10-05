import { describe, expect, it } from 'vitest';
import { nextPatrolDirection, type PatrolSensors } from './enemyPatrol';

const free: PatrolSensors = {
  blockedLeft: false,
  blockedRight: false,
  onGround: true,
  groundAhead: true,
};

describe('nextPatrolDirection', () => {
  it('continua andando quando o caminho está livre', () => {
    expect(nextPatrolDirection(-1, free)).toBe(-1);
    expect(nextPatrolDirection(1, free)).toBe(1);
  });

  it('vira ao bater numa parede à frente', () => {
    expect(nextPatrolDirection(-1, { ...free, blockedLeft: true })).toBe(1);
    expect(nextPatrolDirection(1, { ...free, blockedRight: true })).toBe(-1);
  });

  it('não vira por causa de parede atrás', () => {
    expect(nextPatrolDirection(1, { ...free, blockedLeft: true })).toBe(1);
    expect(nextPatrolDirection(-1, { ...free, blockedRight: true })).toBe(-1);
  });

  it('vira na beirada para não cair', () => {
    expect(nextPatrolDirection(-1, { ...free, groundAhead: false })).toBe(1);
    expect(nextPatrolDirection(1, { ...free, groundAhead: false })).toBe(-1);
  });

  it('no ar segue em frente', () => {
    expect(nextPatrolDirection(1, { ...free, onGround: false, groundAhead: false })).toBe(1);
  });
});
