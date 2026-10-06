import { describe, expect, it } from 'vitest';
import { shouldAutoJump } from './autoDrive';

describe('shouldAutoJump', () => {
  it('segue em frente no chão liso', () => {
    expect(shouldAutoJump({ onGround: true, blockedAhead: false, groundAhead: true })).toBe(false);
  });

  it('pula na parede ou degrau à frente', () => {
    expect(shouldAutoJump({ onGround: true, blockedAhead: true, groundAhead: true })).toBe(true);
  });

  it('pula na beirada do buraco', () => {
    expect(shouldAutoJump({ onGround: true, blockedAhead: false, groundAhead: false })).toBe(true);
  });

  it('não pula de novo no ar', () => {
    expect(shouldAutoJump({ onGround: false, blockedAhead: true, groundAhead: false })).toBe(false);
  });
});
