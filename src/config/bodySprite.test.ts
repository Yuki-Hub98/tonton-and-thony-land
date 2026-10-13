import { describe, expect, it } from 'vitest';
import { attachmentOffset } from '../logic/bodyAnimation';
import {
  BODY_FAR_HAND,
  BODY_FAR_HAND_FALLBACK,
  BODY_FRAME_COUNT,
  BODY_FRAME_HEIGHT,
  BODY_FRAME_WIDTH,
  BODY_NEAR_HAND,
  BODY_NEAR_HAND_FALLBACK,
} from './bodySprite';
import { BODY_SCALE, HAND_ITEM_GRIP_Y, HAND_ITEM_HEIGHT, HAND_ITEM_REST_ANGLE } from './constants';

const HANDS = { near: BODY_NEAR_HAND, far: BODY_FAR_HAND };

describe('mãos do corpo', () => {
  it.each(Object.entries(HANDS))('mão %s tem um ponto por quadro', (_name, hand) => {
    expect(hand).toHaveLength(BODY_FRAME_COUNT);
  });

  it.each(Object.entries(HANDS))('mão %s fica dentro do quadro', (_name, hand) => {
    for (const { x, y } of hand) {
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThanOrEqual(BODY_FRAME_WIDTH);
      expect(y).toBeGreaterThanOrEqual(0);
      expect(y).toBeLessThanOrEqual(BODY_FRAME_HEIGHT);
    }
  });

  it('a mão perto da câmera fica atrás do meio e a de longe, à frente (olhando para a direita)', () => {
    for (let frame = 0; frame < BODY_FRAME_COUNT; frame++) {
      expect(BODY_NEAR_HAND[frame]?.x).toBeLessThan(BODY_FRAME_WIDTH / 2);
      expect(BODY_FAR_HAND[frame]?.x).toBeGreaterThan(BODY_FRAME_WIDTH / 2);
    }
  });

  it('os pontos de reserva são os do quadro parado', () => {
    expect(BODY_NEAR_HAND_FALLBACK).toEqual(BODY_NEAR_HAND[0]);
    expect(BODY_FAR_HAND_FALLBACK).toEqual(BODY_FAR_HAND[0]);
  });

  it('parado, a ponta da vassoura inclinada chega no chão sem afundar nele', () => {
    const hand = attachmentOffset(
      BODY_NEAR_HAND_FALLBACK,
      BODY_FRAME_WIDTH,
      BODY_FRAME_HEIGHT,
      BODY_SCALE,
      1,
    );
    const below = HAND_ITEM_HEIGHT * (1 - HAND_ITEM_GRIP_Y);
    const tipY = hand.y + below * Math.cos((HAND_ITEM_REST_ANGLE * Math.PI) / 180);
    // tipY é a distância até os pés (0 = no chão; positivo = abaixo do chão).
    expect(tipY).toBeLessThanOrEqual(1);
    expect(tipY).toBeGreaterThan(-4);
  });
});
