import { Application, Assets, Sprite } from 'pixi.js'
import { PlanetInfo } from '../types'
import { generateRandomPlanets } from '../utils/generateRandomPlanets'
import {
  applyBoundaryConditions,
  calculateGravitationalForce,
  calculateRadius,
  checkCollisions,
} from '../physics'

export class App extends Application {
  private planets: PlanetInfo[] = []
  private gravityConst = 1000

  async applyPlanets(): Promise<void> {
    this.planets.forEach((planet) => {
      if (!planet.sprite) return
      planet.sprite.position.set(planet.position.x, planet.position.y)
      planet.sprite.rotation = planet.rotationSpeed
    })
  }

  async loadPlanets(): Promise<void> {
    this.planets = generateRandomPlanets(100)

    const texture = await Assets.load('/assets/planet.png')
    this.planets.forEach((planet) => {
      const sprite = new Sprite(texture)
      sprite.anchor.set(0.5)
      sprite.position.set(planet.position.x, planet.position.y)
      sprite.width = calculateRadius(planet.mass, planet.density) * 2
      sprite.height = calculateRadius(planet.mass, planet.density) * 2
      sprite.rotation = planet.rotationSpeed
      sprite.position.set(planet.position.x, planet.position.y)
      this.stage.addChild(sprite)
      planet.sprite = sprite
    })
  }

  async run(): Promise<void> {
    console.log('run')
    await this.loadPlanets()
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

    // ШАГ 3 и 4: Создаем новые объекты планет с обновленными свойствами
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

    // ШАГ 5: Проверяем коллизии и поглощения
    //const planetsAfterCollisions = checkCollisions(this.planets)
    //this.planets = planetsAfterCollisions
    this.applyPlanets()
  }

  addTicker(): void {
    this.ticker.add((time) => {
      const deltaTime = time.deltaTime * 0.016
      this.updatePlanets(deltaTime)
    })
  }
}
