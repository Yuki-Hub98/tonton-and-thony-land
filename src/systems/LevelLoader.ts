import type Phaser from 'phaser';
import { TILE_SIZE } from '../config/constants';
import { TextureKeys } from '../config/keys';
import type { LevelDef } from '../config/levels';
import { COLLIDES_PROPERTY, LEVEL_LAYERS, parseLevel, type LevelData } from '../logic/levelSchema';

export interface LoadedLevel {
  data: LevelData;
  /** Camada de chão, já com colisão nos tiles marcados com collides: true. */
  ground: Phaser.Tilemaps.TilemapLayer;
}

/** Monta na cena a fase desenhada no Tiled (o JSON já foi carregado pela PreloadScene). */
export class LevelLoader {
  constructor(private readonly scene: Phaser.Scene) {}

  load(level: LevelDef): LoadedLevel {
    // O cache guarda { format, data }; data é o JSON do Tiled.
    const cached = this.scene.cache.tilemap.get(level.key) as { data?: unknown } | undefined;
    const data = parseLevel(cached?.data, TILE_SIZE);

    const map = this.scene.make.tilemap({ key: level.key });
    // Liga o tileset do Tiled (pelo nome) à textura carregada pelo jogo.
    const tileset = map.addTilesetImage(data.tilesetName, TextureKeys.Tileset);
    if (!tileset) throw new Error(`Não consegui usar o tileset "${data.tilesetName}".`);

    const ground = map.createLayer(LEVEL_LAYERS.ground, tileset);
    if (!ground) throw new Error(`Não consegui criar a camada "${LEVEL_LAYERS.ground}".`);
    ground.setCollisionByProperty({ [COLLIDES_PROPERTY]: true });

    return { data, ground };
  }
}
