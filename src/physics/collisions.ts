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
 * @param planets Массив планет
 * @param index1 Индекс первой планеты (остается)
 * @param index2 Индекс второй планеты (будет удалена)
 */
export function mergePlanets(
  planets: PlanetInfo[],
  index1: number,
  index2: number,
): void {
  const planet1 = planets[index1]
  const planet2 = planets[index2]

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
const MAX_PLANETS_FOR_OPTIMIZE = 1000

let checkStep = 0
let lastPlanetsLength = 0
let nextPairCheckCache: [number, number][] = []

function optimizeProcessCollisionsAndMergers(
  planets: PlanetInfo[],
  handleCollision: (
    planet1: PlanetInfo,
    planet2: PlanetInfo,
    distance: number,
  ) => void,
): Map<number, boolean> {
  const needRemove: Map<number, boolean> = new Map()

  if (
    nextPairCheckCache.length === 0 ||
    checkStep > STEPS_FOR_FULL_COLLISIONS_CHECK ||
    lastPlanetsLength !== planets.length
  ) {
    checkStep = 0
    lastPlanetsLength = planets.length

    nextPairCheckCache = []

    for (let i = 0; i < planets.length; i++) {
      if (needRemove.has(i)) continue

      for (let j = i + 1; j < planets.length; j++) {
        if (needRemove.has(j)) continue

        const distance = calculateDistance(planets[i], planets[j])
        const glueDistance = Math.min(planets[i].radius, planets[j].radius)

        // Проверяем условие слияния
        if (distance <= glueDistance) {
          mergePlanets(planets, i, j)
          needRemove.set(j, true)
        }
        // Проверяем условие столкновения
        else if (distance <= planets[i].radius + planets[j].radius) {
          handleCollision(planets[i], planets[j], distance)
        } else {
          if (distance < MIN_DISTANCE_FOR_PAIR_CHECK) {
            nextPairCheckCache.push([i, j])
          }
        }
      }
    }

    console.log('next', nextPairCheckCache.length)
  } else {
    checkStep++

    for (let ti = 0; ti < nextPairCheckCache.length; ti++) {
      const [i, j] = nextPairCheckCache[ti]
      if (needRemove.has(i) || needRemove.has(j)) continue

      const distance = calculateDistance(planets[i], planets[j])
      const glueDistance = Math.min(planets[i].radius, planets[j].radius)

      // Проверяем условие слияния
      if (distance <= glueDistance) {
        mergePlanets(planets, i, j)
        needRemove.set(j, true)
      }
      // Проверяем условие столкновения
      else if (distance <= planets[i].radius + planets[j].radius) {
        handleCollision(planets[i], planets[j], distance)
      }
    }
  }

  return needRemove
}

/**
 * Обрабатывает столкновения и слияния между планетами
 * @param planets Массив планет
 * @param handleCollision Функция для обработки столкновений
 * @returns Map с индексами планет, которые нужно удалить
 */
export function processCollisionsAndMergers(
  planets: PlanetInfo[],
  handleCollision: (
    planet1: PlanetInfo,
    planet2: PlanetInfo,
    distance: number,
  ) => void,
): Map<number, boolean> {
  if (planets.length < MAX_PLANETS_FOR_OPTIMIZE)
    return processCollisionsAndMergersFull(planets, handleCollision)

  return optimizeProcessCollisionsAndMergers(planets, handleCollision)
}

// Без оптимизаций, полная проверка
function processCollisionsAndMergersFull(
  planets: PlanetInfo[],
  handleCollision: (
    planet1: PlanetInfo,
    planet2: PlanetInfo,
    distance: number,
  ) => void,
): Map<number, boolean> {
  const needRemove: Map<number, boolean> = new Map()
  //return needRemove

  for (let i = 0; i < planets.length; i++) {
    if (needRemove.has(i)) continue

    for (let j = i + 1; j < planets.length; j++) {
      if (needRemove.has(j)) continue

      const distance = calculateDistance(planets[i], planets[j])
      const glueDistance = Math.min(planets[i].radius, planets[j].radius)

      // Проверяем условие слияния
      if (distance <= glueDistance) {
        mergePlanets(planets, i, j)
        needRemove.set(j, true)
      }
      // Проверяем условие столкновения
      else if (distance <= planets[i].radius + planets[j].radius) {
        handleCollision(planets[i], planets[j], distance)
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
