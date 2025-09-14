import { PlanetInfo } from '../types'
import { PerformanceMonitor } from '../utils/performanceMonitor'
import {
  calculateAllGravitationalForces,
  calculateOptimizedGravitationalForces,
  calculateAdaptiveGravitationalForces,
} from './index'

export enum QualityLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  ULTRA = 'ultra',
}

export interface QualitySettings {
  level: QualityLevel
  maxInteractionDistance: number
  minForceThreshold: number
  spatialGridEnabled: boolean
  updateFrequency: number // Каждый N-й кадр обновлять физику
}

/**
 * Адаптивная система управления качеством физических расчетов
 */
export class AdaptiveQualityManager {
  private currentQuality: QualityLevel = QualityLevel.MEDIUM
  private performanceMonitor: PerformanceMonitor
  private frameCounter = 0
  private lastQualityChange = 0
  private readonly qualityChangeDelay = 120 // Минимум 2 секунды между изменениями качества

  private qualitySettings: Record<QualityLevel, QualitySettings> = {
    [QualityLevel.LOW]: {
      level: QualityLevel.LOW,
      maxInteractionDistance: 1200, // Увеличиваем для лучшей точности
      minForceThreshold: 0.02, // Порог для разделения на точные/аппроксимированные
      spatialGridEnabled: true,
      updateFrequency: 1, // Обновляем каждый кадр с аппроксимацией
    },
    [QualityLevel.MEDIUM]: {
      level: QualityLevel.MEDIUM,
      maxInteractionDistance: 1200,
      minForceThreshold: 0.05,
      spatialGridEnabled: true,
      updateFrequency: 1,
    },
    [QualityLevel.HIGH]: {
      level: QualityLevel.HIGH,
      maxInteractionDistance: 1500,
      minForceThreshold: 0.01,
      spatialGridEnabled: true,
      updateFrequency: 1,
    },
    [QualityLevel.ULTRA]: {
      level: QualityLevel.ULTRA,
      maxInteractionDistance: 2000,
      minForceThreshold: 0.001,
      spatialGridEnabled: false, // Полный расчет без оптимизаций
      updateFrequency: 1,
    },
  }

  constructor(performanceMonitor: PerformanceMonitor) {
    this.performanceMonitor = performanceMonitor
  }

  /**
   * Вычисляет гравитационные силы с учетом текущего уровня качества
   */
  calculateForces(
    planets: PlanetInfo[],
    gravityConst: number,
  ): Array<{ fx: number; fy: number }> {
    this.frameCounter++

    const settings = this.qualitySettings[this.currentQuality]

    // Пропускаем физические расчеты если нужно (для экономии производительности)
    if (this.frameCounter % settings.updateFrequency !== 0) {
      return planets.map(() => ({ fx: 0, fy: 0 }))
    }

    // Выбираем алгоритм в зависимости от уровня качества
    switch (this.currentQuality) {
      case QualityLevel.LOW:
        return this.calculateLowQualityForces(planets, gravityConst)

      case QualityLevel.MEDIUM:
        return calculateOptimizedGravitationalForces(planets, gravityConst)

      case QualityLevel.HIGH:
        return calculateAdaptiveGravitationalForces(planets, gravityConst)

      case QualityLevel.ULTRA:
        return calculateAllGravitationalForces(planets, gravityConst)

      default:
        return calculateAdaptiveGravitationalForces(planets, gravityConst)
    }
  }

  /**
   * Расчет сил для низкого качества - физически корректная аппроксимация
   */
  private calculateLowQualityForces(
    planets: PlanetInfo[],
    gravityConst: number,
  ): Array<{ fx: number; fy: number }> {
    const forces = planets.map(() => ({ fx: 0, fy: 0 }))
    const settings = this.qualitySettings[QualityLevel.LOW]
    const maxDistSq =
      settings.maxInteractionDistance * settings.maxInteractionDistance
    const maxDirectInteractions = 15 // Максимум точных взаимодействий

    for (let i = 0; i < planets.length; i++) {
      const currentPlanet = planets[i]

      // Разделяем взаимодействия на точные и аппроксимированные
      const directInteractions: Array<{
        index: number
        forceX: number
        forceY: number
        priority: number
      }> = []

      const distantObjects: Array<{
        mass: number
        x: number
        y: number
      }> = []

      for (let j = 0; j < planets.length; j++) {
        if (i === j) continue

        const otherPlanet = planets[j]
        const dx = otherPlanet.position.x - currentPlanet.position.x
        const dy = otherPlanet.position.y - currentPlanet.position.y
        const distSq = dx * dx + dy * dy

        if (distSq > maxDistSq) continue

        const distance = Math.sqrt(distSq)
        const force =
          (gravityConst * currentPlanet.mass * otherPlanet.mass) / distSq

        if (force < settings.minForceThreshold) {
          // Не игнорируем, а сохраняем для аппроксимации
          distantObjects.push({
            mass: otherPlanet.mass,
            x: otherPlanet.position.x,
            y: otherPlanet.position.y,
          })
          continue
        }

        const forceX = force * (dx / distance)
        const forceY = force * (dy / distance)
        const priority = force / distance

        directInteractions.push({
          index: j,
          forceX,
          forceY,
          priority,
        })
      }

      // Применяем самые сильные взаимодействия точно
      directInteractions.sort((a, b) => b.priority - a.priority)
      const topInteractions = directInteractions.slice(0, maxDirectInteractions)

      for (const interaction of topInteractions) {
        forces[i].fx += interaction.forceX
        forces[i].fy += interaction.forceY
      }

      // Аппроксимируем слабые взаимодействия через центр масс
      if (distantObjects.length > 0) {
        const approximateForce = this.calculateCenterOfMassApproximation(
          currentPlanet,
          distantObjects,
          gravityConst,
        )
        forces[i].fx += approximateForce.fx
        forces[i].fy += approximateForce.fy
      }
    }

    return forces
  }

  /**
   * Аппроксимация слабых взаимодействий через центр масс
   */
  private calculateCenterOfMassApproximation(
    currentPlanet: PlanetInfo,
    distantObjects: Array<{ mass: number; x: number; y: number }>,
    gravityConst: number,
  ): { fx: number; fy: number } {
    if (distantObjects.length === 0) {
      return { fx: 0, fy: 0 }
    }

    // Вычисляем центр масс всех далеких объектов
    let totalMass = 0
    let centerX = 0
    let centerY = 0

    for (const obj of distantObjects) {
      totalMass += obj.mass
      centerX += obj.x * obj.mass
      centerY += obj.y * obj.mass
    }

    centerX /= totalMass
    centerY /= totalMass

    // Рассчитываем силу от эквивалентного объекта в центре масс
    const dx = centerX - currentPlanet.position.x
    const dy = centerY - currentPlanet.position.y
    const distSq = dx * dx + dy * dy

    if (distSq === 0) return { fx: 0, fy: 0 }

    const distance = Math.sqrt(distSq)
    const force = (gravityConst * currentPlanet.mass * totalMass) / distSq

    // Применяем коэффициент аппроксимации (0.3 - консервативно)
    const approximationFactor = 0.3

    return {
      fx: force * (dx / distance) * approximationFactor,
      fy: force * (dy / distance) * approximationFactor,
    }
  }

  /**
   * Обновляет уровень качества на основе производительности
   */
  updateQuality(): void {
    // Не меняем качество слишком часто
    if (this.frameCounter - this.lastQualityChange < this.qualityChangeDelay) {
      return
    }

    const shouldReduce = this.performanceMonitor.shouldReduceQuality()
    const canIncrease = this.performanceMonitor.canIncreaseQuality()

    if (shouldReduce && this.currentQuality !== QualityLevel.LOW) {
      this.reduceQuality()
      this.lastQualityChange = this.frameCounter
    } else if (canIncrease && this.currentQuality !== QualityLevel.ULTRA) {
      this.increaseQuality()
      this.lastQualityChange = this.frameCounter
    }
  }

  /**
   * Понижает уровень качества
   */
  private reduceQuality(): void {
    const levels = [
      QualityLevel.ULTRA,
      QualityLevel.HIGH,
      QualityLevel.MEDIUM,
      QualityLevel.LOW,
    ]
    const currentIndex = levels.indexOf(this.currentQuality)

    if (currentIndex < levels.length - 1) {
      this.currentQuality = levels[currentIndex + 1]
      console.log(`Качество понижено до: ${this.currentQuality}`)
    }
  }

  /**
   * Повышает уровень качества
   */
  private increaseQuality(): void {
    const levels = [
      QualityLevel.LOW,
      QualityLevel.MEDIUM,
      QualityLevel.HIGH,
      QualityLevel.ULTRA,
    ]
    const currentIndex = levels.indexOf(this.currentQuality)

    if (currentIndex < levels.length - 1) {
      this.currentQuality = levels[currentIndex + 1]
      console.log(`Качество повышено до: ${this.currentQuality}`)
    }
  }

  /**
   * Получает текущий уровень качества
   */
  getCurrentQuality(): QualityLevel {
    return this.currentQuality
  }

  /**
   * Устанавливает уровень качества вручную
   */
  setQuality(quality: QualityLevel): void {
    this.currentQuality = quality
    this.lastQualityChange = this.frameCounter
  }

  /**
   * Получает настройки текущего уровня качества
   */
  getCurrentSettings(): QualitySettings {
    return this.qualitySettings[this.currentQuality]
  }
}
