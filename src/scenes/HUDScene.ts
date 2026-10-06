import Phaser from 'phaser';
import { CHARACTERS, type CharacterId } from '../config/characters';
import {
  GAME_WIDTH,
  HUD_EQUIPMENT_ICON_HEIGHT,
  HUD_LIFE_ICON_GAP,
  HUD_LIFE_ICON_SIZE,
  HUD_MARGIN,
} from '../config/constants';
import { EventKeys, SceneKeys } from '../config/keys';

export interface HUDData {
  characterId: CharacterId;
  lives: number;
}

/**
 * Informações por cima da fase (HUD = heads-up display). Roda em paralelo com a GameScene,
 * com câmera própria que não anda, e só conversa com ela por eventos.
 * Cada vida é uma cabecinha do personagem; o equipamento aparece no canto direito quando pego.
 */
export class HUDScene extends Phaser.Scene {
  // "data" já existe em toda Scene do Phaser (DataManager), por isso outro nome.
  private hud!: HUDData;
  private lifeIcons: Phaser.GameObjects.Image[] = [];
  private equipmentIcons: Phaser.GameObjects.Image[] = [];

  constructor() {
    super(SceneKeys.HUD);
  }

  init(data: HUDData): void {
    this.hud = data;
    this.lifeIcons = [];
    this.equipmentIcons = [];
  }

  create(): void {
    this.showLives(this.hud.lives);
    this.createEquipmentIcons();

    this.game.events.on(EventKeys.LivesChanged, this.showLives, this);
    this.game.events.on(EventKeys.PlayerEquipped, this.showEquipment, this);
    // Eventos do game continuam existindo depois que a cena fecha: tirar o ouvinte evita vazamento.
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.game.events.off(EventKeys.LivesChanged, this.showLives, this);
      this.game.events.off(EventKeys.PlayerEquipped, this.showEquipment, this);
    });
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

  /** Um ícone por item do equipamento, da direita para a esquerda. Começam escondidos. */
  private createEquipmentIcons(): void {
    let right = GAME_WIDTH - HUD_MARGIN;
    this.equipmentIcons = CHARACTERS[this.hud.characterId].equipment.textures.map((texture) => {
      const icon = this.add.image(right, HUD_MARGIN, texture).setOrigin(1, 0).setVisible(false);
      icon.setScale(HUD_EQUIPMENT_ICON_HEIGHT / icon.height);
      right -= icon.displayWidth + HUD_LIFE_ICON_GAP;
      return icon;
    });
  }

  private showEquipment(equipped: boolean): void {
    for (const icon of this.equipmentIcons) icon.setVisible(equipped);
  }
}
