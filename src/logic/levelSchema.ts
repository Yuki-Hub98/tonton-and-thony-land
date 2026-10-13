// Validação do JSON exportado pelo Tiled, sem Phaser.
// Transforma o arquivo cru em LevelData (só o que o jogo usa) ou lista todos os problemas.

/** Nomes das camadas que o jogo procura no mapa. */
export const LEVEL_LAYERS = {
  ground: 'ground',
  hazards: 'hazards',
  objects: 'objects',
} as const;

/** Propriedade dos tiles sólidos no tileset. */
export const COLLIDES_PROPERTY = 'collides';

export const LEVEL_OBJECT_TYPES = [
  'player-spawn',
  'enemy',
  'equipment',
  'car',
  'checkpoint',
  'flag',
] as const;
export type LevelObjectType = (typeof LEVEL_OBJECT_TYPES)[number];

/** Objeto da camada `objects`, normalizado: (x, y) é sempre o canto superior esquerdo. */
export interface LevelObject {
  id: number;
  type: LevelObjectType;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface LevelData {
  /** Tamanho do mapa em pixels. */
  widthPx: number;
  heightPx: number;
  /** Onde ficam os pés do jogador ao nascer. */
  spawn: { x: number; y: number };
  flag: LevelObject;
  objects: LevelObject[];
  /** Nome do tileset no Tiled (usado para ligar à textura). */
  tilesetName: string;
}

export class LevelSchemaError extends Error {
  constructor(readonly problems: string[]) {
    super(`Fase inválida:\n- ${problems.join('\n- ')}`);
    this.name = 'LevelSchemaError';
  }
}

type JsonObject = Record<string, unknown>;

const isObject = (value: unknown): value is JsonObject =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

const isLevelObjectType = (value: unknown): value is LevelObjectType =>
  LEVEL_OBJECT_TYPES.includes(value as LevelObjectType);

/** Pés do objeto: centro da base. É onde o jogador nasce. */
export function bottomCenter(object: LevelObject): { x: number; y: number } {
  return { x: object.x + object.width / 2, y: object.y + object.height };
}

/**
 * Valida o JSON do Tiled e devolve os dados da fase.
 * Lança LevelSchemaError com TODOS os problemas encontrados, não só o primeiro.
 */
export function parseLevel(raw: unknown, tileSize: number): LevelData {
  const problems: string[] = [];

  if (!isObject(raw)) {
    throw new LevelSchemaError(['o arquivo não é um objeto JSON do Tiled']);
  }

  checkMap(raw, tileSize, problems);
  const tilesetName = checkTileset(raw, problems);
  const layers = Array.isArray(raw.layers) ? raw.layers.filter(isObject) : [];
  if (!Array.isArray(raw.layers)) problems.push('o mapa não tem a lista "layers"');

  checkGroundLayer(layers, raw, problems);
  checkHazardsLayer(layers, problems);
  const objects = readObjects(layers, problems);

  const spawns = objects.filter((o) => o.type === 'player-spawn');
  const flags = objects.filter((o) => o.type === 'flag');
  if (spawns.length !== 1) {
    problems.push(`precisa de exatamente 1 objeto "player-spawn" (achei ${spawns.length})`);
  }
  if (flags.length !== 1) {
    problems.push(`precisa de exatamente 1 objeto "flag" (achei ${flags.length})`);
  }

  const [spawn] = spawns;
  const [flag] = flags;
  if (problems.length > 0 || !spawn || !flag || tilesetName === undefined) {
    throw new LevelSchemaError(problems);
  }

  return {
    widthPx: (raw.width as number) * tileSize,
    heightPx: (raw.height as number) * tileSize,
    spawn: bottomCenter(spawn),
    flag,
    objects,
    tilesetName,
  };
}

function checkMap(raw: JsonObject, tileSize: number, problems: string[]): void {
  if (raw.orientation !== 'orthogonal') {
    problems.push('a orientação do mapa precisa ser "orthogonal"');
  }
  if (raw.infinite === true) {
    problems.push('o mapa não pode ser infinito (desmarque "Infinite" no Tiled)');
  }
  if (!isNumber(raw.width) || !isNumber(raw.height) || raw.width <= 0 || raw.height <= 0) {
    problems.push('o mapa precisa de "width" e "height" positivos');
  }
  if (raw.tilewidth !== tileSize || raw.tileheight !== tileSize) {
    problems.push(`os tiles precisam ter ${tileSize}×${tileSize} pixels`);
  }
}

function checkTileset(raw: JsonObject, problems: string[]): string | undefined {
  const tilesets = Array.isArray(raw.tilesets) ? raw.tilesets.filter(isObject) : [];
  if (tilesets.length !== 1) {
    problems.push(`o mapa precisa de exatamente 1 tileset (achei ${tilesets.length})`);
    return undefined;
  }

  const [tileset] = tilesets as [JsonObject];
  if (typeof tileset.source === 'string') {
    problems.push(
      'o tileset está em arquivo separado; no Tiled, use "Embed Tileset" para embuti-lo no mapa',
    );
    return undefined;
  }
  if (typeof tileset.name !== 'string' || tileset.name === '') {
    problems.push('o tileset precisa de um nome');
    return undefined;
  }

  const tiles = Array.isArray(tileset.tiles) ? tileset.tiles.filter(isObject) : [];
  const hasSolidTile = tiles.some(
    (tile) =>
      Array.isArray(tile.properties) &&
      tile.properties.some((p) => isObject(p) && p.name === COLLIDES_PROPERTY && p.value === true),
  );
  if (!hasSolidTile) {
    problems.push(`nenhum tile do tileset tem a propriedade "${COLLIDES_PROPERTY}: true"`);
  }

  return tileset.name;
}

function findLayer(layers: JsonObject[], name: string): JsonObject | undefined {
  return layers.find((layer) => layer.name === name);
}

function checkGroundLayer(layers: JsonObject[], raw: JsonObject, problems: string[]): void {
  const ground = findLayer(layers, LEVEL_LAYERS.ground);
  if (!ground) {
    problems.push(`falta a camada de tiles "${LEVEL_LAYERS.ground}"`);
    return;
  }
  if (ground.type !== 'tilelayer') {
    problems.push(`a camada "${LEVEL_LAYERS.ground}" precisa ser de tiles`);
    return;
  }
  checkTileData(ground, raw, problems);
}

function checkHazardsLayer(layers: JsonObject[], problems: string[]): void {
  const hazards = findLayer(layers, LEVEL_LAYERS.hazards);
  if (hazards && hazards.type !== 'tilelayer') {
    problems.push(`a camada "${LEVEL_LAYERS.hazards}" precisa ser de tiles`);
  }
}

function checkTileData(layer: JsonObject, raw: JsonObject, problems: string[]): void {
  const name = String(layer.name);
  if (!Array.isArray(layer.data)) {
    problems.push(
      `a camada "${name}" precisa salvar os tiles como CSV (Map Properties → Tile Layer Format)`,
    );
    return;
  }
  if (isNumber(raw.width) && isNumber(raw.height) && layer.data.length !== raw.width * raw.height) {
    problems.push(
      `a camada "${name}" tem ${layer.data.length} tiles, mas o mapa tem ${raw.width}×${raw.height}`,
    );
  }
}

function readObjects(layers: JsonObject[], problems: string[]): LevelObject[] {
  const layer = findLayer(layers, LEVEL_LAYERS.objects);
  if (!layer) {
    problems.push(`falta a camada de objetos "${LEVEL_LAYERS.objects}"`);
    return [];
  }
  if (layer.type !== 'objectgroup' || !Array.isArray(layer.objects)) {
    problems.push(`a camada "${LEVEL_LAYERS.objects}" precisa ser de objetos`);
    return [];
  }

  const objects: LevelObject[] = [];
  for (const object of layer.objects.filter(isObject)) {
    // O Tiled 1.9 chamou "type" de "class"; aceitamos os dois.
    const type = object.type || object.class;
    const label = `objeto ${String(object.id)}${object.name ? ` ("${String(object.name)}")` : ''}`;

    if (!isLevelObjectType(type)) {
      problems.push(
        `${label} tem tipo "${String(type ?? '')}"; use um destes: ${LEVEL_OBJECT_TYPES.join(', ')}`,
      );
      continue;
    }
    if (!isNumber(object.id) || !isNumber(object.x) || !isNumber(object.y)) {
      problems.push(`${label} precisa de id, x e y numéricos`);
      continue;
    }

    const width = isNumber(object.width) ? object.width : 0;
    const height = isNumber(object.height) ? object.height : 0;
    // Objetos de tile (com "gid") têm o y na base; os demais, no topo.
    const top = 'gid' in object ? object.y - height : object.y;
    objects.push({ id: object.id, type, x: object.x, y: top, width, height });
  }
  return objects;
}
