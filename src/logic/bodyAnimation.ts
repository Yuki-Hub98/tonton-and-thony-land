// Qual animação do corpo tocar e onde fica o pescoço, sem Phaser.

export type BodyAnimation = 'idle' | 'walk' | 'jump';

export interface BodyMotion {
  onGround: boolean;
  /** Velocidade horizontal (px/s); o sinal não importa. */
  velocityX: number;
  /** Abaixo desta velocidade conta como parado (evita "andar" com um empurrãozinho). */
  minWalkSpeed: number;
}

/** No ar = pulando; no chão andando = caminhada; senão, parado. */
export function chooseBodyAnimation({
  onGround,
  velocityX,
  minWalkSpeed,
}: BodyMotion): BodyAnimation {
  if (!onGround) return 'jump';
  return Math.abs(velocityX) > minWalkSpeed ? 'walk' : 'idle';
}

/**
 * Ponto de encaixe num quadro (pescoço, mão), em pixels da imagem original:
 * x a partir da borda esquerda do quadro (arte olhando para a direita) e y a partir do topo.
 */
export interface ArtPoint {
  x: number;
  y: number;
}

/** Ponto do quadro; quadro sem dado usa `fallback`, para a cabeça ou o item nunca sumir por um erro. */
export function pointForFrame(
  frame: number,
  points: readonly ArtPoint[],
  fallback: ArtPoint,
): ArtPoint {
  return points[frame] ?? fallback;
}

/**
 * Onde um ponto do quadro (pescoço, mão) fica em relação aos pés do corpo, já na escala da fase.
 * A arte olha para a direita; virado para a esquerda (espelhado), o deslocamento em x inverte.
 */
export function attachmentOffset(
  point: ArtPoint,
  frameWidth: number,
  frameHeight: number,
  scale: number,
  facing: 1 | -1,
): ArtPoint {
  return {
    x: facing * (point.x - frameWidth / 2) * scale,
    y: (point.y - frameHeight) * scale,
  };
}
