import type Phaser from 'phaser';
import type { CharacterDef } from '../config/characters';
import { PICKUP_EQUIPMENT_HEIGHT } from '../config/constants';
import type { LevelObject } from '../logic/levelSchema';
import { Pickup } from './Pickup';

/** Equipamento da fase: aparece com a cara do item principal do personagem (ex.: a vassoura). */
export class EquipmentPickup extends Pickup {
  constructor(scene: Phaser.Scene, area: LevelObject, character: CharacterDef) {
    const [texture] = character.equipment.textures;
    if (texture === undefined) {
      throw new Error(`${character.displayName} precisa de pelo menos uma textura de equipamento.`);
    }
    super(scene, area, texture, PICKUP_EQUIPMENT_HEIGHT);
  }
}
