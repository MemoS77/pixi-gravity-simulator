import { PlanetInfo } from '../types'
import { UNIVERSE_WIDTH, UNIVERSE_HEIGHT } from '../constants/universe'

/**
 * Генерирует случайные планеты с физически корректными параметрами
 *
 * @param count - количество планет для генерации
 * @returns массив случайно сгенерированных планет
 */
export const generateRandomPlanets = (
  count: number
): PlanetInfo[] => {
  const planets: PlanetInfo[] = []

  for (let i = 0; i < count; i++) {
    // Случайная масса от 3 до 50
    const mass = Math.random() * 47 + 3

    const density = 1

    // Случайная позиция с отступом от краев
    const margin = 100
    const position = {
      x: Math.random() * (UNIVERSE_WIDTH - 2 * margin) + margin,
      y: Math.random() * (UNIVERSE_HEIGHT - 2 * margin) + margin,
    }

    // Случайная скорость от -3 до 3
    const speed = {
      x: (Math.random() - 0.5) * 6,
      y: (Math.random() - 0.5) * 6,
    }

    // Случайная скорость вращения от -0.5 до 0.5
    const rotationSpeed = (Math.random() - 0.5) * 1

    planets.push({
      mass,
      density,
      position,
      speed,
      rotationSpeed,
    })
  }

  return planets
}
