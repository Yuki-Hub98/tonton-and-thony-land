// Posição dos botões de toque na tela, sem Phaser.
import type { Action } from '../types';

export type TouchAction = Extract<Action, 'left' | 'right' | 'jump' | 'attack'>;

export interface TouchButtonPlacement {
  action: TouchAction;
  /** Centro do botão. */
  x: number;
  y: number;
}

/**
 * Andar fica no canto de baixo à esquerda (polegar esquerdo) e pular/bater no canto
 * de baixo à direita (polegar direito), como num controle. Pular fica no canto, que é
 * o botão mais usado; bater fica ao lado, um pouco acima.
 */
export function touchButtonLayout(
  screenWidth: number,
  screenHeight: number,
  buttonSize: number,
  margin: number,
  gap: number,
): TouchButtonPlacement[] {
  const half = buttonSize / 2;
  const bottomY = screenHeight - margin - half;
  const raisedY = bottomY - buttonSize * 0.6;
  const leftX = margin + half;
  const rightX = screenWidth - margin - half;
  const step = buttonSize + gap;
  return [
    { action: 'left', x: leftX, y: bottomY },
    { action: 'right', x: leftX + step, y: bottomY },
    { action: 'jump', x: rightX, y: bottomY },
    { action: 'attack', x: rightX - step, y: raisedY },
  ];
}
