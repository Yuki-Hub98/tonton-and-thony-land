import { describe, expect, it } from 'vitest';
import { jumpHeight } from '../logic/movement';
import {
  CAR_JUMP_VELOCITY,
  GAME_HEIGHT,
  GRAVITY_Y,
  PLAYER_JUMP_VELOCITY,
  TILE_SIZE,
} from './constants';

describe('pulo', () => {
  it('o jogador pula pelo menos 6 blocos (no celular o pulo é sempre o cheio)', () => {
    expect(jumpHeight(PLAYER_JUMP_VELOCITY, GRAVITY_Y)).toBeGreaterThanOrEqual(6 * TILE_SIZE);
  });

  it('o pulo cabe na tela: não sobe mais que metade da altura do jogo', () => {
    expect(jumpHeight(PLAYER_JUMP_VELOCITY, GRAVITY_Y)).toBeLessThanOrEqual(GAME_HEIGHT / 2);
  });

  it('o carro pula com o valor validado nas fases (make_levels.py usa -620)', () => {
    expect(CAR_JUMP_VELOCITY).toBe(-620);
  });
});
