/**
 * Pisca-pisca da invencibilidade: alterna visível/apagado a cada `blinkMs`
 * até `invincibleUntil`, e termina sempre visível.
 */
export function isBlinkVisible(now: number, invincibleUntil: number, blinkMs: number): boolean {
  if (now >= invincibleUntil) return true;
  // Conta de trás para frente a partir do fim, para o último trecho ser sempre "visível".
  return Math.floor((invincibleUntil - now) / blinkMs) % 2 === 0;
}
