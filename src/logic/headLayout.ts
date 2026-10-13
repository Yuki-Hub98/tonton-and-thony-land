// Tamanho, âncora e recortes das fotos de cabeça, sem Phaser.
// Há dois formatos de foto: a quadrada (só a cabeça, cortada no queixo) e a com cabelo
// comprido (a cabeça mais o cabelo caindo abaixo do queixo, sem esticar).

/**
 * Formato das fotos de um personagem.
 * - square: foto quadrada; o queixo é a borda de baixo.
 * - withHair: foto mais alta que larga; o cabelo continua abaixo do queixo.
 *   As medidas são em pixels da imagem e valem para todas as fotos do personagem
 *   (elas são alinhadas pelos olhos, então o rosto fica sempre no mesmo lugar).
 */
export type HeadPhoto =
  | { shape: 'square' }
  | {
      shape: 'withHair';
      /** Do topo da cabeça até o queixo: é essa parte que fica do tamanho da cabeça na tela. */
      headHeight: number;
      /** Altura do queixo, a partir do topo da imagem: o ponto que encaixa no pescoço. */
      chinY: number;
    };

export interface TextureSize {
  width: number;
  height: number;
}

/** Escala em cada eixo e ponto de origem (fração da imagem, 0 a 1). */
export interface HeadLayout {
  scaleX: number;
  scaleY: number;
  originX: number;
  originY: number;
}

/** Retângulo em pixels da imagem. */
export interface Region {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Se a imagem não comporta as medidas (ex.: o placeholder de 64×64 no lugar da foto que
 * ainda não existe), trata como quadrada para não desenhar a cabeça fora do lugar.
 */
function fitsTexture(photo: HeadPhoto, texture: TextureSize): boolean {
  return (
    photo.shape === 'withHair' &&
    photo.chinY <= texture.height &&
    photo.headHeight > 0 &&
    photo.headHeight <= texture.height
  );
}

/**
 * Cabeça na fase: origem no queixo e rosto com `faceSize` de altura.
 * A quadrada vira um quadrado de faceSize (como sempre foi); a com cabelo mantém a proporção
 * e o cabelo pende abaixo do queixo.
 */
export function headLayout(photo: HeadPhoto, faceSize: number, texture: TextureSize): HeadLayout {
  if (photo.shape === 'withHair' && fitsTexture(photo, texture)) {
    const scale = faceSize / photo.headHeight;
    return { scaleX: scale, scaleY: scale, originX: 0.5, originY: photo.chinY / texture.height };
  }
  return {
    scaleX: faceSize / texture.width,
    scaleY: faceSize / texture.height,
    originX: 0.5,
    originY: 1,
  };
}

/**
 * Cabeça nas telas de menu: origem no centro, a foto inteira cabendo em `maxHeight`.
 * A quadrada continua com faceSize; a com cabelo usa o mesmo rosto de faceSize se couber,
 * senão diminui até a foto inteira (com o cabelo) caber na altura.
 */
export function headLayoutInBox(
  photo: HeadPhoto,
  faceSize: number,
  maxHeight: number,
  texture: TextureSize,
): HeadLayout {
  if (photo.shape === 'withHair' && fitsTexture(photo, texture)) {
    const scale = Math.min(faceSize / photo.headHeight, maxHeight / texture.height);
    return { scaleX: scale, scaleY: scale, originX: 0.5, originY: 0.5 };
  }
  return {
    scaleX: faceSize / texture.width,
    scaleY: faceSize / texture.height,
    originX: 0.5,
    originY: 0.5,
  };
}

/**
 * Parte da foto que aparece quando só cabe `maxBelowChin` pixels de tela abaixo do queixo
 * (ex.: dentro do carro, o cabelo não pode passar das rodas). A quadrada não tem nada abaixo
 * do queixo, então aparece inteira.
 */
export function headCropBelowChin(
  photo: HeadPhoto,
  texture: TextureSize,
  scaleY: number,
  maxBelowChin: number,
): Region {
  const full = { x: 0, y: 0, width: texture.width, height: texture.height };
  if (photo.shape !== 'withHair' || !fitsTexture(photo, texture) || scaleY <= 0) return full;
  const height = Math.min(texture.height, photo.chinY + Math.max(0, maxBelowChin) / scaleY);
  return { ...full, height };
}

/** Só o rosto (do topo até o queixo), para ícones pequenos como as vidas do HUD. */
export function headFaceRegion(photo: HeadPhoto, texture: TextureSize): Region {
  if (photo.shape === 'withHair' && fitsTexture(photo, texture)) {
    return {
      x: 0,
      y: photo.chinY - photo.headHeight,
      width: texture.width,
      height: photo.headHeight,
    };
  }
  return { x: 0, y: 0, width: texture.width, height: texture.height };
}
