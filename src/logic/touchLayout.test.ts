import { describe, expect, it } from 'vitest';
import { touchButtonLayout, type TouchAction } from './touchLayout';

const SIZE = 96;
const MARGIN = 24;
const GAP = 20;

/** Posição do botão da ação (o teste falha se ele não existir). */
function find(width: number, action: TouchAction) {
  const button = touchButtonLayout(width, 540, SIZE, MARGIN, GAP).find((b) => b.action === action);
  if (!button) throw new Error(`botão ${action} não existe`);
  return button;
}

describe('touchButtonLayout', () => {
  it('tem os 4 botões, uma vez cada', () => {
    const actions = touchButtonLayout(960, 540, SIZE, MARGIN, GAP).map((b) => b.action);
    expect([...actions].sort()).toEqual(['attack', 'jump', 'left', 'right']);
  });

  it('andar fica à esquerda e pular/bater à direita', () => {
    expect(find(960, 'left').x).toBeLessThan(find(960, 'right').x);
    expect(find(960, 'right').x).toBeLessThan(960 / 2);
    expect(find(960, 'attack').x).toBeGreaterThan(960 / 2);
    expect(find(960, 'attack').x).toBeLessThan(find(960, 'jump').x);
  });

  it('todos os botões cabem inteiros na tela, em qualquer largura', () => {
    for (const width of [720, 960, 1280]) {
      for (const button of touchButtonLayout(width, 540, SIZE, MARGIN, GAP)) {
        expect(button.x - SIZE / 2).toBeGreaterThanOrEqual(0);
        expect(button.x + SIZE / 2).toBeLessThanOrEqual(width);
        expect(button.y - SIZE / 2).toBeGreaterThanOrEqual(0);
        expect(button.y + SIZE / 2).toBeLessThanOrEqual(540);
      }
    }
  });

  it('botões não se sobrepõem', () => {
    const buttons = touchButtonLayout(720, 540, SIZE, MARGIN, GAP);
    for (const a of buttons) {
      for (const b of buttons) {
        if (a === b) continue;
        expect(Math.hypot(a.x - b.x, a.y - b.y)).toBeGreaterThanOrEqual(SIZE);
      }
    }
  });
});
