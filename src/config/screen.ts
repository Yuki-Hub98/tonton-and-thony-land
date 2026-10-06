import { gameWidthFor } from '../logic/screenSize';
import { GAME_HEIGHT, GAME_MAX_WIDTH, GAME_MIN_WIDTH } from './constants';

/** Largura do jogo para a janela atual do navegador (preenche a tela inteira). */
export function currentGameWidth(): number {
  return gameWidthFor(
    window.innerWidth,
    window.innerHeight,
    GAME_HEIGHT,
    GAME_MIN_WIDTH,
    GAME_MAX_WIDTH,
  );
}
