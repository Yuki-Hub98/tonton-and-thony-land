import type Phaser from 'phaser';
import { PICKUP_CAR_HEIGHT } from '../config/constants';
import { TextureKeys } from '../config/keys';
import type { LevelObject } from '../logic/levelSchema';
import { Pickup } from './Pickup';

/** Carro (a "estrelinha"): item raro que leva o jogador sozinho até a bandeira. */
export class CarPickup extends Pickup {
  constructor(scene: Phaser.Scene, area: LevelObject) {
    super(scene, area, TextureKeys.Car, PICKUP_CAR_HEIGHT);
  }
}
