import { describe, expect, it } from 'vitest';
import { VirtualButtons } from './VirtualButtons';

describe('VirtualButtons', () => {
  it('começa sem nada apertado', () => {
    const buttons = new VirtualButtons();
    expect(buttons.isDown('jump')).toBe(false);
    expect(buttons.consumePressed('jump')).toBe(false);
    expect(buttons.consumeReleased('jump')).toBe(false);
  });

  it('segura enquanto o dedo está no botão', () => {
    const buttons = new VirtualButtons();
    buttons.press('right', 1);
    expect(buttons.isDown('right')).toBe(true);
    buttons.release(1);
    expect(buttons.isDown('right')).toBe(false);
  });

  it('avisa o aperto uma vez só por toque', () => {
    const buttons = new VirtualButtons();
    buttons.press('jump', 1);
    expect(buttons.consumePressed('jump')).toBe(true);
    expect(buttons.consumePressed('jump')).toBe(false);
  });

  it('avisa quando solta, uma vez só', () => {
    const buttons = new VirtualButtons();
    buttons.press('jump', 1);
    buttons.release(1);
    expect(buttons.consumeReleased('jump')).toBe(true);
    expect(buttons.consumeReleased('jump')).toBe(false);
  });

  it('toque rápido entre dois frames ainda conta como aperto e soltura', () => {
    const buttons = new VirtualButtons();
    buttons.press('jump', 1);
    buttons.release(1);
    expect(buttons.consumePressed('jump')).toBe(true);
    expect(buttons.consumeReleased('jump')).toBe(true);
    expect(buttons.isDown('jump')).toBe(false);
  });

  it('dois dedos em botões diferentes funcionam juntos', () => {
    const buttons = new VirtualButtons();
    buttons.press('right', 1);
    buttons.press('jump', 2);
    expect(buttons.isDown('right')).toBe(true);
    expect(buttons.isDown('jump')).toBe(true);
    buttons.release(2);
    expect(buttons.isDown('right')).toBe(true);
    expect(buttons.isDown('jump')).toBe(false);
  });

  it('dois dedos no mesmo botão: só solta quando os dois saem', () => {
    const buttons = new VirtualButtons();
    buttons.press('right', 1);
    buttons.press('right', 2);
    buttons.consumePressed('right');
    expect(buttons.consumePressed('right')).toBe(false);
    buttons.release(1);
    expect(buttons.isDown('right')).toBe(true);
    expect(buttons.consumeReleased('right')).toBe(false);
    buttons.release(2);
    expect(buttons.consumeReleased('right')).toBe(true);
  });

  it('dedo que desliza de um botão para outro troca a ação', () => {
    const buttons = new VirtualButtons();
    buttons.press('left', 1);
    buttons.press('right', 1);
    expect(buttons.isDown('left')).toBe(false);
    expect(buttons.isDown('right')).toBe(true);
    expect(buttons.consumeReleased('left')).toBe(true);
  });

  it('soltar um dedo que não segurava nada não faz nada', () => {
    const buttons = new VirtualButtons();
    buttons.release(7);
    expect(buttons.consumeReleased('jump')).toBe(false);
  });

  it('releaseAll solta todos os botões', () => {
    const buttons = new VirtualButtons();
    buttons.press('left', 1);
    buttons.press('jump', 2);
    buttons.releaseAll();
    expect(buttons.isDown('left')).toBe(false);
    expect(buttons.isDown('jump')).toBe(false);
  });
});
