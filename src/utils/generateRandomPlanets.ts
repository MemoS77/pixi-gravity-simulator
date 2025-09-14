import { PlanetInfo } from '../types'
import {
  UNIVERSE_WIDTH,
  UNIVERSE_HEIGHT,
  MAX_RANDOM_MASS,
} from '../constants/universe'
import { classifyBody } from './classify'
import { calculateRadius } from '../physics'

/**
 * Генерирует случайные планеты с физически корректными параметрами
 *
 * @param count - количество планет для генерации
 * @returns массив случайно сгенерированных планет
 */
export const generateRandomPlanets = (count: number): PlanetInfo[] => {
  const planets: PlanetInfo[] = []

  for (let i = 0; i < count; i++) {
    const mass = Math.ceil(Math.random() * MAX_RANDOM_MASS)

    const { density, color } = classifyBody(mass)

    // Случайная позиция с отступом от краев
    const margin = 100
    const position = {
      x: Math.random() * (UNIVERSE_WIDTH - 2 * margin) + margin,
      y: Math.random() * (UNIVERSE_HEIGHT - 2 * margin) + margin,
    }

    const radius = calculateRadius(mass, density)

    // Случайная скорость от -3 до 3
    const speed = {
      x: (Math.random() - 0.5) * 0,
      y: (Math.random() - 0.5) * 0,
    }

    planets.push({
      id: i,
      mass,
      density,
      position,
      speed,
      color,
      radius,
      needUpdate: true,
    })
  }

  return planets
}
