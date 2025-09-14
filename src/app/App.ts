import { Application, Graphics } from 'pixi.js'
import { PlanetInfo } from '../types'
import { generateRandomPlanets } from '../utils/generateRandomPlanets'
import {
  calculateAllGravitationalForces,
  updatePlanetPositions,
  processCollisionsAndMergers,
  handlePlanetCollision,
} from '../physics'
import {
  UNIVERSE_WIDTH,
  UNIVERSE_HEIGHT,
  DEFAULT_PLANETS_COUNT,
} from '../constants/universe'
import { CameraManager } from './CameraManager'

export interface AppChangeCallback {
  (data: {
    planets: PlanetInfo[]
    zoom: number
    camera: { x: number; y: number }
  }): void
}

export class App extends Application {
  private planets: PlanetInfo[] = []
  private gravityConst = 1000
  private onChangeCallback?: AppChangeCallback
  private worldBorder?: Graphics
  private cameraManager: CameraManager

  constructor(onChangeCallback?: AppChangeCallback) {
    super()
    this.onChangeCallback = onChangeCallback
    this.cameraManager = new CameraManager(this.stage, () => this.notifyChange())
  }

  setGravityConst(gravityConst: number): void {
    this.gravityConst = gravityConst
  }

  applyPlanets(): void {
    this.planets.forEach((planet) => {
      if (!planet.graphics) return
      planet.graphics.position.set(planet.position.x, planet.position.y)
      if (planet.needUpdate) {
        planet.graphics.clear()
        planet.graphics.circle(0, 0, planet.radius)
        planet.graphics.fill(planet.color)
        planet.graphics.stroke({ color: 0xffffff, width: 1 })
      }
      planet.needUpdate = false
    })
  }

  loadPlanets(planetsCount: number): void {
    this.planets = generateRandomPlanets(planetsCount)

    this.planets.forEach((planet) => {
      const graphics = new Graphics()
      this.stage.addChild(graphics)
      planet.graphics = graphics
      planet.needUpdate = true
    })

    this.applyPlanets()
  }

  restart(planetsCount: number): void {
    this.planets = []
    this.stage.removeChildren()
    this.createWorldBorder()
    this.loadPlanets(planetsCount)
  }

  run(): void {
    this.restart(DEFAULT_PLANETS_COUNT)
    this.addTicker()
  }

  updatePlanets(deltaTime: number): void {
    // ШАГ 1: Рассчитываем все гравитационные силы
    const forces = calculateAllGravitationalForces(this.planets, this.gravityConst)

    // ШАГ 2: Обновляем позиции и скорости планет
    updatePlanetPositions(this.planets, forces, deltaTime)

    // ШАГ 3: Обрабатываем столкновения и слияния
    const planetsToRemove = processCollisionsAndMergers(this.planets, handlePlanetCollision)

    // ШАГ 4: Удаляем поглощенные планеты
    this.removePlanets(planetsToRemove)

    // ШАГ 5: Применяем изменения и уведомляем об обновлении
    this.applyPlanets()
    this.notifyChange()
  }



  /**
   * Удаляет планеты из массива и уничтожает их графические объекты
   * @param planetsToRemove Map с индексами планет для удаления
   */
  private removePlanets(planetsToRemove: Map<number, boolean>): void {
    if (planetsToRemove.size > 0) {
      // Уничтожаем графические объекты
      planetsToRemove.forEach((_, index) => {
        this.planets[index].graphics?.destroy()
      })

      // Удаляем планеты из массива
      this.planets = this.planets.filter((_, index) => !planetsToRemove.has(index))
    }
  }

  private notifyChange(): void {
    if (this.onChangeCallback) {
      this.onChangeCallback({
        planets: this.planets,
        zoom: this.cameraManager.getZoom(),
        camera: this.cameraManager.getCamera(),
      })
    }
  }

  addTicker(): void {
    this.ticker.add((time) => {
      const deltaTime = time.deltaTime * 0.016
      this.updatePlanets(deltaTime)
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

  private createWorldBorder(): void {
    this.worldBorder = new Graphics()

    // Рисуем красную рамку по границе мира
    this.worldBorder.rect(0, 0, UNIVERSE_WIDTH, UNIVERSE_HEIGHT)
    this.worldBorder.stroke({ color: 0xff0000, width: 5 })

    // Добавляем рамку на задний план (под планеты)
    this.stage.addChildAt(this.worldBorder, 0)
  }


}
