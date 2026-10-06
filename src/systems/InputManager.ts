import Phaser from 'phaser';
import type { VirtualButtons } from '../logic/VirtualButtons';
import type { Action } from '../types';

const { KeyCodes } = Phaser.Input.Keyboard;

/** Teclas de cada ação. Os botões de toque vêm do VirtualButtons (desenhados pela HUD). */
const KEY_BINDINGS: Record<Action, number[]> = {
  left: [KeyCodes.LEFT, KeyCodes.A],
  right: [KeyCodes.RIGHT, KeyCodes.D],
  jump: [KeyCodes.SPACE, KeyCodes.UP, KeyCodes.W],
  attack: [KeyCodes.J, KeyCodes.X],
  // B: a arte da tela de abertura diz "Press [B] to start".
  confirm: [KeyCodes.ENTER, KeyCodes.SPACE, KeyCodes.B],
};

const ACTIONS = Object.keys(KEY_BINDINGS) as Action[];

/**
 * Traduz teclas e botões de toque em ações. As entidades e menus só falam com esta classe,
 * então teclado e toque funcionam igual.
 */
export class InputManager {
  private readonly keys: Record<Action, Phaser.Input.Keyboard.Key[]>;

  /** @param touch botões de toque da fase (os menus usam toque direto nos próprios botões) */
  constructor(
    scene: Phaser.Scene,
    private readonly touch?: VirtualButtons,
  ) {
    const keyboard = scene.input.keyboard;
    const bind = (codes: number[]) => (keyboard ? codes.map((code) => keyboard.addKey(code)) : []);

    this.keys = Object.fromEntries(
      ACTIONS.map((action) => [action, bind(KEY_BINDINGS[action])]),
    ) as Record<Action, Phaser.Input.Keyboard.Key[]>;
  }

  /** A ação está apertada agora. */
  isDown(action: Action): boolean {
    return this.keys[action].some((key) => key.isDown) || (this.touch?.isDown(action) ?? false);
  }

  /** A ação foi apertada neste frame (vale uma vez por toque na tecla). */
  justPressed(action: Action): boolean {
    // Não usar .some() nem ||: eles param no primeiro true e não "consomem" o resto.
    const keyPressed =
      this.keys[action].filter((key) => Phaser.Input.Keyboard.JustDown(key)).length > 0;
    const touchPressed = this.touch?.consumePressed(action) ?? false;
    return keyPressed || touchPressed;
  }

  /** A ação foi solta neste frame. */
  justReleased(action: Action): boolean {
    const keyReleased =
      this.keys[action].filter((key) => Phaser.Input.Keyboard.JustUp(key)).length > 0;
    const touchReleased = this.touch?.consumeReleased(action) ?? false;
    return keyReleased || touchReleased;
  }
}
