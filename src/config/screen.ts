import type Phaser from 'phaser';
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

/**
 * Celular/tablet em pé. Mesma regra do CSS do aviso "gire o celular" no index.html.
 * pointer: coarse = tela de toque (dedo), para não pedir para girar um monitor estreito.
 */
export const PORTRAIT_TOUCH_QUERY = '(orientation: portrait) and (pointer: coarse)';

/**
 * Em aparelho de toque, entra em tela cheia (esconde a barra do navegador) e tenta
 * travar a tela deitada. O navegador só deixa fazer isso logo depois de um toque,
 * então chamar dentro de um evento de "pointerup". Onde não existe (iPhone), não faz nada.
 */
export function enterFullscreenOnTouch(scene: Phaser.Scene): void {
  const { scale } = scene;
  if (!scene.sys.game.device.input.touch || !scale.fullscreen.available || scale.isFullscreen) {
    return;
  }
  scale.startFullscreen();

  // screen.orientation.lock só funciona em tela cheia e não existe em todo navegador.
  const orientation = screen.orientation as ScreenOrientation & {
    lock?: (orientation: string) => Promise<void>;
  };
  orientation.lock?.('landscape').catch(() => {
    // Sem permissão para travar: o aviso "gire o celular" continua cuidando disso.
  });
}
