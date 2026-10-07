import Phaser from 'phaser';
import { CHARACTER_IDS, CHARACTERS, type CharacterId } from '../config/characters';
import {
  GAME_HEIGHT,
  SELECT_BG_FADE_MS,
  SELECT_BG_HOLD_MS,
  SELECT_CARD_FOCUS_SCALE,
  SELECT_CARD_GAP,
  SELECT_CARD_HEIGHT,
  SELECT_CARD_TWEEN_MS,
  SELECT_CARD_WIDTH,
  SELECT_HEAD_SIZE,
  UI_CARD_COLOR,
  UI_DIM_COLOR,
  UI_HIGHLIGHT_COLOR,
} from '../config/constants';
import { SceneKeys } from '../config/keys';
import { LEVELS } from '../config/levels';
import { TextStyles } from '../config/textStyles';
import { TEXTS } from '../config/texts';
import { BackgroundSlideshow } from '../components/BackgroundSlideshow';
import { HeadController } from '../components/HeadController';
import { moveSelection } from '../logic/menuSelection';
import { InputManager } from '../systems/InputManager';
import { SaveManager } from '../systems/SaveManager';
import type { ContinueData } from './ContinueScene';
import type { GameSceneData } from './GameScene';

interface CharacterCard {
  id: CharacterId;
  container: Phaser.GameObjects.Container;
  frame: Phaser.GameObjects.Rectangle;
  headController: HeadController;
}

/** Escolha de personagem: um cartão por personagem, com a cabeça alternando as fotos. */
export class SelectScene extends Phaser.Scene {
  private cards: CharacterCard[] = [];
  private selectedIndex = 0;
  private inputManager!: InputManager;
  private leaving = false;
  private background!: BackgroundSlideshow;

  constructor() {
    super(SceneKeys.Select);
  }

  create(): void {
    this.cards = [];
    this.leaving = false;
    const centerX = this.scale.width / 2;

    // Os fundos das fases, na ordem das fases, se revezando atrás dos cartões.
    this.background = new BackgroundSlideshow(
      this,
      LEVELS.map((level) => level.background),
      { holdMs: SELECT_BG_HOLD_MS, fadeMs: SELECT_BG_FADE_MS, loop: true },
    );

    this.add
      .text(centerX, GAME_HEIGHT * 0.13, TEXTS.chooseCharacter, TextStyles.heading)
      .setOrigin(0.5);
    this.add.text(centerX, GAME_HEIGHT * 0.92, TEXTS.selectHint, TextStyles.hint).setOrigin(0.5);

    // Cartões centralizados lado a lado, qualquer que seja o número de personagens.
    const step = SELECT_CARD_WIDTH + SELECT_CARD_GAP;
    const firstX = centerX - ((CHARACTER_IDS.length - 1) * step) / 2;
    CHARACTER_IDS.forEach((id, index) => {
      this.cards.push(this.createCard(id, index, firstX + index * step, GAME_HEIGHT * 0.52));
    });

    this.inputManager = new InputManager(this);
    this.select(0);
  }

  update(time: number, delta: number): void {
    this.background.update(delta);
    if (this.inputManager.justPressed('left')) {
      this.select(moveSelection(this.selectedIndex, -1, this.cards.length));
    }
    if (this.inputManager.justPressed('right')) {
      this.select(moveSelection(this.selectedIndex, 1, this.cards.length));
    }
    if (this.inputManager.justPressed('confirm')) this.confirm();

    for (const card of this.cards) card.headController.update(time);
  }

  private createCard(id: CharacterId, index: number, x: number, y: number): CharacterCard {
    const character = CHARACTERS[id];

    const frame = this.add
      .rectangle(0, 0, SELECT_CARD_WIDTH, SELECT_CARD_HEIGHT, UI_CARD_COLOR)
      .setInteractive({ useHandCursor: true });
    const head = this.add.image(0, -SELECT_CARD_HEIGHT * 0.1, character.heads.idle[0] ?? '');
    const name = this.add
      .text(0, SELECT_CARD_HEIGHT * 0.36, character.displayName, TextStyles.cardName)
      .setOrigin(0.5);

    // Container agrupa os três objetos: mover ou escalar o container afeta todos juntos.
    const container = this.add.container(x, y, [frame, head, name]);

    // Mouse em cima seleciona; toque/clique escolhe direto (um toque só, bom para criança).
    frame.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, () => this.select(index));
    frame.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
      this.select(index);
      this.confirm();
    });

    const headController = new HeadController(
      head,
      character.heads,
      this.time.now,
      SELECT_HEAD_SIZE,
    );
    return { id, container, frame, headController };
  }

  private select(index: number): void {
    this.selectedIndex = index;
    this.cards.forEach((card, i) => {
      const selected = i === index;
      card.frame.setStrokeStyle(selected ? 6 : 3, selected ? UI_HIGHLIGHT_COLOR : UI_DIM_COLOR);
      this.tweens.add({
        targets: card.container,
        scale: selected ? SELECT_CARD_FOCUS_SCALE : 1,
        duration: SELECT_CARD_TWEEN_MS,
      });
    });
  }

  private confirm(): void {
    const card = this.cards[this.selectedIndex];
    if (this.leaving || !card) return;
    this.leaving = true;

    // Já jogou antes com este personagem: pergunta se quer continuar de onde parou.
    const savedLevel = SaveManager.fromBrowser(LEVELS.length).continueLevel(card.id);
    if (savedLevel > 0) {
      const data: ContinueData = { characterId: card.id, levelIndex: savedLevel };
      this.scene.start(SceneKeys.Continue, data);
      return;
    }
    const data: GameSceneData = { characterId: card.id };
    this.scene.start(SceneKeys.Game, data);
  }
}
