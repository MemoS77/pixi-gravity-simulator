import { MIN_DISTANCE } from '../constants/universe'
import { PlanetInfo } from '../types'

/**
 * Функция для расчета гравитационной силы между двумя телами
 * Использует закон всемирного тяготения: F = G * (m1 * m2) / r²
 *
 * @param planet1 - первое тело
 * @param planet2 - второе тело
 * @param gravityConst - гравитационная константа
 * @returns объект с компонентами силы { fx, fy }
 */
export const calculateGravitationalForce = (
  planet1: PlanetInfo,
  planet2: PlanetInfo,
  gravityConst: number,
) => {
  const dx = planet2.position.x - planet1.position.x
  const dy = planet2.position.y - planet1.position.y
  let distance = Math.max(1, Math.sqrt(dx * dx + dy * dy))

  let mult = 1

  if (distance < MIN_DISTANCE) return { fx: 0, fy: 0 }

  if (distance < planet1.radius + planet2.radius) {
    const minDistance = Math.abs(planet1.radius - planet2.radius) + MIN_DISTANCE
    mult = 1 - minDistance / (distance + minDistance)
  }

  // F = G * (m1 * m2) / r^2
  const force =
    (gravityConst * planet1.mass * planet2.mass) / (distance * distance)

  // Нормализуем направление силы
  const fx = ((force * dx) / distance) * mult
  const fy = ((force * dy) / distance) * mult

  return { fx, fy }
}
