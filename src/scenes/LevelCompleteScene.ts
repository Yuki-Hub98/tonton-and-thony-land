import Phaser from 'phaser';
import { BlinkingPrompt } from '../components/BlinkingPrompt';
import { CHARACTERS, type CharacterId } from '../config/characters';
import {
  CELEBRATE_HOP_HEIGHT,
  CELEBRATE_HOP_MS,
  GAME_HEIGHT,
  GAME_WIDTH,
  SELECT_HEAD_SIZE,
} from '../config/constants';
import { SceneKeys } from '../config/keys';
import { LEVELS } from '../config/levels';
import { TextStyles } from '../config/textStyles';
import { TEXTS } from '../config/texts';
import { nextLevelIndex } from '../logic/levelProgress';
import { InputManager } from '../systems/InputManager';
import type { GameSceneData } from './GameScene';

export interface LevelCompleteData {
  characterId: CharacterId;
  levelIndex: number;
  /** Vidas que sobraram: passam para a próxima fase. */
  lives: number;
}

/** "Fase concluída!" com a cabeça feliz do personagem; continuar leva à próxima fase. */
export class LevelCompleteScene extends Phaser.Scene {
  private completed!: LevelCompleteData;
  private inputManager!: InputManager;
  private leaving = false;

  constructor() {
    super(SceneKeys.LevelComplete);
  }

  init(data: LevelCompleteData): void {
    this.completed = data;
    this.leaving = false;
  }

  create(): void {
    const centerX = GAME_WIDTH / 2;
    const character = CHARACTERS[this.completed.characterId];
    const levelName = LEVELS[this.completed.levelIndex]?.name ?? '';

    this.add
      .text(centerX, GAME_HEIGHT * 0.15, TEXTS.levelComplete(levelName), TextStyles.heading)
      .setOrigin(0.5);

    const head = this.add
      .image(centerX, GAME_HEIGHT * 0.48, character.heads.happy)
      .setDisplaySize(SELECT_HEAD_SIZE, SELECT_HEAD_SIZE);
    // Pulinho de comemoração.
    this.tweens.add({
      targets: head,
      y: head.y - CELEBRATE_HOP_HEIGHT,
      duration: CELEBRATE_HOP_MS,
      yoyo: true,
      repeat: -1,
      ease: Phaser.Math.Easing.Quadratic.Out,
    });

    new BlinkingPrompt(this, centerX, GAME_HEIGHT * 0.82, TEXTS.pressContinue);

    this.inputManager = new InputManager(this);
    this.input.once(Phaser.Input.Events.POINTER_DOWN, () => this.continue());
  }

  update(): void {
    if (this.inputManager.justPressed('confirm')) this.continue();
  }

  private continue(): void {
    if (this.leaving) return;
    this.leaving = true;

    const next = nextLevelIndex(this.completed.levelIndex, LEVELS.length);
    if (next === null) {
      // Última fase: a tela de vitória entra na Etapa 9; por enquanto volta ao título.
      this.scene.start(SceneKeys.Title);
      return;
    }
    const data: GameSceneData = {
      characterId: this.completed.characterId,
      levelIndex: next,
      lives: this.completed.lives,
    };
    this.scene.start(SceneKeys.Game, data);
  }
}
