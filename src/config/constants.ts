// Números do jogo. Ajuste a dificuldade e o visual mexendo só aqui.

/** Resolução lógica do jogo. O Phaser escala esse tamanho para caber na tela. */
export const GAME_WIDTH = 960;
export const GAME_HEIGHT = 540;

export const BACKGROUND_COLOR = '#1d2b53';

/** Gravidade da física arcade, em pixels por segundo². */
export const GRAVITY_Y = 1200;

/** Barra de progresso da PreloadScene. */
export const PRELOAD_BAR_WIDTH = 400;
export const PRELOAD_BAR_HEIGHT = 24;

/** Tamanho de um bloco de chão/plataforma, em pixels. */
export const TILE_SIZE = 32;

/** Velocidade horizontal do jogador, em pixels por segundo. */
export const PLAYER_SPEED = 220;
/** Impulso do pulo (negativo = para cima), em pixels por segundo. */
export const PLAYER_JUMP_VELOCITY = -620;
/** Ao soltar o pulo ainda subindo, a velocidade é multiplicada por isto (pulo baixo). */
export const JUMP_CUT_FACTOR = 0.45;

/** Posição do jogador na tela quando a câmera anda: 0 = borda esquerda, 1 = direita. */
export const CAMERA_LEAD_RATIO = 0.4;

/** Tamanho da cabeça na tela, em pixels (a foto é redimensionada para isso). */
export const HEAD_SIZE = 44;
/** Quanto a cabeça desce sobre o corpo, para parecer encaixada (pescoço). */
export const HEAD_OVERLAP_Y = 4;
/** Tamanho da cabeça desenhada como placeholder enquanto não há foto. */
export const HEAD_PLACEHOLDER_SIZE = 64;

/** Tempo de cada foto no slide da cabeça normal. */
export const IDLE_SLIDE_MS = 1500;
/** Quanto tempo a cabeça fica feliz depois de pegar um item. */
export const HAPPY_DURATION_MS = 2500;
/** Quanto tempo a cabeça fica triste depois de levar dano (sem morrer). */
export const SAD_DURATION_MS = 1500;
