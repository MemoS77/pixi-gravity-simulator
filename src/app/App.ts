import { Application, Graphics } from 'pixi.js'
import { PlanetInfo } from '../types'
import { generateRandomPlanets } from '../utils/generateRandomPlanets'
import {
  applyBoundaryConditions,
  calculateGravitationalForce,
  calculateRadius,
} from '../physics'
import { classifyBody } from '../utils/classify'
import {
  UNIVERSE_WIDTH,
  UNIVERSE_HEIGHT,
  DEFAULT_PLANETS_COUNT,
} from '../constants/universe'

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
  private zoom = 1
  private cameraX = 0
  private cameraY = 0
  private onChangeCallback?: AppChangeCallback
  private worldBorder?: Graphics

  constructor(onChangeCallback?: AppChangeCallback) {
    super()
    this.onChangeCallback = onChangeCallback
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
    const forces = this.planets.map(() => ({ fx: 0, fy: 0 }))

    // Вычисляем гравитационные силы между всеми парами планет
    for (let i = 0; i < this.planets.length; i++) {
      for (let j = i + 1; j < this.planets.length; j++) {
        const force = calculateGravitationalForce(
          this.planets[i],
          this.planets[j],
          this.gravityConst,
        )

        // Применяем силу к первой планете (притяжение ко второй)
        forces[i].fx += force.fx
        forces[i].fy += force.fy

        // Применяем противоположную силу ко второй планете (третий закон Ньютона)
        forces[j].fx -= force.fx
        forces[j].fy -= force.fy
      }
    }

    // ШАГ 2: Рассчитываем ускорения для всех планет
    const accelerations = forces.map((force, index) => ({
      ax: force.fx / this.planets[index].mass,
      ay: force.fy / this.planets[index].mass,
    }))

    this.planets.forEach((planet, index) => {
      const { ax, ay } = accelerations[index]

      // Обновляем скорость: v = v0 + at
      let newSpeedX = planet.speed.x + ax * deltaTime
      let newSpeedY = planet.speed.y + ay * deltaTime

      // Обновляем позицию: x = x0 + vt
      let newPositionX = planet.position.x + newSpeedX * deltaTime
      let newPositionY = planet.position.y + newSpeedY * deltaTime

      // Применяем граничные условия
      const boundaryResult = applyBoundaryConditions(
        { x: newPositionX, y: newPositionY },
        { x: newSpeedX, y: newSpeedY },
      )

      newPositionX = boundaryResult.position.x
      newPositionY = boundaryResult.position.y
      newSpeedX = boundaryResult.speed.x
      newSpeedY = boundaryResult.speed.y

      // Возвращаем новый объект планеты
      planet.speed = { x: newSpeedX, y: newSpeedY }
      planet.position = { x: newPositionX, y: newPositionY }
    })

    // ШАГ 5: Поглощение, если приблизились слишком близко
    const needRemove: Map<number, boolean> = new Map()

    for (let i = 0; i < this.planets.length; i++) {
      if (needRemove.has(i)) continue
      for (let j = i + 1; j < this.planets.length; j++) {
        if (needRemove.has(j)) continue
        const distance = Math.sqrt(
          Math.pow(this.planets[i].position.x - this.planets[j].position.x, 2) +
            Math.pow(
              this.planets[i].position.y - this.planets[j].position.y,
              2,
            ),
        )

        const glueDistance = Math.min(
          this.planets[i].radius,
          this.planets[j].radius,
        )

        if (distance <= glueDistance) {
          const middlePoint = {
            x: (this.planets[i].position.x + this.planets[j].position.x) / 2,
            y: (this.planets[i].position.y + this.planets[j].position.y) / 2,
          }
          // Склеиваем и перевычиляем радиус, переклассифицируем с новой плотностью и цветом
          const mergedMass = this.planets[i].mass + this.planets[j].mass
          const { color, density } = classifyBody(mergedMass)
          const mergedRadius = calculateRadius(mergedMass, density)

          // Сложить векторно скорость с учетом масс
          const speed = {
            x:
              (this.planets[i].speed.x * this.planets[i].mass +
                this.planets[j].speed.x * this.planets[j].mass) /
              mergedMass,
            y:
              (this.planets[i].speed.y * this.planets[i].mass +
                this.planets[j].speed.y * this.planets[j].mass) /
              mergedMass,
          }

          this.planets[i].mass = mergedMass
          this.planets[i].density = density
          this.planets[i].color = color
          this.planets[i].radius = mergedRadius
          this.planets[i].position = middlePoint
          this.planets[i].speed = speed
          this.planets[i].needUpdate = true
          needRemove.set(j, true)
        }

        // Объекты касаются друг друга - реализуем столкновение
        else if (distance < this.planets[i].radius + this.planets[j].radius) {
          this.handleCollision(this.planets[i], this.planets[j], distance)
        }
      }
    }

    // Удаляем спрайты

    if (needRemove.size > 0) {
      needRemove.forEach((_, index) => {
        this.planets[index].graphics?.destroy()
      })

      this.planets = this.planets.filter((_, index) => !needRemove.has(index))
    }

    this.applyPlanets()
    this.notifyChange()
  }

  private notifyChange(): void {
    if (this.onChangeCallback) {
      this.onChangeCallback({
        planets: this.planets,
        zoom: this.zoom,
        camera: { x: this.cameraX, y: this.cameraY },
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
    this.zoom = Math.max(0.1, Math.min(10, zoom)) // Ограничиваем zoom от 0.1 до 10
    this.applyCameraTransform()
    this.notifyChange()
  }

  setCamera(x: number, y: number): void {
    this.cameraX = x
    this.cameraY = y
    this.applyCameraTransform()
    this.notifyChange()
  }

  moveCamera(deltaX: number, deltaY: number): void {
    this.cameraX += deltaX
    this.cameraY += deltaY
    this.applyCameraTransform()
    this.notifyChange()
  }

  getZoom(): number {
    return this.zoom
  }

  getCamera(): { x: number; y: number } {
    return { x: this.cameraX, y: this.cameraY }
  }

  private applyCameraTransform(): void {
    this.stage.scale.set(this.zoom)
    this.stage.position.set(
      -this.cameraX * this.zoom,
      -this.cameraY * this.zoom,
    )
  }

  private createWorldBorder(): void {
    this.worldBorder = new Graphics()

    // Рисуем красную рамку по границе мира
    this.worldBorder.rect(0, 0, UNIVERSE_WIDTH, UNIVERSE_HEIGHT)
    this.worldBorder.stroke({ color: 0xff0000, width: 5 })

    // Добавляем рамку на задний план (под планеты)
    this.stage.addChildAt(this.worldBorder, 0)
  }

  private handleCollision(
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
    const restitution = 0.2 //0.8

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

    // Разделяем объекты, чтобы они не пересекались
    const overlap = planet1.radius + planet2.radius - distance
    if (overlap > 0) {
      const separationX = normalX * overlap * 0.5
      const separationY = normalY * overlap * 0.5

      planet1.position.x -= separationX
      planet1.position.y -= separationY
      planet2.position.x += separationX
      planet2.position.y += separationY
    }

    // Применяем трение для постепенной остановки
    const frictionCoeff = 0.03
    planet1.speed.x *= 1 - frictionCoeff
    planet1.speed.y *= 1 - frictionCoeff
    planet2.speed.x *= 1 - frictionCoeff
    planet2.speed.y *= 1 - frictionCoeff
  }
}
