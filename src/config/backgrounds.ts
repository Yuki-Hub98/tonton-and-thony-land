// Fundos em camadas (parallax) das fases. Dados, não código: para mudar a velocidade
// de uma camada ou a posição do sol, mexa só aqui.
//
// As imagens têm BACKGROUND_TEXTURE_HEIGHT de altura e emendam nas bordas, então repetem
// na horizontal sem costura. Para gerar de novo: docs/tools/gerar_fundos.py.

export type BackgroundId = 'meadow' | 'forest' | 'night';

export const BACKGROUND_IDS: readonly BackgroundId[] = ['meadow', 'forest', 'night'];

/** Camadas, da mais distante para a mais próxima (é a ordem de desenho). */
export const BACKGROUND_LAYERS = ['sky', 'clouds', 'hills', 'front'] as const;
export type BackgroundLayerName = (typeof BACKGROUND_LAYERS)[number];

export interface BackgroundLayerDef {
  name: BackgroundLayerName;
  /** Nome do arquivo dentro da pasta do fundo. */
  file: string;
  /** 0 = parada na tela, 1 = anda junto com a fase. Quanto mais longe, menor. */
  scrollFactor: number;
  /** Quanto a camada anda sozinha, em pixels da tela por milissegundo (nuvens). */
  windSpeed: number;
}

export interface CelestialDef {
  /** Nome do arquivo dentro da pasta do fundo (sol ou lua). */
  file: string;
  /** Posição do centro, em fração da tela (0 a 1). */
  x: number;
  y: number;
}

export interface BackgroundDef {
  id: BackgroundId;
  /** Pasta em public/assets/bg/. */
  folder: string;
  layers: readonly BackgroundLayerDef[];
  /** Sol ou lua: fica parado na tela, entre o céu e as nuvens. */
  celestial: CelestialDef;
}

/** Mesmas camadas e velocidades nas três fases; muda só a arte. */
const LAYERS: readonly BackgroundLayerDef[] = [
  { name: 'sky', file: 'ceu.png', scrollFactor: 0, windSpeed: 0 },
  { name: 'clouds', file: 'nuvens.png', scrollFactor: 0.08, windSpeed: 0.02 },
  { name: 'hills', file: 'colinas.png', scrollFactor: 0.25, windSpeed: 0 },
  { name: 'front', file: 'frente.png', scrollFactor: 0.55, windSpeed: 0 },
];

export const BACKGROUNDS: Record<BackgroundId, BackgroundDef> = {
  // Fase 1: campo florido de dia.
  meadow: {
    id: 'meadow',
    folder: 'fase1',
    layers: LAYERS,
    celestial: { file: 'sol.png', x: 0.74, y: 0.19 },
  },
  // Fase 2: floresta ao entardecer (sol baixo, atrás das árvores).
  forest: {
    id: 'forest',
    folder: 'fase2',
    layers: LAYERS,
    celestial: { file: 'sol.png', x: 0.69, y: 0.52 },
  },
  // Fase 3: noite com cogumelos e vaga-lumes.
  night: {
    id: 'night',
    folder: 'fase3',
    layers: LAYERS,
    celestial: { file: 'lua.png', x: 0.75, y: 0.18 },
  },
};

/** Chave de textura de uma camada, ex.: "bg-meadow-clouds". */
export function backgroundLayerKey(id: BackgroundId, layer: BackgroundLayerName): string {
  return `bg-${id}-${layer}`;
}

/** Chave de textura do sol/lua, ex.: "bg-night-celestial". */
export function celestialKey(id: BackgroundId): string {
  return `bg-${id}-celestial`;
}

/** Caminho relativo a public/, sem barra no início, para respeitar o base do Vite. */
export function backgroundAssetPath(id: BackgroundId, file: string): string {
  return `assets/bg/${BACKGROUNDS[id].folder}/${file}`;
}

export interface BackgroundAsset {
  key: string;
  path: string;
}

/**
 * Todas as imagens de fundo, para a PreloadScene carregar.
 * Sem placeholder: camada que faltar simplesmente não aparece (fica a cor de fundo do jogo).
 */
export const BACKGROUND_ASSETS: readonly BackgroundAsset[] = BACKGROUND_IDS.flatMap((id) => {
  const { layers, celestial } = BACKGROUNDS[id];
  return [
    ...layers.map((layer) => ({
      key: backgroundLayerKey(id, layer.name),
      path: backgroundAssetPath(id, layer.file),
    })),
    { key: celestialKey(id), path: backgroundAssetPath(id, celestial.file) },
  ];
});
