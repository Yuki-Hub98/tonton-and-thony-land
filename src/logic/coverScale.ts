/**
 * Escala para uma imagem cobrir a área inteira sem distorcer (como o "cover" do CSS):
 * o lado que sobrar é cortado igualmente dos dois lados.
 */
export function coverScale(
  imageWidth: number,
  imageHeight: number,
  areaWidth: number,
  areaHeight: number,
): number {
  return Math.max(areaWidth / imageWidth, areaHeight / imageHeight);
}
