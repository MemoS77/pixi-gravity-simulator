import { PlanetInfo } from '../types'
import { calculateGravitationalForce } from './calculateGravitationalForce'

/**
 * Рассчитывает гравитационные силы между всеми парами планет
 * @param planets Массив планет
 * @param gravityConst Гравитационная постоянная
 * @returns Массив сил для каждой планеты
 */
export function calculateAllGravitationalForces(
  planets: PlanetInfo[],
  gravityConst: number
): Array<{ fx: number; fy: number }> {
  const forces = planets.map(() => ({ fx: 0, fy: 0 }))

  // Вычисляем гравитационные силы между всеми парами планет
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const force = calculateGravitationalForce(
        planets[i],
        planets[j],
        gravityConst,
      )

      // Применяем силу к первой планете (притяжение ко второй)
      forces[i].fx += force.fx
      forces[i].fy += force.fy

      // Применяем противоположную силу ко второй планете (третий закон Ньютона)
      forces[j].fx -= force.fx
      forces[j].fy -= force.fy
    }
  }

  return forces
}
