import { Graphics, Container } from 'pixi.js'
import { PlanetInfo } from '../types'

// Тип планеты в воркере (без ссылки на Graphics)
type WorkerPlanetInfo = Omit<PlanetInfo, 'graphics'>

// Типы исходящих сообщений (к воркеру)
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

interface SetQualityMessage {
  type: 'setQuality'
  quality: string
}

// Типы входящих сообщений (от воркера)
interface PlanetsUpdateMessage {
  type: 'planetsUpdate'
  planets: WorkerPlanetInfo[]
  fps: number
  removedPlanetIds: number[]
  updatedPlanetIds: number[]
}

// Колбэк для обновления данных из воркера
export interface PhysicsUpdateCallback {
  (data: { fps: number }): void
}

export class PhysicsWorkerManager {
  private worker: Worker
  private onUpdate: PhysicsUpdateCallback
  private paused: boolean = false
  private stage: Container
  private planetsMap: Map<number, PlanetInfo> // Используем внешний Map из App

  constructor(
    stage: Container,
    planetsMap: Map<number, PlanetInfo>,
    onUpdate: PhysicsUpdateCallback,
  ) {
    this.stage = stage
    this.onUpdate = onUpdate
    this.planetsMap = planetsMap
    this.worker = new Worker(new URL('./physics.worker.ts', import.meta.url), {
      type: 'module',
    })
    this.setupWorkerListeners()
  }

  /**
   * Инициализация воркера
   */
  init(gravityConst: number): void {
    this.sendToWorker<InitMessage>({
      type: 'init',
      gravityConst,
    })
  }

  /**
   * Установка константы гравитации
   */
  setGravityConst(gravityConst: number): void {
    this.sendToWorker<UpdateGravityMessage>({
      type: 'updateGravity',
      gravityConst,
    })
  }

  /**
   * Генерация новых планет
   */
  generatePlanets(count: number): void {
    // Очищаем старые данные
    this.clearPlanets()

    this.sendToWorker<GeneratePlanetsMessage>({
      type: 'generatePlanets',
      count,
    })
  }

  /**
   * Установка паузы/возобновления симуляции
   */
  setPaused(paused: boolean): void {
    this.paused = paused
    this.sendToWorker<UpdatePauseMessage>({
      type: 'setPaused',
      paused,
    })
  }

  /**
   * Установка качества симуляции (больше не используется)
   */
  setQuality(quality: string): void {
    // Метод оставлен для совместимости
    this.sendToWorker<SetQualityMessage>({
      type: 'setQuality',
      quality,
    })
  }

  /**
   * Очистка всех данных планет
   */
  private clearPlanets(): void {
    // Удаляем графические объекты
    this.planetsMap.forEach((planet) => {
      if (planet.graphics) {
        planet.graphics.destroy()
      }
    })

    // Очищаем коллекцию
    this.planetsMap.clear()
  }

  /**
   * Настройка слушателей событий от воркера
   */
  private setupWorkerListeners(): void {
    this.worker.addEventListener('message', (event: MessageEvent) => {
      const message = event.data

      if (message.type === 'planetsUpdate') {
        this.handlePlanetsUpdate(message)
      }
    })
  }

  /**
   * Обработка обновлений планет из воркера
   */
  private handlePlanetsUpdate(message: PlanetsUpdateMessage): void {
    console.log(message)
    // Удаление планет, которые были поглощены
    message.removedPlanetIds.forEach((id) => {
      const planet = this.planetsMap.get(id)
      if (planet && planet.graphics) {
        planet.graphics.destroy()
      }
      this.planetsMap.delete(id)
    })

    // Обновление или добавление планет
    message.planets.forEach((workerPlanet) => {
      let planet = this.planetsMap.get(workerPlanet.id)

      // Если планета новая, создаем графику для нее
      if (!planet) {
        // Создаем новую графику
        const graphics = new Graphics()

        // Добавляем графику на сцену
        this.stage.addChild(graphics)

        planet = {
          ...workerPlanet,
          graphics,
          needUpdate: true,
        }
        this.planetsMap.set(workerPlanet.id, planet)
      } else {
        // Обновляем существующую планету
        planet.position = workerPlanet.position
        planet.speed = workerPlanet.speed
        planet.mass = workerPlanet.mass
        planet.radius = workerPlanet.radius
        planet.color = workerPlanet.color
        planet.density = workerPlanet.density

        // Отмечаем необходимость обновления графики, если планета была изменена
        const needsGraphicsUpdate =
          message.updatedPlanetIds.includes(workerPlanet.id) ||
          workerPlanet.needUpdate

        if (needsGraphicsUpdate) {
          planet.needUpdate = true
        }
      }
    })

    // Вызываем колбэк обновления только с метриками
    this.onUpdate({
      fps: message.fps,
    })
  }

  /**
   * Отправка сообщения в воркер
   */
  private sendToWorker<T>(message: T): void {
    this.worker.postMessage(message)
  }

  /**
   * Получение текущих планет
   */
  getPlanets(): PlanetInfo[] {
    return Array.from(this.planetsMap.values())
  }

  /**
   * Проверка статуса паузы
   */
  isPaused(): boolean {
    return this.paused
  }

  /**
   * Уничтожение менеджера и воркера
   */
  destroy(): void {
    this.worker.terminate()
    this.clearPlanets()
  }
}
