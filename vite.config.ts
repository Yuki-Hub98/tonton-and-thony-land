import { defineConfig } from 'vite';

// Nome do repositório no GitHub. O GitHub Pages publica o site em
// https://<usuario>.github.io/<REPO_NAME>/, então todo caminho precisa desse prefixo.
// No código do jogo, use import.meta.env.BASE_URL em vez de repetir o nome.
const REPO_NAME = 'tonton-and-thony-land';

export default defineConfig({
  base: `/${REPO_NAME}/`,
  build: {
    // O Phaser sozinho tem ~1,2 MB minificado; o aviso padrão (500 kB) não ajuda aqui.
    chunkSizeWarningLimit: 1600,
  },
});
