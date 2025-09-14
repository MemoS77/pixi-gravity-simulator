import { PlanetInfo } from '../types'
import { calculateRadius } from './calculateRadius'
import { classifyBody } from '../utils/classify'

/**
 * Вычисляет расстояние между двумя планетами
 * @param planet1 Первая планета
 * @param planet2 Вторая планета
 * @returns Расстояние между центрами планет
 */
export function calculateDistance(
  planet1: PlanetInfo,
  planet2: PlanetInfo,
): number {
  return Math.sqrt(
    Math.pow(planet1.position.x - planet2.position.x, 2) +
      Math.pow(planet1.position.y - planet2.position.y, 2),
  )
}

/**
 * Выполняет слияние двух планет
 * @param planets Map планет
 * @param id1 ID первой планеты (остается)
 * @param id2 ID второй планеты (будет удалена)
 */
export function mergePlanets(
  planets: Map<number, PlanetInfo>,
  id1: number,
  id2: number,
): void {
  const planet1 = planets.get(id1)!
  const planet2 = planets.get(id2)!

  // Вычисляем новые параметры объединенной планеты
  const mergedMass = planet1.mass + planet2.mass
  const { color, density } = classifyBody(mergedMass)
  const mergedRadius = calculateRadius(mergedMass, density)

  // Вычисляем центр масс
  const middlePoint = {
    x: (planet1.position.x + planet2.position.x) / 2,
    y: (planet1.position.y + planet2.position.y) / 2,
  }

  // Сохраняем импульс: складываем векторные скорости с учетом масс
  const mergedSpeed = {
    x:
      (planet1.speed.x * planet1.mass + planet2.speed.x * planet2.mass) /
      mergedMass,
    y:
      (planet1.speed.y * planet1.mass + planet2.speed.y * planet2.mass) /
      mergedMass,
  }

  // Обновляем первую планету новыми параметрами
  planet1.mass = mergedMass
  planet1.density = density
  planet1.color = color
  planet1.radius = mergedRadius
  planet1.position = middlePoint
  planet1.speed = mergedSpeed
  planet1.needUpdate = true
}

const STEPS_FOR_FULL_COLLISIONS_CHECK = 50
const MIN_DISTANCE_FOR_PAIR_CHECK = 1000
const MAX_PLANETS_FOR_OPTIMIZE = 10000

let checkStep = 0
let nextPairCheckCache: [number, number][] = []

function optimizeProcessCollisionsAndMergers(
  planets: Map<number, PlanetInfo>,
  handleCollision: (
    planet1: PlanetInfo,
    planet2: PlanetInfo,
    distance: number,
  ) => void,
): Map<number, boolean> {
  const needRemove: Map<number, boolean> = new Map()
  const planetIds = Array.from(planets.keys())

  if (
    nextPairCheckCache.length === 0 ||
    checkStep > STEPS_FOR_FULL_COLLISIONS_CHECK
  ) {
    checkStep = 0

    nextPairCheckCache = []

    for (let i = 0; i < planetIds.length; i++) {
      const id1 = planetIds[i]
      if (needRemove.has(id1)) continue
      const planet1 = planets.get(id1)!

      for (let j = i + 1; j < planetIds.length; j++) {
        const id2 = planetIds[j]
        if (needRemove.has(id2)) continue
        const planet2 = planets.get(id2)!

        const distance = calculateDistance(planet1, planet2)
        const glueDistance = Math.min(planet1.radius, planet2.radius)

        // Проверяем условие слияния
        if (distance <= glueDistance) {
          mergePlanets(planets, id1, id2)
          needRemove.set(id2, true)
        }
        // Проверяем условие столкновения
        else if (distance <= planet1.radius + planet2.radius) {
          handleCollision(planet1, planet2, distance)
        } else {
          if (distance < MIN_DISTANCE_FOR_PAIR_CHECK) {
            nextPairCheckCache.push([id1, id2])
          }
        }
      }
    }

    console.log('next', nextPairCheckCache.length)
  } else {
    checkStep++

    for (let ti = 0; ti < nextPairCheckCache.length; ti++) {
      const [id1, id2] = nextPairCheckCache[ti]
      if (needRemove.has(id1) || needRemove.has(id2)) continue
      
      const planet1 = planets.get(id1)
      const planet2 = planets.get(id2)
      
      // Проверяем, что планеты еще существуют
      if (!planet1 || !planet2) continue

      const distance = calculateDistance(planet1, planet2)
      const glueDistance = Math.min(planet1.radius, planet2.radius)

      // Проверяем условие слияния
      if (distance <= glueDistance) {
        mergePlanets(planets, id1, id2)
        needRemove.set(id2, true)
      }
      // Проверяем условие столкновения
      else if (distance <= planet1.radius + planet2.radius) {
        handleCollision(planet1, planet2, distance)
      }
    }
  }

  return needRemove
}

/**
 * Обрабатывает столкновения и слияния между планетами
 * @param planets Map планет
 * @param handleCollision Функция для обработки столкновений
 * @returns Массив ID планет, которые нужно удалить
 */
export function processCollisionsAndMergers(
  planets: Map<number, PlanetInfo>,
  handleCollision: (
    planet1: PlanetInfo,
    planet2: PlanetInfo,
    distance: number,
  ) => void,
): number[] {
  if (planets.size > MAX_PLANETS_FOR_OPTIMIZE) {
    const needRemove = optimizeProcessCollisionsAndMergers(
      planets,
      handleCollision,
    )
    return Array.from(needRemove.keys()).filter((key) => needRemove.get(key))
  }

  const needRemove: number[] = []
  const planetIds = Array.from(planets.keys())

  for (let i = 0; i < planetIds.length; i++) {
    const id1 = planetIds[i]
    if (needRemove.includes(id1)) continue
    const planet1 = planets.get(id1)!

    for (let j = i + 1; j < planetIds.length; j++) {
      const id2 = planetIds[j]
      if (needRemove.includes(id2)) continue
      const planet2 = planets.get(id2)!

      const distance = calculateDistance(planet1, planet2)
      const glueDistance = Math.min(planet1.radius, planet2.radius)

      // Проверяем условие слияния
      if (distance <= glueDistance) {
        mergePlanets(planets, id1, id2)
        needRemove.push(id2)
      }
      // Проверяем условие столкновения
      else if (distance <= planet1.radius + planet2.radius) {
        handleCollision(planet1, planet2, distance)
      }
    }
  }

  return needRemove
}



/**
 * Обрабатывает физически корректное столкновение между двумя планетами
 * @param planet1 Первая планета
 * @param planet2 Вторая планета
 * @param distance Расстояние между планетами
 */
export function handlePlanetCollision(
  planet1: PlanetInfo,
  planet2: PlanetInfo,
  distance: number,
): void {
  // Вычисляем вектор между центрами планет
  const dx = planet2.position.x - planet1.position.x
  const dy = planet2.position.y - planet1.position.y

  // Нормализуем вектор столкновения
  const normalX = dx / distance
  const normalY = dy / distance

  // Вычисляем относительную скорость
  const relativeVelX = planet2.speed.x - planet1.speed.x
  const relativeVelY = planet2.speed.y - planet1.speed.y

  // Проекция относительной скорости на нормаль столкновения
  const velAlongNormal = relativeVelX * normalX + relativeVelY * normalY

  // Если объекты уже расходятся, не обрабатываем столкновение
  if (velAlongNormal > 0) return

  // Коэффициент восстановления (0 = неупругое, 1 = упругое)
  const restitution = 0.1
  // Вычисляем импульс столкновения
  const impulse =
    (-(1 + restitution) * velAlongNormal) /
    (1 / planet1.mass + 1 / planet2.mass)

  // Применяем импульс к скоростям
  const impulseX = impulse * normalX
  const impulseY = impulse * normalY

  planet1.speed.x -= impulseX / planet1.mass
  planet1.speed.y -= impulseY / planet1.mass
  planet2.speed.x += impulseX / planet2.mass
  planet2.speed.y += impulseY / planet2.mass

  // Рассчитываем степень проникновения объектов друг в друга
  const overlap = planet1.radius + planet2.radius - distance

  // Применяем трение для постепенной остановки в зависимости от проникновения
  if (overlap > 0) {
    // Нормализуем значение проникновения (от 0 до 1)
    // Делим на сумму радиусов, чтобы получить относительное проникновение
    const normalizedOverlap = Math.min(
      overlap / (planet1.radius + planet2.radius),
      1,
    )

    // Вычисляем коэффициент трения на основе степени проникновения
    // От минимального (0.01) при легком касании до максимального (0.3) при полном перекрытии
    const minFriction = 0.01
    const maxFriction = 0.3
    const frictionCoeff =
      minFriction + normalizedOverlap * (maxFriction - minFriction)

    // Применяем трение, пропорциональное перекрытию
    planet1.speed.x *= 1 - frictionCoeff
    planet1.speed.y *= 1 - frictionCoeff
    planet2.speed.x *= 1 - frictionCoeff
    planet2.speed.y *= 1 - frictionCoeff
  }
}
