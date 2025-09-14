import { PlanetInfo } from '../types'
import { PerformanceMonitor } from '../utils/performanceMonitor'
import {
  calculateAllGravitationalForces,
  calculateAdaptiveGravitationalForces,
} from './index'

export enum QualityLevel {
  LOW = 'low',
  HIGH = 'high',
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
  private currentQuality: QualityLevel = QualityLevel.HIGH
  private performanceMonitor: PerformanceMonitor
  private frameCounter = 0
  private lastQualityChange = 0
  private readonly qualityChangeDelay = 120 // Минимум 2 секунды между изменениями качества

  private qualitySettings: Record<QualityLevel, QualitySettings> = {
    [QualityLevel.LOW]: {
      level: QualityLevel.LOW,
      maxInteractionDistance: 1500, // Расстояние для адаптивного алгоритма
      minForceThreshold: 0.01,
      spatialGridEnabled: true,
      updateFrequency: 1,
    },
    [QualityLevel.HIGH]: {
      level: QualityLevel.HIGH,
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
        return calculateAdaptiveGravitationalForces(planets, gravityConst)

      case QualityLevel.HIGH:
        return calculateAllGravitationalForces(planets, gravityConst)

      default:
        return calculateAdaptiveGravitationalForces(planets, gravityConst)
    }
  }

  // Мы удалили расчет для низкого качества и теперь используем только два алгоритма:
  // LOW: calculateAdaptiveGravitationalForces - адаптивный алгоритм с оптимизациями
  // HIGH: calculateAllGravitationalForces - полный расчет без оптимизаций

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
    } else if (canIncrease && this.currentQuality !== QualityLevel.HIGH) {
      this.increaseQuality()
      this.lastQualityChange = this.frameCounter
    }
  }

  /**
   * Понижает уровень качества
   */
  private reduceQuality(): void {
    if (this.currentQuality !== QualityLevel.LOW) {
      this.currentQuality = QualityLevel.LOW
      console.log(`Качество понижено до: ${this.currentQuality}`)
    }
  }

  /**
   * Повышает уровень качества
   */
  private increaseQuality(): void {
    if (this.currentQuality !== QualityLevel.HIGH) {
      this.currentQuality = QualityLevel.HIGH
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
