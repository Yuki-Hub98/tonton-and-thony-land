import type Phaser from 'phaser';

type TextStyle = Phaser.Types.GameObjects.Text.TextStyle;

const FONT_FAMILY = '"Trebuchet MS", "Arial Rounded MT Bold", sans-serif';

/** Estilos de texto da interface. */
export const TextStyles = {
  title: {
    fontFamily: FONT_FAMILY,
    fontSize: '64px',
    fontStyle: 'bold',
    color: '#ffec27',
    stroke: '#000000',
    strokeThickness: 8,
  },
  prompt: {
    fontFamily: FONT_FAMILY,
    fontSize: '28px',
    color: '#ffffff',
    // Contorno para continuar legível em cima de imagens coloridas.
    stroke: '#000000',
    strokeThickness: 5,
  },
  heading: {
    fontFamily: FONT_FAMILY,
    fontSize: '40px',
    fontStyle: 'bold',
    color: '#ffffff',
    stroke: '#000000',
    strokeThickness: 6,
  },
  cardName: {
    fontFamily: FONT_FAMILY,
    fontSize: '32px',
    fontStyle: 'bold',
    color: '#ffffff',
  },
  hint: {
    fontFamily: FONT_FAMILY,
    fontSize: '20px',
    color: '#c2c3c7',
    // Contorno fino: continua legível em cima dos fundos coloridos.
    stroke: '#000000',
    strokeThickness: 4,
  },
} satisfies Record<string, TextStyle>;
