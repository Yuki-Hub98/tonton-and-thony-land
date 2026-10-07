import Phaser from 'phaser';
import { BackgroundSlideshow } from '../components/BackgroundSlideshow';
import { BlinkingPrompt } from '../components/BlinkingPrompt';
import { CHARACTERS, type CharacterId } from '../config/characters';
import {
  CELEBRATE_HOP_HEIGHT,
  CELEBRATE_HOP_MS,
  GAME_HEIGHT,
  LEVEL_COMPLETE_BG_FADE_MS,
  LEVEL_COMPLETE_BG_HOLD_MS,
  SELECT_HEAD_SIZE,
} from '../config/constants';
import { SceneKeys } from '../config/keys';
import { LEVELS } from '../config/levels';
import { TextStyles } from '../config/textStyles';
import { TEXTS } from '../config/texts';
import { nextLevelIndex } from '../logic/levelProgress';
import { InputManager } from '../systems/InputManager';
import { SaveManager } from '../systems/SaveManager';
import type { GameSceneData } from './GameScene';
import type { VictoryData } from './VictoryScene';

export interface LevelCompleteData {
  characterId: CharacterId;
  levelIndex: number;
  /** Vidas que sobraram: passam para a próxima fase. */
  lives: number;
}

/**
 * "Fase concluída!" com a cabeça feliz do personagem; continuar leva à próxima fase
 * (ou à vitória, depois da última). O progresso é salvo aqui, logo ao concluir.
 */
export class LevelCompleteScene extends Phaser.Scene {
  private completed!: LevelCompleteData;
  private inputManager!: InputManager;
  private leaving = false;
  private background!: BackgroundSlideshow;

  constructor() {
    super(SceneKeys.LevelComplete);
  }

  init(data: LevelCompleteData): void {
    this.completed = data;
    this.leaving = false;
  }

  create(): void {
    this.saveProgress();
    const centerX = this.scale.width / 2;
    const character = CHARACTERS[this.completed.characterId];
    const levelName = LEVELS[this.completed.levelIndex]?.name ?? '';

    // Fundo da fase que acabou, que depois se transforma no da próxima (uma prévia).
    // Depois da última, fica o fundo dela.
    const next = nextLevelIndex(this.completed.levelIndex, LEVELS.length);
    const backgrounds = [this.completed.levelIndex, next ?? this.completed.levelIndex]
      .map((index) => LEVELS[index]?.background)
      .filter((id) => id !== undefined);
    this.background = new BackgroundSlideshow(this, backgrounds, {
      holdMs: LEVEL_COMPLETE_BG_HOLD_MS,
      fadeMs: LEVEL_COMPLETE_BG_FADE_MS,
      loop: false,
    });

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

  update(_time: number, delta: number): void {
    this.background.update(delta);
    if (this.inputManager.justPressed('confirm')) this.continue();
  }

  private continue(): void {
    if (this.leaving) return;
    this.leaving = true;

    const next = nextLevelIndex(this.completed.levelIndex, LEVELS.length);
    if (next === null) {
      const data: VictoryData = { characterId: this.completed.characterId };
      this.scene.start(SceneKeys.Victory, data);
      return;
    }
    const data: GameSceneData = {
      characterId: this.completed.characterId,
      levelIndex: next,
      lives: this.completed.lives,
    };
    this.scene.start(SceneKeys.Game, data);
  }

  /** Libera a próxima fase para o "Continuar"; depois da última, o jogo foi zerado e recomeça. */
  private saveProgress(): void {
    const save = SaveManager.fromBrowser(LEVELS.length);
    const { characterId, levelIndex } = this.completed;
    const next = nextLevelIndex(levelIndex, LEVELS.length);
    if (next === null) save.clearProgress(characterId);
    else save.recordLevelReached(characterId, next);
  }
}
