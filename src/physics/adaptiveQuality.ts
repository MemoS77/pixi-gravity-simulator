import { PlanetInfo } from '../types'
import { PerformanceMonitor } from '../utils/performanceMonitor'
import { 
  calculateAllGravitationalForces,
  calculateOptimizedGravitationalForces,
  calculateAdaptiveGravitationalForces
} from './index'

export enum QualityLevel {
  LOW = 'low',
  MEDIUM = 'medium', 
  HIGH = 'high',
  ULTRA = 'ultra'
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
      maxInteractionDistance: 800,
      minForceThreshold: 0.1,
      spatialGridEnabled: true,
      updateFrequency: 2 // Обновлять физику каждый 2-й кадр
    },
    [QualityLevel.MEDIUM]: {
      level: QualityLevel.MEDIUM,
      maxInteractionDistance: 1200,
      minForceThreshold: 0.05,
      spatialGridEnabled: true,
      updateFrequency: 1
    },
    [QualityLevel.HIGH]: {
      level: QualityLevel.HIGH,
      maxInteractionDistance: 1500,
      minForceThreshold: 0.01,
      spatialGridEnabled: true,
      updateFrequency: 1
    },
    [QualityLevel.ULTRA]: {
      level: QualityLevel.ULTRA,
      maxInteractionDistance: 2000,
      minForceThreshold: 0.001,
      spatialGridEnabled: false, // Полный расчет без оптимизаций
      updateFrequency: 1
    }
  }

  constructor(performanceMonitor: PerformanceMonitor) {
    this.performanceMonitor = performanceMonitor
  }

  /**
   * Вычисляет гравитационные силы с учетом текущего уровня качества
   */
  calculateForces(planets: PlanetInfo[], gravityConst: number): Array<{ fx: number; fy: number }> {
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
   * Расчет сил для низкого качества - только ближайшие соседи
   */
  private calculateLowQualityForces(planets: PlanetInfo[], gravityConst: number): Array<{ fx: number; fy: number }> {
    const forces = planets.map(() => ({ fx: 0, fy: 0 }))
    const settings = this.qualitySettings[QualityLevel.LOW]
    const maxDistSq = settings.maxInteractionDistance * settings.maxInteractionDistance

    for (let i = 0; i < planets.length; i++) {
      let interactionCount = 0
      const maxInteractions = 10 // Максимум 10 взаимодействий на объект

      for (let j = 0; j < planets.length; j++) {
        if (i === j || interactionCount >= maxInteractions) continue

        const dx = planets[j].position.x - planets[i].position.x
        const dy = planets[j].position.y - planets[i].position.y
        const distSq = dx * dx + dy * dy

        if (distSq > maxDistSq) continue

        // Простой расчет силы без вызова отдельной функции
        const distance = Math.sqrt(distSq)
        const force = (gravityConst * planets[i].mass * planets[j].mass) / distSq
        
        if (force < settings.minForceThreshold) continue

        const forceX = force * (dx / distance)
        const forceY = force * (dy / distance)

        forces[i].fx += forceX
        forces[i].fy += forceY

        interactionCount++
      }
    }

    return forces
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
    const levels = [QualityLevel.ULTRA, QualityLevel.HIGH, QualityLevel.MEDIUM, QualityLevel.LOW]
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
    const levels = [QualityLevel.LOW, QualityLevel.MEDIUM, QualityLevel.HIGH, QualityLevel.ULTRA]
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
