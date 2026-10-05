import Phaser from 'phaser';
import {
  CHARACTERS,
  DEFAULT_CHARACTER_ID,
  type CharacterDef,
  type CharacterId,
} from '../config/characters';
import {
  BLINK_MS,
  CAMERA_LEAD_RATIO,
  DEATH_DELAY_MS,
  GAME_HEIGHT,
  HAZARD_INSET,
  INVINCIBLE_MS,
  LEVEL_COMPLETE_DELAY_MS,
  STARTING_LIVES,
  STOMP_TOLERANCE,
} from '../config/constants';
import { EventKeys, SceneKeys } from '../config/keys';
import { LEVELS } from '../config/levels';
import { TextStyles } from '../config/textStyles';
import { Checkpoint } from '../entities/Checkpoint';
import { Enemy } from '../entities/Enemy';
import { Flag } from '../entities/Flag';
import { Player } from '../entities/Player';
import { isBlinkVisible } from '../logic/blink';
import { hasFallenOut, isStomp, overlapsWithInset } from '../logic/collisionRules';
import { LivesCounter } from '../logic/LivesCounter';
import { bottomCenter, LevelSchemaError, type LevelData } from '../logic/levelSchema';
import { PlayerStateMachine } from '../logic/PlayerStateMachine';
import { furthestRespawnPoint, type Point } from '../logic/respawnPoint';
import { CameraController } from '../systems/CameraController';
import { InputManager } from '../systems/InputManager';
import { LevelLoader } from '../systems/LevelLoader';
import type { GameOverData } from './GameOverScene';
import type { HUDData } from './HUDScene';
import type { LevelCompleteData } from './LevelCompleteScene';

export interface GameSceneData {
  characterId?: CharacterId;
  /** Índice da fase em LEVELS (padrão: a primeira). */
  levelIndex?: number;
  /** Vidas que sobraram da fase anterior (padrão: STARTING_LIVES). */
  lives?: number;
}

/** A fase em si: monta o mapa do Tiled, o jogador, os inimigos e os perigos. */
export class GameScene extends Phaser.Scene {
  private character!: CharacterDef;
  private levelIndex = 0;
  private level!: LevelData;
  private player?: Player;
  private ground!: Phaser.Tilemaps.TilemapLayer;
  private enemies!: Phaser.Physics.Arcade.Group;
  private inputManager!: InputManager;
  private cameraController!: CameraController;
  private state!: PlayerStateMachine;
  private lives!: LivesCounter;
  private respawnPoint!: Point;

  constructor() {
    super(SceneKeys.Game);
  }

  /** Recebe os dados passados em scene.start(). */
  init(data: GameSceneData): void {
    this.character = CHARACTERS[data.characterId ?? DEFAULT_CHARACTER_ID];
    this.levelIndex = data.levelIndex ?? 0;
    this.lives = new LivesCounter(data.lives ?? STARTING_LIVES);
    this.state = new PlayerStateMachine(INVINCIBLE_MS);
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
    const { data: level, ground, hazards } = loaded;
    this.level = level;
    this.ground = ground;
    this.respawnPoint = level.spawn;

    // Borda de baixo aberta (último false): quem cai no buraco sai do mundo em vez de pisar nela.
    this.physics.world.setBounds(0, 0, level.widthPx, level.heightPx, true, true, true, false);
    // Mostra a parte de baixo do mapa (onde fica o chão) se ele for mais alto que a tela.
    this.cameras.main.scrollY = Math.max(0, level.heightPx - GAME_HEIGHT);

    const flag = new Flag(this, level.flag);
    const checkpoints = level.objects
      .filter((object) => object.type === 'checkpoint')
      .map((object) => new Checkpoint(this, object));

    this.player = new Player(this, level.spawn.x, level.spawn.y, this.character);
    const player = this.player;
    this.physics.add.collider(player, ground);
    this.physics.add.overlap(player, flag, () => this.completeLevel());
    for (const checkpoint of checkpoints) {
      this.physics.add.overlap(player, checkpoint, () => this.reachCheckpoint(checkpoint));
    }

    // Grupo: um collider/overlap vale para todos os inimigos, inclusive os recriados no respawn.
    // runChildUpdate chama Enemy.update() a cada frame.
    this.enemies = this.physics.add.group({ runChildUpdate: true, collideWorldBounds: true });
    this.spawnEnemies();
    this.physics.add.collider(this.enemies, ground);
    this.physics.add.overlap(player, this.enemies, (_player, enemy) =>
      this.touchEnemy(enemy as Enemy),
    );

    if (hazards) {
      // O overlap com uma camada de tiles é chamado para todo tile perto do jogador, até os vazios:
      // o processCallback filtra só os espinhos, e só se encostar na parte de dentro deles.
      this.physics.add.overlap(
        player,
        hazards,
        () => this.hurtPlayer('damage'),
        (_player, tile) => this.touchesHazard(tile as Phaser.Tilemaps.Tile),
      );
    }

    this.inputManager = new InputManager(this);
    this.cameraController = new CameraController(
      this.cameras.main,
      level.widthPx,
      CAMERA_LEAD_RATIO,
    );

    // O HUD é outra cena rodando por cima desta; fecha junto quando a fase acaba.
    const hudData: HUDData = { characterId: this.character.id, lives: this.lives.lives };
    this.scene.launch(SceneKeys.HUD, hudData);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.scene.stop(SceneKeys.HUD));
  }

  /** Roda a cada frame (o "game loop"). */
  update(time: number): void {
    const player = this.player;
    if (!player) return;
    player.updateHead(time);
    if (this.state.state !== 'normal') return;

    player.updateMovement(this.inputManager);
    this.cameraController.update(player);
    player.setBlinkVisible(isBlinkVisible(time, this.state.invincibleUntil, BLINK_MS));

    if (hasFallenOut(player.body.top, this.level.heightPx)) this.hurtPlayer('fall');
  }

  /** Cria os inimigos nos pontos do Tiled (de novo a cada respawn, como no Mario). */
  private spawnEnemies(): void {
    this.enemies.clear(true, true);
    for (const object of this.level.objects.filter((o) => o.type === 'enemy')) {
      const feet = bottomCenter(object);
      this.enemies.add(new Enemy(this, feet.x, feet.y, this.ground));
    }
  }

  private touchEnemy(enemy: Enemy): void {
    const body = this.player?.body;
    if (!body || this.state.state !== 'normal') return;

    const stomped = isStomp({
      playerVelocityY: body.velocity.y,
      playerPrevBottom: body.prev.y + body.height,
      enemyTop: enemy.body.top,
      tolerance: STOMP_TOLERANCE,
    });
    if (stomped) {
      enemy.squash();
      this.player?.bounce();
    } else {
      this.hurtPlayer('damage');
    }
  }

  private touchesHazard(tile: Phaser.Tilemaps.Tile): boolean {
    const body = this.player?.body;
    if (!body || tile.index < 0) return false;
    const tileRect = {
      left: tile.pixelX,
      top: tile.pixelY,
      right: tile.pixelX + tile.width,
      bottom: tile.pixelY + tile.height,
    };
    return overlapsWithInset(body, tileRect, HAZARD_INSET);
  }

  private reachCheckpoint(checkpoint: Checkpoint): void {
    if (this.state.state !== 'normal') return;
    checkpoint.activate();
    this.respawnPoint = furthestRespawnPoint(this.respawnPoint, checkpoint.respawnPoint);
  }

  /** Dano (inimigo, espinho) ou queda. A máquina de estados decide se morre. */
  private hurtPlayer(cause: 'damage' | 'fall'): void {
    const player = this.player;
    if (!player || this.state.state !== 'normal') return;
    if (this.state.send(cause, this.time.now) !== 'dead') return;

    player.die(cause === 'fall', this.time.now);
    this.game.events.emit(EventKeys.LivesChanged, this.lives.loseLife());
    this.time.delayedCall(DEATH_DELAY_MS, () => this.finishDeath());
  }

  private finishDeath(): void {
    const now = this.time.now;
    if (this.lives.isGameOver) {
      this.state.send('gameOver', now);
      const data: GameOverData = { characterId: this.character.id, levelIndex: this.levelIndex };
      this.scene.start(SceneKeys.GameOver, data);
      return;
    }

    this.state.send('respawn', now);
    this.player?.respawnAt(this.respawnPoint, now);
    this.cameraController.snapTo(this.respawnPoint.x);
    this.spawnEnemies();
  }

  private completeLevel(): void {
    if (!this.player || this.state.send('reachFlag', this.time.now) !== 'levelComplete') return;

    // Congela a física: o jogador para na bandeira enquanto a tela troca.
    this.physics.pause();
    this.player.setBlinkVisible(true);
    this.time.delayedCall(LEVEL_COMPLETE_DELAY_MS, () => {
      const data: LevelCompleteData = {
        characterId: this.character.id,
        levelIndex: this.levelIndex,
        lives: this.lives.lives,
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
