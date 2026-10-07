// Formato dos spritesheets dos corpos (ver docs/reference/personagens-e-animacao.md).
// Mesmo formato para os dois personagens; o que muda por personagem fica em characters.ts.
import type { BodyAnimation, ArtPoint } from '../logic/bodyAnimation';

/** Cada quadro do spritesheet, em pixels da imagem (a arte é feita em 4×; ver BODY_SCALE). */
export const BODY_FRAME_WIDTH = 176;
export const BODY_FRAME_HEIGHT = 160;
export const BODY_FRAME_COUNT = 10;

/** Quadros de cada animação: 0 parado, 1–8 caminhada, 9 pulo. */
export const BODY_ANIMATION_FRAMES: Readonly<Record<BodyAnimation, readonly number[]>> = {
  idle: [0],
  walk: [1, 2, 3, 4, 5, 6, 7, 8],
  jump: [9],
};

export const BODY_ANIMATIONS = Object.keys(BODY_ANIMATION_FRAMES) as BodyAnimation[];

/**
 * Quanto o pescoço desce em cada quadro (pixels da imagem). Na caminhada o tronco afunda
 * quando os dois pés tocam o chão; a cabeça acompanha para não parecer que flutua.
 * Mesmos valores nos dois personagens (body-anim.json do Yago).
 */
export const BODY_NECK_DROP_Y: readonly number[] = [0, 0, 3, 5, 3, 0, 3, 5, 3, 0];

/** Pescoço de cada quadro: a pose é meio de lado, então o x fica à direita do meio do quadro. */
export function neckPoints(x: number, dropY: readonly number[] = BODY_NECK_DROP_Y): ArtPoint[] {
  return dropY.map((y) => ({ x, y }));
}

/** Usado se faltar o dado de algum quadro: meio do quadro, no topo. */
export const BODY_NECK_FALLBACK: ArtPoint = { x: BODY_FRAME_WIDTH / 2, y: 0 };

/**
 * Punhos de cada quadro (pixels da imagem), medidos na arte. Os dois personagens usam o mesmo
 * boneco, com diferença de até 4 px, então os pontos servem para os dois.
 * Na pose meio de lado olhando para a direita, a mão mais perto da câmera (desenhada na frente
 * do corpo) fica à esquerda do quadro, e a mais longe (atrás do corpo) fica à direita.
 */
export const BODY_NEAR_HAND: readonly ArtPoint[] = [
  { x: 50, y: 87 },
  { x: 50, y: 87 },
  { x: 42, y: 86 },
  { x: 39, y: 85 },
  { x: 42, y: 86 },
  { x: 50, y: 87 },
  { x: 60, y: 93 },
  { x: 63, y: 94 },
  { x: 60, y: 93 },
  { x: 30, y: 68 },
];

/** No pulo (quadro 9) a mão de trás fica escondida pelo corpo; o ponto é uma estimativa. */
export const BODY_FAR_HAND: readonly ArtPoint[] = [
  { x: 145, y: 84 },
  { x: 145, y: 84 },
  { x: 149, y: 79 },
  { x: 153, y: 77 },
  { x: 149, y: 79 },
  { x: 145, y: 84 },
  { x: 139, y: 85 },
  { x: 137, y: 89 },
  { x: 139, y: 85 },
  { x: 145, y: 78 },
];

/** Usado se faltar o dado de algum quadro: as mãos do quadro parado. */
export const BODY_NEAR_HAND_FALLBACK: ArtPoint = { x: 50, y: 87 };
export const BODY_FAR_HAND_FALLBACK: ArtPoint = { x: 145, y: 84 };

/** Chave da animação no Phaser, por exemplo "body-anthony-walk". */
export function bodyAnimationKey(texture: string, animation: BodyAnimation): string {
  return `${texture}-${animation}`;
}
