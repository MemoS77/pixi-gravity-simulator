import {
  updatePlanetPositions,
  processCollisionsAndMergers,
  handlePlanetCollision,
  calculateAllGravitationalForces,
} from '../physics'
import { PlanetInfo } from '../types'
import { PerformanceMonitor } from '../utils/performanceMonitor'
import { generateRandomPlanets } from '../utils/generateRandomPlanets'

// Убираем зависимость от Graphics объектов PixiJS в воркере
type WorkerPlanetInfo = Omit<PlanetInfo, 'graphics'> & {
  id: number // Добавляем id для отслеживания объектов
}

interface PhysicsWorkerState {
  planets: WorkerPlanetInfo[]
  gravityConst: number
  paused: boolean
  lastFrameTime: number
  performanceMonitor: PerformanceMonitor
  nextPlanetId: number
}

// Типы сообщений от основного потока к воркеру
interface InitMessage {
  type: 'init'
  gravityConst: number
}

interface UpdateGravityMessage {
  type: 'updateGravity'
  gravityConst: number
}

interface GeneratePlanetsMessage {
  type: 'generatePlanets'
  count: number
}

interface UpdatePauseMessage {
  type: 'setPaused'
  paused: boolean
}

// Качество больше не используется
interface SetQualityMessage {
  type: 'setQuality'
  quality: string
}

type WorkerIncomingMessage =
  | InitMessage
  | UpdateGravityMessage
  | GeneratePlanetsMessage
  | UpdatePauseMessage
  | SetQualityMessage

// Типы сообщений от воркера к основному потоку
interface WorkerOutgoingMessage {
  type: 'planetsUpdate'
  planets: WorkerPlanetInfo[]
  fps: number
  removedPlanetIds: number[] // Список id удаленных планет
  updatedPlanetIds: number[] // Список id измененных планет
}

// Состояние воркера
const state: PhysicsWorkerState = {
  planets: [],
  gravityConst: 1000,
  paused: false,
  lastFrameTime: 0,
  performanceMonitor: new PerformanceMonitor(),
  nextPlanetId: 1,
}

// Инициализация
function init(gravityConst: number): void {
  state.gravityConst = gravityConst
  state.performanceMonitor = new PerformanceMonitor()
}

// Генерация планет
function generatePlanets(count: number): void {
  const planets = generateRandomPlanets(count)
  state.planets = planets.map((planet) => ({
    ...planet,
    id: state.nextPlanetId++,
    needUpdate: true,
  }))
}

// Обновление физики
function updatePhysics(deltaTime: number): {
  removedPlanetIds: number[]
  updatedPlanetIds: number[]
} {
  // Отслеживаем измененные и удаленные планеты
  const updatedPlanetIds: number[] = []

  // Мониторинг производительности
  state.performanceMonitor.startFrame()
  state.performanceMonitor.startPhysics()

  const forces = calculateAllGravitationalForces(
    state.planets,
    state.gravityConst,
  )

  // ШАГ 2: Обновляем позиции и скорости планет
  updatePlanetPositions(state.planets, forces, deltaTime)

  // ШАГ 3: Обрабатываем столкновения и слияния
  const planetsToRemove = processCollisionsAndMergers(
    state.planets,
    (planet1, planet2, distance) => {
      // При слиянии или изменении отмечаем планеты как обновленные
      const result = handlePlanetCollision(planet1, planet2, distance)
      // Проверяем, была ли планета обновлена
      if ((planet1 as WorkerPlanetInfo).needUpdate) {
        updatedPlanetIds.push((planet1 as WorkerPlanetInfo).id)
      }
      return result
    },
  )

  // ШАГ 4: Получаем список удаленных планет
  const removedPlanetIds: number[] = []
  planetsToRemove.forEach((_, index) => {
    removedPlanetIds.push(state.planets[index].id)
  })

  // Удаляем планеты из массива
  state.planets = state.planets.filter(
    (_, index) => !planetsToRemove.has(index),
  )

  // Завершаем измерение физики
  state.performanceMonitor.endPhysics()
  state.performanceMonitor.endRender() // В воркере нет рендеринга, но вызываем для корректности
  state.performanceMonitor.endFrame(state.planets.length, 0)

  // Качество не используется больше

  return {
    removedPlanetIds,
    updatedPlanetIds,
  }
}

// Главный цикл обновления
function startUpdateLoop(): void {
  const targetFrameTime = 1000 / 60 // 60 FPS (в мс)

  function update(): void {
    if (state.paused) {
      setTimeout(update, targetFrameTime)
      return
    }

    const now = performance.now()
    const deltaTime = 1 / 60
    //state.lastFrameTime === 0 ? 0.016 : (now - state.lastFrameTime) / 1000

    // Обновляем физику
    const { removedPlanetIds, updatedPlanetIds } = updatePhysics(deltaTime)

    // Отправляем обновленные данные в основной поток
    const performanceStats = state.performanceMonitor.getAverageStats()
    const message: WorkerOutgoingMessage = {
      type: 'planetsUpdate',
      planets: state.planets,
      fps: performanceStats.avgFps,

      removedPlanetIds,
      updatedPlanetIds,
    }
    postMessage(message)

    state.lastFrameTime = now

    // Рассчитываем сколько нужно подождать до следующего обновления
    const elapsedTime = performance.now() - now
    const waitTime = Math.max(0, targetFrameTime - elapsedTime)

    setTimeout(update, waitTime)
  }

  // Запускаем цикл обновления
  update()
}

// Обработчик сообщений от основного потока
self.addEventListener(
  'message',
  (event: MessageEvent<WorkerIncomingMessage>) => {
    const message = event.data

    switch (message.type) {
      case 'init':
        init(message.gravityConst)
        startUpdateLoop()
        break

      case 'updateGravity':
        state.gravityConst = message.gravityConst
        break

      case 'generatePlanets':
        generatePlanets(message.count)
        break

      case 'setPaused':
        state.paused = message.paused
        // Если возобновляем после паузы, обновляем lastFrameTime
        if (!state.paused) {
          state.lastFrameTime = performance.now()
        }
        break

      case 'setQuality':
        // Больше не используется
        break
    }
  },
)
