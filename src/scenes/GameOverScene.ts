import Phaser from 'phaser';
import { BackgroundSlideshow } from '../components/BackgroundSlideshow';
import { MenuButtons } from '../components/MenuButtons';
import { CHARACTERS, type CharacterId } from '../config/characters';
import {
  GAME_HEIGHT,
  GAME_MAX_WIDTH,
  GAME_OVER_BG_DIM,
  SELECT_HEAD_SIZE,
} from '../config/constants';
import { SceneKeys } from '../config/keys';
import { LEVELS } from '../config/levels';
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
  private background?: BackgroundSlideshow;

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

    // Fundo da fase em que as vidas acabaram, escurecido: clima de "ops" e botões mais legíveis.
    const levelBackground = LEVELS[this.over.levelIndex]?.background;
    this.background = levelBackground
      ? new BackgroundSlideshow(this, [levelBackground])
      : undefined;
    // Largura máxima do jogo: continua cobrindo a tela se ela girar. Depth -1: em cima do fundo
    // (que é negativo) e embaixo dos textos e botões (0).
    this.add
      .rectangle(0, 0, GAME_MAX_WIDTH, GAME_HEIGHT, 0x000000, GAME_OVER_BG_DIM)
      .setOrigin(0)
      .setDepth(-1);

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

  update(_time: number, delta: number): void {
    this.background?.update(delta);
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
