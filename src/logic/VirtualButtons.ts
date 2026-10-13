// Botões de toque na tela, sem Phaser. Cada dedo (pointer) pode segurar um botão;
// vários dedos ao mesmo tempo funcionam (ex.: segurar "direita" e tocar "pular").
import type { Action } from '../types';

export class VirtualButtons {
  /** Qual ação cada dedo está segurando (chave: id do pointer). */
  private readonly held = new Map<number, Action>();
  /** Ações apertadas/soltas desde a última consulta (como o JustDown/JustUp do teclado). */
  private readonly pressedSinceRead = new Set<Action>();
  private readonly releasedSinceRead = new Set<Action>();

  /** Um dedo começou a tocar no botão da ação. */
  press(action: Action, pointerId: number): void {
    this.release(pointerId);
    if (!this.isDown(action)) this.pressedSinceRead.add(action);
    this.held.set(pointerId, action);
  }

  /** O dedo saiu da tela ou deslizou para fora do botão. Dedo que não segurava nada é ignorado. */
  release(pointerId: number): void {
    const action = this.held.get(pointerId);
    if (action === undefined) return;
    this.held.delete(pointerId);
    if (!this.isDown(action)) this.releasedSinceRead.add(action);
  }

  /** Solta tudo (ex.: a tela de jogo fechou com dedos ainda na tela). */
  releaseAll(): void {
    for (const pointerId of [...this.held.keys()]) this.release(pointerId);
  }

  /** Algum dedo segura o botão agora. */
  isDown(action: Action): boolean {
    for (const held of this.held.values()) if (held === action) return true;
    return false;
  }

  /** Foi apertado desde a última consulta. Responde true uma vez só por toque. */
  consumePressed(action: Action): boolean {
    return this.pressedSinceRead.delete(action);
  }

  /** Foi solto desde a última consulta. Responde true uma vez só. */
  consumeReleased(action: Action): boolean {
    return this.releasedSinceRead.delete(action);
  }
}
