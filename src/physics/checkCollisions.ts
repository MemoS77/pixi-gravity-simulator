import { PlanetInfo } from '../types'
import { calculateRadius } from './calculateRadius'

/**
 * Функция для проверки коллизии и поглощения объектов
 * Больший объект поглощает меньший с сохранением физических законов
 *
 * @param planetsArray - массив планет для проверки коллизий
 * @returns новый массив планет после обработки коллизий
 */
export const checkCollisions = (planetsArray: PlanetInfo[]): PlanetInfo[] => {
  const survivingPlanets: PlanetInfo[] = []
  const absorbed = new Set<number>()

  for (let i = 0; i < planetsArray.length; i++) {
    if (absorbed.has(i)) continue

    let currentPlanet = { ...planetsArray[i] }

    for (let j = i + 1; j < planetsArray.length; j++) {
      if (absorbed.has(j)) continue

      const planet1 = currentPlanet
      const planet2 = planetsArray[j]

      const dx = planet2.position.x - planet1.position.x
      const dy = planet2.position.y - planet1.position.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      const radius1 = calculateRadius(planet1.mass, planet1.density)
      const radius2 = calculateRadius(planet2.mass, planet2.density)

      // Проверяем, наползает ли один объект на другой минимум наполовину
      const minRadius = Math.min(radius1, radius2)
      const collisionThreshold = distance <= radius1 + radius2 - minRadius / 2

      if (collisionThreshold) {
        // Определяем, какой объект больше
        const biggerPlanet = planet1.mass >= planet2.mass ? planet1 : planet2
        const smallerPlanet = planet1.mass >= planet2.mass ? planet2 : planet1

        // Сохранение импульса: p = mv
        const totalMass = biggerPlanet.mass + smallerPlanet.mass
        const newSpeedX =
          (biggerPlanet.mass * biggerPlanet.speed.x +
            smallerPlanet.mass * smallerPlanet.speed.x) /
          totalMass
        const newSpeedY =
          (biggerPlanet.mass * biggerPlanet.speed.y +
            smallerPlanet.mass * smallerPlanet.speed.y) /
          totalMass

        // Сохранение углового момента для вращения
        const newRotationSpeed =
          (biggerPlanet.mass * biggerPlanet.rotationSpeed +
            smallerPlanet.mass * smallerPlanet.rotationSpeed) /
          totalMass

        // Позиция нового объекта - центр масс
        const newPositionX =
          (biggerPlanet.mass * biggerPlanet.position.x +
            smallerPlanet.mass * smallerPlanet.position.x) /
          totalMass
        const newPositionY =
          (biggerPlanet.mass * biggerPlanet.position.y +
            smallerPlanet.mass * smallerPlanet.position.y) /
          totalMass

        // Создаем новый объединенный объект
        currentPlanet = {
          mass: totalMass,
          density: biggerPlanet.density, // Сохраняем плотность большего объекта
          position: { x: newPositionX, y: newPositionY },
          speed: { x: newSpeedX, y: newSpeedY },
          rotationSpeed: newRotationSpeed,
        }

        // Помечаем поглощенный объект
        absorbed.add(j)
      }
    }

    survivingPlanets.push(currentPlanet)
  }

  return survivingPlanets
}
