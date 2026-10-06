import Phaser from 'phaser';
import { MenuButtons } from '../components/MenuButtons';
import { CHARACTERS, type CharacterId } from '../config/characters';
import { GAME_HEIGHT, SELECT_HEAD_SIZE } from '../config/constants';
import { SceneKeys } from '../config/keys';
import { TextStyles } from '../config/textStyles';
import { TEXTS } from '../config/texts';
import { InputManager } from '../systems/InputManager';
import type { GameSceneData } from './GameScene';

export interface GameOverData {
  characterId: CharacterId;
  /** Fase em que as vidas acabaram ("tentar de novo" recomeça nela). */
  levelIndex: number;
}

/** Fim de jogo: cabeça triste, "tentar de novo" ou "trocar personagem". */
export class GameOverScene extends Phaser.Scene {
  private over!: GameOverData;
  private menu!: MenuButtons;
  private inputManager!: InputManager;
  private leaving = false;

  constructor() {
    super(SceneKeys.GameOver);
  }

  init(data: GameOverData): void {
    this.over = data;
    this.leaving = false;
  }

  create(): void {
    const centerX = this.scale.width / 2;
    const character = CHARACTERS[this.over.characterId];

    this.add.text(centerX, GAME_HEIGHT * 0.13, TEXTS.gameOver, TextStyles.heading).setOrigin(0.5);
    this.add
      .image(centerX, GAME_HEIGHT * 0.42, character.heads.sad)
      .setDisplaySize(SELECT_HEAD_SIZE, SELECT_HEAD_SIZE);
    this.add.text(centerX, GAME_HEIGHT * 0.92, TEXTS.menuHint, TextStyles.hint).setOrigin(0.5);

    this.menu = new MenuButtons(
      this,
      [
        { label: TEXTS.tryAgain, action: () => this.tryAgain() },
        { label: TEXTS.changeCharacter, action: () => this.leave(SceneKeys.Select) },
      ],
      centerX,
      GAME_HEIGHT * 0.74,
    );
    this.inputManager = new InputManager(this);
  }

  update(): void {
    this.menu.update(this.inputManager);
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
