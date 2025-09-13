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
  gravityConst: number
) => {
  const dx = planet2.position.x - planet1.position.x
  const dy = planet2.position.y - planet1.position.y
  const distance = Math.sqrt(dx * dx + dy * dy)

  // Избегаем деления на ноль и слишком близких расстояний
  if (distance < 10) return { fx: 0, fy: 0 }

  // F = G * (m1 * m2) / r^2
  const force =
    (gravityConst * planet1.mass * planet2.mass) / (distance * distance)

  // Нормализуем направление силы
  const fx = (force * dx) / distance
  const fy = (force * dy) / distance

  return { fx, fy }
}
