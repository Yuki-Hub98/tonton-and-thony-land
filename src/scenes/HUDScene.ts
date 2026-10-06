import Phaser from 'phaser';
import { CHARACTERS, type CharacterId } from '../config/characters';
import {
  HUD_EQUIPMENT_ICON_HEIGHT,
  HUD_LIFE_ICON_GAP,
  HUD_LIFE_ICON_SIZE,
  HUD_MARGIN,
  TOUCH_BUTTON_ALPHA,
  TOUCH_BUTTON_DISABLED_ALPHA,
  TOUCH_BUTTON_GAP,
  TOUCH_BUTTON_MARGIN,
  TOUCH_BUTTON_PRESSED_ALPHA,
  TOUCH_BUTTON_SIZE,
} from '../config/constants';
import { EventKeys, SceneKeys } from '../config/keys';
import { touchButtonLayout, type TouchAction } from '../logic/touchLayout';
import type { VirtualButtons } from '../logic/VirtualButtons';

export interface HUDData {
  characterId: CharacterId;
  lives: number;
  /** Botões de toque compartilhados com a GameScene (ela lê, a HUD desenha e aperta). */
  touch: VirtualButtons;
}

interface TouchButton {
  action: TouchAction;
  container: Phaser.GameObjects.Container;
}

/**
 * Informações por cima da fase (HUD = heads-up display). Roda em paralelo com a GameScene,
 * com câmera própria que não anda, e só conversa com ela por eventos.
 * - Cada vida é uma cabecinha do personagem.
 * - O equipamento aparece no canto direito quando pego.
 * - Em aparelho com toque, desenha os botões: andar, pular e bater.
 */
export class HUDScene extends Phaser.Scene {
  // "data" já existe em toda Scene do Phaser (DataManager), por isso outro nome.
  private hud!: HUDData;
  private lifeIcons: Phaser.GameObjects.Image[] = [];
  private equipmentIcons: Phaser.GameObjects.Image[] = [];
  private touchButtons: TouchButton[] = [];
  private equipped = false;

  constructor() {
    super(SceneKeys.HUD);
  }

  init(data: HUDData): void {
    this.hud = data;
    this.lifeIcons = [];
    this.equipmentIcons = [];
    this.touchButtons = [];
    this.equipped = false;
  }

  create(): void {
    this.showLives(this.hud.lives);
    this.createEquipmentIcons();
    // Só aparelhos com tela de toque ganham os botões; no computador o teclado basta.
    if (this.sys.game.device.input.touch) this.createTouchButtons();
    this.layout();

    this.game.events.on(EventKeys.LivesChanged, this.showLives, this);
    this.game.events.on(EventKeys.PlayerEquipped, this.showEquipment, this);
    this.scale.on(Phaser.Scale.Events.RESIZE, this.layout, this);
    // Eventos do game continuam existindo depois que a cena fecha: tirar o ouvinte evita vazamento.
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.game.events.off(EventKeys.LivesChanged, this.showLives, this);
      this.game.events.off(EventKeys.PlayerEquipped, this.showEquipment, this);
      this.scale.off(Phaser.Scale.Events.RESIZE, this.layout, this);
      this.hud.touch.releaseAll();
    });
  }

  /** O botão fica mais forte enquanto apertado; o "bater" fica apagadinho sem equipamento. */
  update(): void {
    for (const { action, container } of this.touchButtons) {
      if (action === 'attack' && !this.equipped) {
        container.setAlpha(TOUCH_BUTTON_DISABLED_ALPHA);
      } else {
        const pressed = this.hud.touch.isDown(action);
        container.setAlpha(pressed ? TOUCH_BUTTON_PRESSED_ALPHA : TOUCH_BUTTON_ALPHA);
      }
    }
  }

  private showLives(lives: number): void {
    for (const icon of this.lifeIcons) icon.destroy();

    const texture = CHARACTERS[this.hud.characterId].heads.idle[0] ?? '';
    this.lifeIcons = Array.from({ length: lives }, (_, i) =>
      this.add
        .image(HUD_MARGIN + i * (HUD_LIFE_ICON_SIZE + HUD_LIFE_ICON_GAP), HUD_MARGIN, texture)
        .setOrigin(0)
        .setDisplaySize(HUD_LIFE_ICON_SIZE, HUD_LIFE_ICON_SIZE),
    );
  }

  /** Um ícone por item do equipamento, no canto direito. Começam escondidos. */
  private createEquipmentIcons(): void {
    this.equipmentIcons = CHARACTERS[this.hud.characterId].equipment.textures.map((texture) => {
      const icon = this.add.image(0, HUD_MARGIN, texture).setOrigin(1, 0).setVisible(false);
      icon.setScale(HUD_EQUIPMENT_ICON_HEIGHT / icon.height);
      return icon;
    });
  }

  private showEquipment(equipped: boolean): void {
    this.equipped = equipped;
    for (const icon of this.equipmentIcons) icon.setVisible(equipped);
  }

  private createTouchButtons(): void {
    const radius = TOUCH_BUTTON_SIZE / 2;
    const actions: TouchAction[] = ['left', 'right', 'jump', 'attack'];

    this.touchButtons = actions.map((action) => {
      const circle = this.add.circle(0, 0, radius, 0xffffff).setStrokeStyle(4, 0x000000);
      const container = this.add.container(0, 0, [circle, this.createTouchIcon(action, radius)]);

      // A área de toque é o círculo. Cada dedo é um "pointer" com id próprio.
      circle.setInteractive(
        new Phaser.Geom.Circle(radius, radius, radius),
        Phaser.Geom.Circle.Contains,
      );
      const press = (pointer: Phaser.Input.Pointer) => this.hud.touch.press(action, pointer.id);
      const release = (pointer: Phaser.Input.Pointer) => this.hud.touch.release(pointer.id);
      circle.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, press);
      // Dedo que desliza de um botão para outro troca de botão sem precisar levantar.
      circle.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, (pointer: Phaser.Input.Pointer) => {
        if (pointer.isDown) press(pointer);
      });
      circle.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, release);
      return { action, container };
    });

    // Levantou o dedo em qualquer lugar da tela: solta o botão que ele segurava.
    this.input.on(Phaser.Input.Events.POINTER_UP, (pointer: Phaser.Input.Pointer) =>
      this.hud.touch.release(pointer.id),
    );
  }

  /** Desenho dentro do botão: setas para andar e pular; o item do personagem para bater. */
  private createTouchIcon(action: TouchAction, radius: number): Phaser.GameObjects.GameObject {
    // Pontos dentro de uma caixa de 0 a s; o triângulo é centralizado no botão pela origem 0.5.
    const s = radius;
    switch (action) {
      case 'left':
        return this.add.triangle(0, 0, s, 0, s, s, 0, s / 2, 0x000000);
      case 'right':
        return this.add.triangle(0, 0, 0, 0, 0, s, s, s / 2, 0x000000);
      case 'jump':
        return this.add.triangle(0, 0, 0, s, s, s, s / 2, 0, 0x000000);
      case 'attack': {
        const [texture] = CHARACTERS[this.hud.characterId].equipment.textures;
        const icon = this.add.image(0, 0, texture ?? '');
        icon.setScale((radius * 1.3) / icon.height);
        return icon;
      }
    }
  }

  /** Posiciona o que depende da largura da tela (ela muda ao girar o celular). */
  private layout(): void {
    let right = this.scale.width - HUD_MARGIN;
    for (const icon of this.equipmentIcons) {
      icon.setX(right);
      right -= icon.displayWidth + HUD_LIFE_ICON_GAP;
    }

    const placements = touchButtonLayout(
      this.scale.width,
      this.scale.height,
      TOUCH_BUTTON_SIZE,
      TOUCH_BUTTON_MARGIN,
      TOUCH_BUTTON_GAP,
    );
    for (const { action, x, y } of placements) {
      this.touchButtons.find((button) => button.action === action)?.container.setPosition(x, y);
    }
  }
}
