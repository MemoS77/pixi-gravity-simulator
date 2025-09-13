import { PlanetInfo } from './types'

export const mockedPlanets: PlanetInfo[] = [
  {
    mass: 50, // Большая центральная планета
    density: 1.5,
    position: { x: 400, y: 300 },
    speed: { x: 0, y: 0 }, // Неподвижная в начале
    rotationSpeed: 0.05,
  },
  {
    mass: 8, // Средняя планета
    density: 2,
    position: { x: 200, y: 300 },
    speed: { x: 0, y: 2 }, // Орбитальная скорость
    rotationSpeed: 0.15,
  },
  {
    mass: 3, // Маленькая быстрая планета
    density: 2.5,
    position: { x: 600, y: 200 },
    speed: { x: -1, y: 1.5 },
    rotationSpeed: -0.3,
  },
]
