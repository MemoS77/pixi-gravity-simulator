import { PlanetInfo } from '../types'

/**
 * Генерирует случайные планеты с физически корректными параметрами
 *
 * @param count - количество планет для генерации
 * @param screenWidth - ширина экрана
 * @param screenHeight - высота экрана
 * @returns массив случайно сгенерированных планет
 */
export const generateRandomPlanets = (
  count: number,
  screenWidth: number = 800,
  screenHeight: number = 600,
): PlanetInfo[] => {
  const planets: PlanetInfo[] = []

  for (let i = 0; i < count; i++) {
    // Случайная масса от 3 до 50
    const mass = Math.random() * 47 + 3

    const density = 1

    // Случайная позиция с отступом от краев
    const margin = 100
    const position = {
      x: Math.random() * (screenWidth - 2 * margin) + margin,
      y: Math.random() * (screenHeight - 2 * margin) + margin,
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
