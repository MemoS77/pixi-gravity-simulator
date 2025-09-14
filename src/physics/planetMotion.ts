import { PlanetInfo } from '../types'
import { applyBoundaryConditions } from './applyBoundaryConditions'

/**
 * Обновляет позиции и скорости всех планет на основе действующих сил
 * @param planets Массив планет
 * @param forces Массив сил для каждой планеты
 * @param deltaTime Временной шаг
 */
export function updatePlanetPositions(
  planets: PlanetInfo[],
  forces: Array<{ fx: number; fy: number }>,
  deltaTime: number
): void {
  // Рассчитываем ускорения для всех планет
  const accelerations = forces.map((force, index) => ({
    ax: force.fx / planets[index].mass,
    ay: force.fy / planets[index].mass,
  }))

  planets.forEach((planet, index) => {
    const { ax, ay } = accelerations[index]

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
  })
}
