/**
 * Функция для расчета радиуса планеты в 2D пространстве
 * Формула: S = m/ρ (площадь), S = πr², следовательно r = √(m/(πρ))
 *
 * @param mass - масса объекта
 * @param density - плотность объекта
 * @returns радиус объекта с масштабированием для видимости
 */
export const calculateRadius = (mass: number, density: number): number => {
  const area = mass / density // Площадь круга в 2D
  const radius = Math.sqrt(area / Math.PI)
  return radius
}
