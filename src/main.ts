import Phaser from 'phaser';
import { GAME_HEIGHT } from './config/constants';
import { gameConfig } from './config/game.config';
import { currentGameWidth, PORTRAIT_TOUCH_QUERY } from './config/screen';
import { TEXTS } from './config/texts';

const game = new Phaser.Game(gameConfig);

// Girou o celular ou mudou o tamanho da janela: a largura do jogo acompanha a nova tela.
// A câmera da fase se ajusta sozinha; os menus se reorganizam ao abrir de novo.
window.addEventListener('resize', () => {
  const width = currentGameWidth();
  if (width !== game.scale.width) game.scale.setGameSize(width, GAME_HEIGHT);
});

// Aviso "gire o celular": o CSS do index.html mostra/esconde; aqui só entra o texto
// (que fica em texts.ts) e o jogo pausa enquanto o aparelho estiver em pé.
const rotateWarning = document.getElementById('rotate-warning');
if (rotateWarning) rotateWarning.textContent = TEXTS.rotateDevice;

const portrait = window.matchMedia(PORTRAIT_TOUCH_QUERY);
const syncPause = () => {
  if (portrait.matches) game.pause();
  else game.resume();
};
portrait.addEventListener('change', syncPause);
// O Phaser só termina de iniciar no próximo frame; antes disso, pausar não teria efeito.
game.events.once(Phaser.Core.Events.READY, syncPause);
