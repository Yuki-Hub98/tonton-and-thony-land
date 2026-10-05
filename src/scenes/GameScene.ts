import Phaser from 'phaser';
import {
  CHARACTERS,
  DEFAULT_CHARACTER_ID,
  type CharacterDef,
  type CharacterId,
} from '../config/characters';
import { CAMERA_LEAD_RATIO, GAME_HEIGHT, LEVEL_COMPLETE_DELAY_MS } from '../config/constants';
import { SceneKeys } from '../config/keys';
import { LEVELS } from '../config/levels';
import { TextStyles } from '../config/textStyles';
import { Flag } from '../entities/Flag';
import { Player } from '../entities/Player';
import { LevelSchemaError } from '../logic/levelSchema';
import { CameraController } from '../systems/CameraController';
import { InputManager } from '../systems/InputManager';
import { LevelLoader } from '../systems/LevelLoader';
import type { LevelCompleteData } from './LevelCompleteScene';

export interface GameSceneData {
  characterId?: CharacterId;
  /** Índice da fase em LEVELS (padrão: a primeira). */
  levelIndex?: number;
}

/** A fase em si: monta o mapa do Tiled, o jogador e a bandeira. */
export class GameScene extends Phaser.Scene {
  private character!: CharacterDef;
  private levelIndex = 0;
  private player?: Player;
  private inputManager!: InputManager;
  private cameraController!: CameraController;
  private completed = false;

  constructor() {
    super(SceneKeys.Game);
  }

  /** Recebe os dados passados em scene.start(). */
  init(data: GameSceneData): void {
    this.character = CHARACTERS[data.characterId ?? DEFAULT_CHARACTER_ID];
    this.levelIndex = data.levelIndex ?? 0;
    this.completed = false;
    this.player = undefined;
  }

  create(): void {
    const levelDef = LEVELS[this.levelIndex];
    if (!levelDef) throw new Error(`Fase ${this.levelIndex} não existe em LEVELS.`);

    let loaded;
    try {
      loaded = new LevelLoader(this).load(levelDef);
    } catch (error) {
      this.showLevelError(error);
      return;
    }
    const { data: level, ground } = loaded;

    this.physics.world.setBounds(0, 0, level.widthPx, level.heightPx);
    // Mostra a parte de baixo do mapa (onde fica o chão) se ele for mais alto que a tela.
    this.cameras.main.scrollY = Math.max(0, level.heightPx - GAME_HEIGHT);

    const flag = new Flag(this, level.flag);
    this.player = new Player(this, level.spawn.x, level.spawn.y, this.character);
    this.physics.add.collider(this.player, ground);
    this.physics.add.overlap(this.player, flag, () => this.completeLevel());

    this.inputManager = new InputManager(this);
    this.cameraController = new CameraController(
      this.cameras.main,
      level.widthPx,
      CAMERA_LEAD_RATIO,
    );
  }

  /** Roda a cada frame (o "game loop"). */
  update(time: number): void {
    if (!this.player) return;
    this.player.updateHead(time);
    if (this.completed) return;

    this.player.updateMovement(this.inputManager);
    this.cameraController.update(this.player);
  }

  private completeLevel(): void {
    if (this.completed || !this.player) return;
    this.completed = true;

    // Congela a física: o jogador para na bandeira enquanto a tela troca.
    this.physics.pause();
    this.time.delayedCall(LEVEL_COMPLETE_DELAY_MS, () => {
      const data: LevelCompleteData = {
        characterId: this.character.id,
        levelIndex: this.levelIndex,
      };
      this.scene.start(SceneKeys.LevelComplete, data);
    });
  }

  /** Fase com erro (ex.: JSON do Tiled inválido): mostra o motivo na tela em vez de tela preta. */
  private showLevelError(error: unknown): void {
    console.error(error);
    const message =
      error instanceof LevelSchemaError
        ? `Fase inválida:\n- ${error.problems.join('\n- ')}`
        : String(error);
    this.add
      .text(16, 16, message, { ...TextStyles.hint, color: '#ff004d', wordWrap: { width: 920 } })
      .setScrollFactor(0);
  }
}
