import { PlanetInfo } from './types'

export const mockedPlanets: PlanetInfo[] = [
  {
    mass: 5,
    density: 2,
    position: { x: 300, y: 450 },
    speed: { x: -1, y: 0 },
    rotationSpeed: 0.1,
  },
  {
    mass: 25,
    density: 1,
    position: { x: 200, y: 250 },
    speed: { x: 1, y: 3 },
    rotationSpeed: -0.2,
  },
  {
    mass: 7,
    density: 1.2,
    position: { x: 200, y: 450 },
    speed: { x: 0, y: 0 },
    rotationSpeed: 0,
  },
]
