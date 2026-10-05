import Phaser from 'phaser';
import type { Action } from '../types';

const { KeyCodes } = Phaser.Input.Keyboard;

/** Teclas de cada ação. Os botões de toque entram aqui na Etapa 8. */
const KEY_BINDINGS: Record<Action, number[]> = {
  left: [KeyCodes.LEFT, KeyCodes.A],
  right: [KeyCodes.RIGHT, KeyCodes.D],
  jump: [KeyCodes.SPACE, KeyCodes.UP, KeyCodes.W],
  confirm: [KeyCodes.ENTER, KeyCodes.SPACE],
};

const ACTIONS = Object.keys(KEY_BINDINGS) as Action[];

/** Traduz teclas em ações. As entidades e menus só falam com esta classe. */
export class InputManager {
  private readonly keys: Record<Action, Phaser.Input.Keyboard.Key[]>;

  constructor(scene: Phaser.Scene) {
    const keyboard = scene.input.keyboard;
    const bind = (codes: number[]) => (keyboard ? codes.map((code) => keyboard.addKey(code)) : []);

    this.keys = Object.fromEntries(
      ACTIONS.map((action) => [action, bind(KEY_BINDINGS[action])]),
    ) as Record<Action, Phaser.Input.Keyboard.Key[]>;
  }

  /** A ação está apertada agora. */
  isDown(action: Action): boolean {
    return this.keys[action].some((key) => key.isDown);
  }

  /** A ação foi apertada neste frame (vale uma vez por toque na tecla). */
  justPressed(action: Action): boolean {
    // Não usar .some(): ele para no primeiro true e não "consome" o JustDown das outras teclas.
    return this.keys[action].filter((key) => Phaser.Input.Keyboard.JustDown(key)).length > 0;
  }

  /** A ação foi solta neste frame. */
  justReleased(action: Action): boolean {
    return this.keys[action].filter((key) => Phaser.Input.Keyboard.JustUp(key)).length > 0;
  }
}
