import { Application, Graphics } from 'pixi.js'
import { PlanetInfo } from '../types'
import {
  UNIVERSE_WIDTH,
  UNIVERSE_HEIGHT,
  DEFAULT_PLANETS_COUNT,
} from '../constants/universe'
import { CameraManager } from './CameraManager'
import { QualityLevel } from '../physics'
import { PhysicsWorkerManager } from '../workers/PhysicsWorkerManager'

export interface AppChangeCallback {
  (data: {
    planets: PlanetInfo[]
    zoom: number
    camera: { x: number; y: number }
    fps?: number
    qualityLevel?: QualityLevel
  }): void
}

export class App extends Application {
  private planetsMap: Map<number, PlanetInfo> = new Map<number, PlanetInfo>()
  private gravityConst = 1000
  private onChangeCallback?: AppChangeCallback
  private worldBorder?: Graphics
  private cameraManager: CameraManager
  private physicsWorker: PhysicsWorkerManager
  private isPaused: boolean = false
  private wasUpdated: boolean = false

  constructor(onChangeCallback?: AppChangeCallback) {
    super()
    this.onChangeCallback = onChangeCallback
    this.cameraManager = new CameraManager(this.stage, () =>
      this.notifyChange(),
    )

    // Создаем менеджер физического воркера и передаем ссылку на Map
    this.physicsWorker = new PhysicsWorkerManager(
      this.stage,
      this.planetsMap,
      this.handlePhysicsUpdate.bind(this),
    )
  }

  setGravityConst(gravityConst: number): void {
    this.gravityConst = gravityConst
    this.physicsWorker.setGravityConst(gravityConst)
  }

  applyPlanets(): void {
    this.planetsMap.forEach((planet) => {
      if (!planet.graphics) return
      planet.graphics.position.set(planet.position.x, planet.position.y)
      if (planet.needUpdate) {
        planet.graphics.clear()
        planet.graphics.circle(0, 0, planet.radius)
        planet.graphics.fill(planet.color)
        planet.graphics.stroke({ color: 0xffffff, width: 1 })
        planet.needUpdate = false
      }
    })
  }

  loadPlanets(planetsCount: number): void {
    // Генерируем планеты в воркере
    this.physicsWorker.generatePlanets(planetsCount)
  }

  restart(planetsCount: number): void {
    this.planetsMap.clear()
    this.stage.removeChildren()
    this.createWorldBorder()
    this.loadPlanets(planetsCount)
  }

  async run(): Promise<void> {
    // Инициализируем воркер
    this.physicsWorker.init(this.gravityConst)

    this.restart(DEFAULT_PLANETS_COUNT)
    this.addTicker()
  }

  /**
   * Обработка обновления физики от воркера
   */
  private handlePhysicsUpdate(data: {
    fps: number
    qualityLevel: QualityLevel
  }): void {
    // Планеты уже обновлены в нашем Map через ссылку
    //this.applyPlanets()
    // Обновляем UI через колбэк
    this.wasUpdated = true
    this.notifyChange(data.fps, data.qualityLevel)
  }

  /**
   * Пауза/возобновление симуляции
   */
  togglePause(): void {
    this.isPaused = !this.isPaused
    this.physicsWorker.setPaused(this.isPaused)
  }

  /**
   * Проверка статуса паузы
   */
  getPauseStatus(): boolean {
    return this.isPaused
  }

  private notifyChange(fps?: number, qualityLevel?: QualityLevel): void {
    if (this.onChangeCallback) {
      this.onChangeCallback({
        planets: Array.from(this.planetsMap.values()),
        zoom: this.cameraManager.getZoom(),
        camera: this.cameraManager.getCamera(),
        fps,
        qualityLevel,
      })
    }
  }

  addTicker(): void {
    this.ticker.add(() => {
      if (!this.wasUpdated) return
      this.wasUpdated = false
      // Только синхронизация графики с данными из воркера
      this.applyPlanets()
    })
  }

  // Методы управления камерой
  setZoom(zoom: number): void {
    this.cameraManager.setZoom(zoom)
  }

  setCamera(x: number, y: number): void {
    this.cameraManager.setCamera(x, y)
  }

  moveCamera(deltaX: number, deltaY: number): void {
    this.cameraManager.moveCamera(deltaX, deltaY)
  }

  getZoom(): number {
    return this.cameraManager.getZoom()
  }

  getCamera(): { x: number; y: number } {
    return this.cameraManager.getCamera()
  }

  // Методы управления качеством
  setQuality(quality: QualityLevel): void {
    this.physicsWorker.setQuality(quality)
  }

  getCurrentQuality(): QualityLevel {
    // Получаем из последнего обновления от воркера через колбэк
    return QualityLevel.HIGH // Значение по умолчанию, будет заменено актуальным из воркера
  }

  private createWorldBorder(): void {
    this.worldBorder = new Graphics()

    // Рисуем красную рамку по границе мира
    this.worldBorder.rect(0, 0, UNIVERSE_WIDTH, UNIVERSE_HEIGHT)
    this.worldBorder.stroke({ color: 0xff0000, width: 5 })

    // Добавляем рамку на задний план (под планеты)
    this.stage.addChildAt(this.worldBorder, 0)
  }
}
