import { PlanetInfo } from '../types'
import { applyBoundaryConditions } from './applyBoundaryConditions'

/**
 * Обновляет позиции и скорости всех планет на основе действующих сил
 * @param planets Map планет
 * @param forces Map сил для каждой планеты
 * @param deltaTime Временной шаг
 */
export function updatePlanetPositions(
  planets: Map<number, PlanetInfo>,
  forces: Map<number, { fx: number; fy: number }>,
  deltaTime: number
): void {
  for (const [id, planet] of planets) {
    const force = forces.get(id)
    if (!force) continue

    // Рассчитываем ускорение
    const ax = force.fx / planet.mass
    const ay = force.fy / planet.mass

    // Обновляем скорость: v = v0 + at
    let newSpeedX = planet.speed.x + ax * deltaTime
    let newSpeedY = planet.speed.y + ay * deltaTime

    // Обновляем позицию: x = x0 + vt
    let newPositionX = planet.position.x + newSpeedX * deltaTime
    let newPositionY = planet.position.y + newSpeedY * deltaTime

    // Применяем граничные условия
    const boundaryResult = applyBoundaryConditions(
      { x: newPositionX, y: newPositionY },
      { x: newSpeedX, y: newSpeedY },
    )

    // Обновляем планету с новыми значениями
    planet.speed = {
      x: boundaryResult.speed.x,
      y: boundaryResult.speed.y
    }
    planet.position = {
      x: boundaryResult.position.x,
      y: boundaryResult.position.y
    }
  }
}
