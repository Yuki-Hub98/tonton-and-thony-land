import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // A lógica testada é TypeScript puro (sem Phaser), então roda em Node, sem navegador.
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
