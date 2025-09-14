import { PlanetInfo } from '../types'

export function arePlanetsMovingAway(
  planet1: PlanetInfo,
  planet2: PlanetInfo,
): boolean {
  // Вычисляем вектор позиции от planet1 к planet2
  const dx = planet2.position.x - planet1.position.x
  const dy = planet2.position.y - planet1.position.y

  // Вычисляем относительную скорость planet2 относительно planet1
  const dvx = planet2.speed.x - planet1.speed.x
  const dvy = planet2.speed.y - planet1.speed.y

  // Если скалярное произведение положительное, планеты удаляются друг от друга
  // (относительная скорость имеет компонент в том же направлении, что и вектор позиции)
  return dx * dvx + dy * dvy > 0
}
