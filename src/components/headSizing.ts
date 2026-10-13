import type Phaser from 'phaser';
import {
  headFaceRegion,
  headLayout,
  headLayoutInBox,
  type HeadLayout,
  type HeadPhoto,
} from '../logic/headLayout';

/** Ajusta tamanho e origem da imagem da cabeça para a foto (textura) atual. */
export type HeadFit = (image: Phaser.GameObjects.Image) => void;

function apply(image: Phaser.GameObjects.Image, layout: HeadLayout): void {
  image.setOrigin(layout.originX, layout.originY).setScale(layout.scaleX, layout.scaleY);
}

/** Na fase: rosto com faceSize e origem no queixo (o cabelo comprido pende abaixo). */
export function fitHeadAtChin(photo: HeadPhoto, faceSize: number): HeadFit {
  return (image) => apply(image, headLayout(photo, faceSize, image));
}

/** Nos menus: origem no centro e a foto inteira cabendo em maxHeight. */
export function fitHeadInBox(photo: HeadPhoto, faceSize: number, maxHeight: number): HeadFit {
  return (image) => apply(image, headLayoutInBox(photo, faceSize, maxHeight, image));
}

/**
 * Ícone pequeno (vidas do HUD): mostra só o rosto, recortado, com `size` de altura.
 * A origem fica no canto de cima à esquerda do rosto.
 */
export function fitHeadIcon(photo: HeadPhoto, size: number): HeadFit {
  return (image) => {
    const face = headFaceRegion(photo, image);
    // O recorte não muda a posição da imagem: a origem é deslocada para o canto do rosto.
    image
      .setCrop(face.x, face.y, face.width, face.height)
      .setOrigin(face.x / image.width, face.y / image.height)
      .setScale(size / face.height);
  };
}
