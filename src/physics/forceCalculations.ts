import { PlanetInfo } from '../types'
import { calculateGravitationalForce } from './calculateGravitationalForce'
import { arePlanetsMovingAway } from './motionUtils'

const MAX_PLANETS_FOR_OPTIMIZE = 500

let nextPairCheckCache: [number, number][] = []
const MIN_FORCE = 3
const STEPS_TO_USE_PAIR_CHECK = 30
let checkStep = 0
let cachedForces: Map<number, Force> = new Map()

type Force = {
  fx: number
  fy: number
}

export function calcForces(
  planets: Map<number, PlanetInfo>,
  gravityConst: number,
): Map<number, Force> {
  if (planets.size > MAX_PLANETS_FOR_OPTIMIZE) {
    return optimizeCalcForces(planets, gravityConst)
  }
  return calculateAllGravitationalForces(planets, gravityConst)
}

function optimizeCalcForces(
  planets: Map<number, PlanetInfo>,
  gravityConst: number,
): Map<number, Force> {
  const forces = new Map<number, Force>()
  const planetIds = Array.from(planets.keys())

  // Инициализируем силы для всех планет
  for (const id of planetIds) {
    forces.set(id, { fx: 0, fy: 0 })
  }

  if (checkStep > STEPS_TO_USE_PAIR_CHECK) {
    nextPairCheckCache = []
    checkStep = 0

    // Сохраним сумму сил для пар планет, которые не будем считать
    cachedForces.clear()
    for (const id of planetIds) {
      cachedForces.set(id, { fx: 0, fy: 0 })
    }

    // Вычисляем гравитационные силы между всеми парами планет
    for (let i = 0; i < planetIds.length; i++) {
      for (let j = i + 1; j < planetIds.length; j++) {
        const id1 = planetIds[i]
        const id2 = planetIds[j]
        const planet1 = planets.get(id1)!
        const planet2 = planets.get(id2)!

        const force = calculateGravitationalForce(
          planet1,
          planet2,
          gravityConst,
        )

        if (
          (Math.abs(force.fx) > MIN_FORCE || Math.abs(force.fy) > MIN_FORCE) &&
          !arePlanetsMovingAway(planet1, planet2)
        ) {
          nextPairCheckCache.push([id1, id2])
        } else {
          const cached1 = cachedForces.get(id1)!
          const cached2 = cachedForces.get(id2)!
          cached1.fx += force.fx
          cached1.fy += force.fy
          cached2.fx -= force.fx
          cached2.fy -= force.fy
        }

        // Применяем силу к первой планете (притяжение ко второй)
        const force1 = forces.get(id1)!
        const force2 = forces.get(id2)!
        force1.fx += force.fx
        force1.fy += force.fy

        // Применяем противоположную силу ко второй планете (третий закон Ньютона)
        force2.fx -= force.fx
        force2.fy -= force.fy
      }
    }
  } else {
    checkStep++

    for (let ti = 0; ti < nextPairCheckCache.length; ti++) {
      const [id1, id2] = nextPairCheckCache[ti]
      const planet1 = planets.get(id1)
      const planet2 = planets.get(id2)

      // Проверяем, что планеты еще существуют
      if (!planet1 || !planet2) continue

      const force = calculateGravitationalForce(planet1, planet2, gravityConst)

      // Применяем силу к первой планете (притяжение ко второй)
      const force1 = forces.get(id1)!
      const force2 = forces.get(id2)!
      force1.fx += force.fx
      force1.fy += force.fy

      // Применяем противоположную силу ко второй планете (третий закон Ньютона)
      force2.fx -= force.fx
      force2.fy -= force.fy
    }

    for (const id of planetIds) {
      const force = forces.get(id)!
      const cached = cachedForces.get(id)
      if (cached) {
        force.fx += cached.fx
        force.fy += cached.fy
      }
    }
  }
  return forces
}

function calculateAllGravitationalForces(
  planets: Map<number, PlanetInfo>,
  gravityConst: number,
): Map<number, Force> {
  const forces = new Map<number, Force>()
  const planetIds = Array.from(planets.keys())

  // Инициализируем силы для всех планет
  for (const id of planetIds) {
    forces.set(id, { fx: 0, fy: 0 })
  }

  // Вычисляем гравитационные силы между всеми парами планет
  for (let i = 0; i < planetIds.length; i++) {
    for (let j = i + 1; j < planetIds.length; j++) {
      const id1 = planetIds[i]
      const id2 = planetIds[j]
      const planet1 = planets.get(id1)!
      const planet2 = planets.get(id2)!

      const force = calculateGravitationalForce(planet1, planet2, gravityConst)

      // Применяем силу к первой планете (притяжение ко второй)
      const force1 = forces.get(id1)!
      const force2 = forces.get(id2)!
      force1.fx += force.fx
      force1.fy += force.fy

      // Применяем противоположную силу ко второй планете (третий закон Ньютона)
      force2.fx -= force.fx
      force2.fy -= force.fy
    }
  }

  return forces
}
