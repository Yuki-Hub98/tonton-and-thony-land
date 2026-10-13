import Phaser from 'phaser';
import {
  MENU_BUTTON_GAP,
  MENU_BUTTON_HEIGHT,
  MENU_BUTTON_WIDTH,
  UI_CARD_COLOR,
  UI_DIM_COLOR,
  UI_HIGHLIGHT_COLOR,
} from '../config/constants';
import { TextStyles } from '../config/textStyles';
import { moveSelection } from '../logic/menuSelection';
import type { InputManager } from '../systems/InputManager';

export interface MenuOption {
  label: string;
  action: () => void;
}

/**
 * Fileira de botões de menu centralizada. Funciona com teclado (← → escolhe, Espaço/Enter
 * confirma) e com toque/clique direto no botão (um toque só, bom para criança).
 */
export class MenuButtons {
  private readonly buttons: Phaser.GameObjects.Rectangle[];
  private selectedIndex = 0;

  constructor(
    scene: Phaser.Scene,
    private readonly options: readonly MenuOption[],
    centerX: number,
    y: number,
  ) {
    const step = MENU_BUTTON_WIDTH + MENU_BUTTON_GAP;
    const firstX = centerX - ((options.length - 1) * step) / 2;
    this.buttons = options.map((option, index) => {
      const x = firstX + index * step;
      const button = scene.add
        .rectangle(x, y, MENU_BUTTON_WIDTH, MENU_BUTTON_HEIGHT, UI_CARD_COLOR)
        .setInteractive({ useHandCursor: true });
      scene.add.text(x, y, option.label, TextStyles.cardName).setOrigin(0.5);

      button.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, () => this.select(index));
      button.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => option.action());
      return button;
    });
    this.select(0);
  }

  /** Chamar a cada frame: lê as setas e a confirmação. */
  update(input: InputManager): void {
    if (input.justPressed('left')) {
      this.select(moveSelection(this.selectedIndex, -1, this.options.length));
    }
    if (input.justPressed('right')) {
      this.select(moveSelection(this.selectedIndex, 1, this.options.length));
    }
    if (input.justPressed('confirm')) this.options[this.selectedIndex]?.action();
  }

  private select(index: number): void {
    this.selectedIndex = index;
    this.buttons.forEach((button, i) => {
      const selected = i === index;
      button.setStrokeStyle(selected ? 6 : 3, selected ? UI_HIGHLIGHT_COLOR : UI_DIM_COLOR);
    });
  }
}
