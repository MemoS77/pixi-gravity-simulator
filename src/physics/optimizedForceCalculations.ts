import { PlanetInfo } from '../types'
import { calculateGravitationalForce } from './calculateGravitationalForce'
import { SpatialGrid } from './spatialGrid'
import { 
  MAX_INTERACTION_DISTANCE, 
  MIN_FORCE_THRESHOLD
} from '../constants/universe'

/**
 * Оптимизированный расчет гравитационных сил с использованием пространственного разбиения
 * и отсечения дальних взаимодействий
 */
export function calculateOptimizedGravitationalForces(
  planets: PlanetInfo[],
  gravityConst: number
): Array<{ fx: number; fy: number }> {
  const forces = planets.map(() => ({ fx: 0, fy: 0 }))
  
  // Если объектов мало, используем простой алгоритм
  if (planets.length < 100) {
    return calculateSimpleForces(planets, gravityConst, forces)
  }

  // Создаем пространственную сетку
  const spatialGrid = new SpatialGrid()
  spatialGrid.update(planets)

  // Получаем пары для взаимодействия
  const interactionPairs = spatialGrid.getInteractionPairs()

  // Создаем индекс для быстрого поиска
  const planetIndex = new Map<PlanetInfo, number>()
  planets.forEach((planet, index) => {
    planetIndex.set(planet, index)
  })

  // Вычисляем силы только для близких пар
  for (const [planet1, planet2] of interactionPairs) {
    const index1 = planetIndex.get(planet1)!
    const index2 = planetIndex.get(planet2)!

    // Быстрая проверка расстояния без sqrt
    const dx = planet2.position.x - planet1.position.x
    const dy = planet2.position.y - planet1.position.y
    const distanceSquared = dx * dx + dy * dy

    // Отсекаем слишком далекие объекты
    if (distanceSquared > MAX_INTERACTION_DISTANCE * MAX_INTERACTION_DISTANCE) {
      continue
    }

    // Быстрая оценка силы для отсечения слабых взаимодействий
    const estimatedForce = (gravityConst * planet1.mass * planet2.mass) / distanceSquared
    if (estimatedForce < MIN_FORCE_THRESHOLD) {
      continue
    }

    const force = calculateGravitationalForce(planet1, planet2, gravityConst)

    // Применяем силу к первой планете (притяжение ко второй)
    forces[index1].fx += force.fx
    forces[index1].fy += force.fy

    // Применяем противоположную силу ко второй планете (третий закон Ньютона)
    forces[index2].fx -= force.fx
    forces[index2].fy -= force.fy
  }

  return forces
}

/**
 * Простой алгоритм для малого количества объектов
 */
function calculateSimpleForces(
  planets: PlanetInfo[],
  gravityConst: number,
  forces: Array<{ fx: number; fy: number }>
): Array<{ fx: number; fy: number }> {
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      // Быстрая проверка расстояния
      const dx = planets[j].position.x - planets[i].position.x
      const dy = planets[j].position.y - planets[i].position.y
      const distanceSquared = dx * dx + dy * dy

      // Отсекаем слишком далекие объекты
      if (distanceSquared > MAX_INTERACTION_DISTANCE * MAX_INTERACTION_DISTANCE) {
        continue
      }

      // Быстрая оценка силы
      const estimatedForce = (gravityConst * planets[i].mass * planets[j].mass) / distanceSquared
      if (estimatedForce < MIN_FORCE_THRESHOLD) {
        continue
      }

      const force = calculateGravitationalForce(planets[i], planets[j], gravityConst)

      forces[i].fx += force.fx
      forces[i].fy += force.fy
      forces[j].fx -= force.fx
      forces[j].fy -= force.fy
    }
  }

  return forces
}

/**
 * Адаптивный алгоритм, который выбирает оптимальную стратегию в зависимости от условий
 */
export function calculateAdaptiveGravitationalForces(
  planets: PlanetInfo[],
  gravityConst: number
): Array<{ fx: number; fy: number }> {
  // Анализируем плотность объектов
  const density = calculateObjectDensity(planets)
  
  // Если плотность высокая, используем пространственное разбиение
  if (density > 0.1 && planets.length > 200) {
    return calculateOptimizedGravitationalForces(planets, gravityConst)
  }
  
  // Иначе используем простой алгоритм с отсечениями
  const forces = planets.map(() => ({ fx: 0, fy: 0 }))
  return calculateSimpleForces(planets, gravityConst, forces)
}

/**
 * Вычисляет плотность объектов в пространстве
 */
function calculateObjectDensity(planets: PlanetInfo[]): number {
  if (planets.length === 0) return 0

  // Находим границы области с объектами
  let minX = Infinity, maxX = -Infinity
  let minY = Infinity, maxY = -Infinity

  for (const planet of planets) {
    minX = Math.min(minX, planet.position.x)
    maxX = Math.max(maxX, planet.position.x)
    minY = Math.min(minY, planet.position.y)
    maxY = Math.max(maxY, planet.position.y)
  }

  const area = (maxX - minX) * (maxY - minY)
  return area > 0 ? planets.length / area : 0
}
