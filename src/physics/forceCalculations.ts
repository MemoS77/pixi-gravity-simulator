import { PlanetInfo } from '../types'
import { calculateGravitationalForce } from './calculateGravitationalForce'
import { arePlanetsMovingAway } from './motionUtils'

const MAX_PLANETS_FOR_OPTIMIZE = 500

type Force = {
  fx: number
  fy: number
}

export function calcForces(planets: PlanetInfo[], gravityConst: number) {
  if (planets.length > MAX_PLANETS_FOR_OPTIMIZE) {
    return optimizeCalcForces(planets, gravityConst)
  }
  return calculateAllGravitationalForces(planets, gravityConst)
}

let nextPairCheckCache: [number, number][] = []
const MIN_FORCE = 5
const STEPS_TO_USE_PAIR_CHECK = 100
let checkStep = 0
let lastPlanetsLength = 0
let cachedForces: Force[] = []

function optimizeCalcForces(
  planets: PlanetInfo[],
  gravityConst: number,
): Array<Force> {
  const forces = planets.map(() => ({ fx: 0, fy: 0 }))

  if (
    checkStep > STEPS_TO_USE_PAIR_CHECK ||
    lastPlanetsLength !== planets.length
  ) {
    nextPairCheckCache = []
    checkStep = 0
    lastPlanetsLength = planets.length

    // Сохраним сумму сил для пар планет, которые не будем считать
    cachedForces = planets.map(() => ({ fx: 0, fy: 0 }))

    // Вычисляем гравитационные силы между всеми парами планет
    for (let i = 0; i < planets.length; i++) {
      for (let j = i + 1; j < planets.length; j++) {
        const force = calculateGravitationalForce(
          planets[i],
          planets[j],
          gravityConst,
        )

        if (
          (Math.abs(force.fx) > MIN_FORCE || Math.abs(force.fy) > MIN_FORCE) &&
          !arePlanetsMovingAway(planets[i], planets[j])
        ) {
          nextPairCheckCache.push([i, j])
        } else {
          cachedForces[i].fx += force.fx
          cachedForces[i].fy += force.fy
          cachedForces[j].fx -= force.fx
          cachedForces[j].fy -= force.fy
        }

        // Применяем силу к первой планете (притяжение ко второй)
        forces[i].fx += force.fx
        forces[i].fy += force.fy

        // Применяем противоположную силу ко второй планете (третий закон Ньютона)
        forces[j].fx -= force.fx
        forces[j].fy -= force.fy
      }
    }

    console.log(
      'nextPairCheckCache',
      nextPairCheckCache.length,
      lastPlanetsLength,
      cachedForces.length,
    )
  } else {
    checkStep++

    for (let ti = 0; ti < nextPairCheckCache.length; ti++) {
      const [i, j] = nextPairCheckCache[ti]

      const force = calculateGravitationalForce(
        planets[i],
        planets[j],
        gravityConst,
      )
      // Применяем силу к первой планете (притяжение ко второй)
      forces[i].fx += force.fx
      forces[i].fy += force.fy

      // Применяем противоположную силу ко второй планете (третий закон Ньютона)
      forces[j].fx -= force.fx
      forces[j].fy -= force.fy
    }

    for (let i = 0; i < planets.length; i++) {
      forces[i].fx += cachedForces[i].fx
      forces[i].fy += cachedForces[i].fy
    }
  }
  return forces
}

function calculateAllGravitationalForces(
  planets: PlanetInfo[],
  gravityConst: number,
): Array<Force> {
  const forces = planets.map(() => ({ fx: 0, fy: 0 }))

  // Вычисляем гравитационные силы между всеми парами планет
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const force = calculateGravitationalForce(
        planets[i],
        planets[j],
        gravityConst,
      )
      // Применяем силу к первой планете (притяжение ко второй)
      forces[i].fx += force.fx
      forces[i].fy += force.fy

      // Применяем противоположную силу ко второй планете (третий закон Ньютона)
      forces[j].fx -= force.fx
      forces[j].fy -= force.fy
    }
  }

  return forces
}
