import Phaser from 'phaser';
import { GAME_HEIGHT } from './config/constants';
import { gameConfig } from './config/game.config';
import { currentGameWidth } from './config/screen';

const game = new Phaser.Game(gameConfig);

// Girou o celular ou mudou o tamanho da janela: a largura do jogo acompanha a nova tela.
// A câmera da fase se ajusta sozinha; os menus se reorganizam ao abrir de novo.
window.addEventListener('resize', () => {
  const width = currentGameWidth();
  if (width !== game.scale.width) game.scale.setGameSize(width, GAME_HEIGHT);
});
