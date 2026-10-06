import Phaser from 'phaser';
import { MenuButtons } from '../components/MenuButtons';
import { CHARACTERS, type CharacterId } from '../config/characters';
import { GAME_HEIGHT, SELECT_HEAD_SIZE } from '../config/constants';
import { SceneKeys } from '../config/keys';
import { LEVELS } from '../config/levels';
import { TextStyles } from '../config/textStyles';
import { TEXTS } from '../config/texts';
import { InputManager } from '../systems/InputManager';
import { SaveManager } from '../systems/SaveManager';
import type { GameSceneData } from './GameScene';

export interface ContinueData {
  characterId: CharacterId;
  /** Fase salva de onde dá para continuar (sempre maior que 0). */
  levelIndex: number;
}

/** Depois de escolher o personagem, se ele já tem progresso: continuar ou começar do início. */
export class ContinueScene extends Phaser.Scene {
  private saved!: ContinueData;
  private menu!: MenuButtons;
  private inputManager!: InputManager;
  private leaving = false;

  constructor() {
    super(SceneKeys.Continue);
  }

  init(data: ContinueData): void {
    this.saved = data;
    this.leaving = false;
  }

  create(): void {
    const centerX = this.scale.width / 2;
    const character = CHARACTERS[this.saved.characterId];
    const levelName = LEVELS[this.saved.levelIndex]?.name ?? '';

    this.add
      .text(centerX, GAME_HEIGHT * 0.13, TEXTS.continueQuestion, TextStyles.heading)
      .setOrigin(0.5);
    this.add
      .image(centerX, GAME_HEIGHT * 0.42, character.heads.happy)
      .setDisplaySize(SELECT_HEAD_SIZE, SELECT_HEAD_SIZE);
    this.add.text(centerX, GAME_HEIGHT * 0.92, TEXTS.menuHint, TextStyles.hint).setOrigin(0.5);

    // "Continuar" vem primeiro: é o que a criança quase sempre quer.
    this.menu = new MenuButtons(
      this,
      [
        { label: TEXTS.continueFrom(levelName), action: () => this.play(this.saved.levelIndex) },
        { label: TEXTS.startOver, action: () => this.startOver() },
      ],
      centerX,
      GAME_HEIGHT * 0.74,
    );
    this.inputManager = new InputManager(this);
  }

  update(): void {
    this.menu.update(this.inputManager);
  }

  private startOver(): void {
    SaveManager.fromBrowser(LEVELS.length).clearProgress(this.saved.characterId);
    this.play(0);
  }

  private play(levelIndex: number): void {
    if (this.leaving) return;
    this.leaving = true;
    const data: GameSceneData = { characterId: this.saved.characterId, levelIndex };
    this.scene.start(SceneKeys.Game, data);
  }
}
