import Phaser from 'phaser';
import { CHARACTERS, type CharacterId } from '../config/characters';
import {
  GAME_HEIGHT,
  GAME_WIDTH,
  MENU_BUTTON_GAP,
  MENU_BUTTON_HEIGHT,
  MENU_BUTTON_WIDTH,
  SELECT_HEAD_SIZE,
  UI_CARD_COLOR,
  UI_DIM_COLOR,
  UI_HIGHLIGHT_COLOR,
} from '../config/constants';
import { SceneKeys } from '../config/keys';
import { TextStyles } from '../config/textStyles';
import { TEXTS } from '../config/texts';
import { moveSelection } from '../logic/menuSelection';
import { InputManager } from '../systems/InputManager';
import type { GameSceneData } from './GameScene';

export interface GameOverData {
  characterId: CharacterId;
  /** Fase em que as vidas acabaram ("tentar de novo" recomeça nela). */
  levelIndex: number;
}

interface MenuOption {
  label: string;
  action: () => void;
}

/** Fim de jogo: cabeça triste, "tentar de novo" ou "trocar personagem". */
export class GameOverScene extends Phaser.Scene {
  private over!: GameOverData;
  private buttons: Phaser.GameObjects.Rectangle[] = [];
  private options: MenuOption[] = [];
  private selectedIndex = 0;
  private inputManager!: InputManager;
  private leaving = false;

  constructor() {
    super(SceneKeys.GameOver);
  }

  init(data: GameOverData): void {
    this.over = data;
    this.buttons = [];
    this.selectedIndex = 0;
    this.leaving = false;
  }

  create(): void {
    const centerX = GAME_WIDTH / 2;
    const character = CHARACTERS[this.over.characterId];

    this.add.text(centerX, GAME_HEIGHT * 0.13, TEXTS.gameOver, TextStyles.heading).setOrigin(0.5);
    this.add
      .image(centerX, GAME_HEIGHT * 0.42, character.heads.sad)
      .setDisplaySize(SELECT_HEAD_SIZE, SELECT_HEAD_SIZE);
    this.add.text(centerX, GAME_HEIGHT * 0.92, TEXTS.menuHint, TextStyles.hint).setOrigin(0.5);

    this.options = [
      { label: TEXTS.tryAgain, action: () => this.tryAgain() },
      { label: TEXTS.changeCharacter, action: () => this.leave(SceneKeys.Select) },
    ];
    const step = MENU_BUTTON_WIDTH + MENU_BUTTON_GAP;
    const firstX = centerX - ((this.options.length - 1) * step) / 2;
    this.options.forEach((option, index) => {
      this.buttons.push(
        this.createButton(option, index, firstX + index * step, GAME_HEIGHT * 0.74),
      );
    });

    this.inputManager = new InputManager(this);
    this.select(0);
  }

  update(): void {
    if (this.inputManager.justPressed('left')) {
      this.select(moveSelection(this.selectedIndex, -1, this.options.length));
    }
    if (this.inputManager.justPressed('right')) {
      this.select(moveSelection(this.selectedIndex, 1, this.options.length));
    }
    if (this.inputManager.justPressed('confirm')) this.options[this.selectedIndex]?.action();
  }

  private createButton(
    option: MenuOption,
    index: number,
    x: number,
    y: number,
  ): Phaser.GameObjects.Rectangle {
    const button = this.add
      .rectangle(x, y, MENU_BUTTON_WIDTH, MENU_BUTTON_HEIGHT, UI_CARD_COLOR)
      .setInteractive({ useHandCursor: true });
    this.add.text(x, y, option.label, TextStyles.cardName).setOrigin(0.5);

    button.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, () => this.select(index));
    button.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => option.action());
    return button;
  }

  private select(index: number): void {
    this.selectedIndex = index;
    this.buttons.forEach((button, i) => {
      const selected = i === index;
      button.setStrokeStyle(selected ? 6 : 3, selected ? UI_HIGHLIGHT_COLOR : UI_DIM_COLOR);
    });
  }

  /** Recomeça a fase em que parou, com as vidas cheias. */
  private tryAgain(): void {
    const data: GameSceneData = {
      characterId: this.over.characterId,
      levelIndex: this.over.levelIndex,
    };
    this.leave(SceneKeys.Game, data);
  }

  private leave(sceneKey: string, data?: object): void {
    if (this.leaving) return;
    this.leaving = true;
    this.scene.start(sceneKey, data);
  }
}
