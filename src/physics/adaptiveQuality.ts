import { PlanetInfo } from '../types'
import { PerformanceMonitor } from '../utils/performanceMonitor'
import { calculateAllGravitationalForces } from './index'

/**
 * Управление физическими расчетами
 */
export class AdaptiveQualityManager {
  private performanceMonitor: PerformanceMonitor

  constructor(performanceMonitor: PerformanceMonitor) {
    this.performanceMonitor = performanceMonitor
  }

  /**
   * Вычисляет гравитационные силы
   */
  calculateForces(
    planets: PlanetInfo[],
    gravityConst: number,
  ): Array<{ fx: number; fy: number }> {
    this.performanceMonitor.startPhysics()
    
    // Используем полный расчет гравитационных сил
    const forces = calculateAllGravitationalForces(planets, gravityConst)
    
    this.performanceMonitor.endPhysics()
    return forces
  }

  // Теперь мы используем только один алгоритм - полный расчет всех гравитационных взаимодействий

  /**
   * Получение статистики производительности
   */
  updateQuality(): void {
    // Метод оставлен для совместимости
  }

  /**
   * Получает текущий уровень качества (всегда HIGH по умолчанию)
   */
  getCurrentQuality(): string {
    return 'high'
  }

  /**
   * Устанавливает уровень качества вручную (не используется)
   */
  setQuality(quality: string): void {
    // Метод оставлен для совместимости
  }

  /**
   * Получает статистику производительности
   */
  getPerformanceStats() {
    return this.performanceMonitor.getAverageStats()
  }
}
