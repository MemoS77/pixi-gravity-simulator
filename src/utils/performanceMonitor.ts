/**
 * Модуль для мониторинга производительности физических расчетов
 */

export interface PerformanceStats {
  frameTime: number
  physicsTime: number
  renderTime: number
  objectCount: number
  interactionCount: number
  fps: number
}

export class PerformanceMonitor {
  private frameStartTime = 0
  private physicsStartTime = 0
  private renderStartTime = 0
  private physicsTime = 0
  private renderTime = 0
  private frameHistory: number[] = []
  private maxHistorySize = 60 // Хранить данные за последние 60 кадров

  /**
   * Начинает измерение времени кадра
   */
  startFrame(): void {
    this.frameStartTime = performance.now()
  }

  /**
   * Начинает измерение времени физических расчетов
   */
  startPhysics(): void {
    this.physicsStartTime = performance.now()
  }

  /**
   * Заканчивает измерение времени физических расчетов
   */
  endPhysics(): number {
    this.physicsTime = performance.now() - this.physicsStartTime
    return this.physicsTime
  }

  /**
   * Начинает измерение времени рендеринга
   */
  startRender(): void {
    this.renderStartTime = performance.now()
  }

  /**
   * Заканчивает измерение времени рендеринга
   */
  endRender(): number {
    this.renderTime = performance.now() - this.renderStartTime
    return this.renderTime
  }

  /**
   * Заканчивает измерение времени кадра и возвращает статистику
   */
  endFrame(objectCount: number, interactionCount: number): PerformanceStats {
    const frameTime = performance.now() - this.frameStartTime
    
    // Добавляем время кадра в историю
    this.frameHistory.push(frameTime)
    if (this.frameHistory.length > this.maxHistorySize) {
      this.frameHistory.shift()
    }

    // Вычисляем средний FPS
    const avgFrameTime = this.frameHistory.reduce((sum, time) => sum + time, 0) / this.frameHistory.length
    const fps = 1000 / avgFrameTime

    return {
      frameTime,
      physicsTime: this.physicsTime,
      renderTime: this.renderTime,
      objectCount,
      interactionCount,
      fps: Math.round(fps * 10) / 10
    }
  }

  /**
   * Получает среднюю статистику за последние кадры
   */
  getAverageStats(): { avgFrameTime: number; avgFps: number } {
    if (this.frameHistory.length === 0) {
      return { avgFrameTime: 16.67, avgFps: 60 } // По умолчанию 60 FPS
    }

    const avgFrameTime = this.frameHistory.reduce((sum, time) => sum + time, 0) / this.frameHistory.length
    const avgFps = avgFrameTime > 0 ? 1000 / avgFrameTime : 60

    return {
      avgFrameTime: Math.round(avgFrameTime * 100) / 100,
      avgFps: Math.round(avgFps * 10) / 10
    }
  }

  /**
   * Определяет, нужно ли снизить качество для поддержания производительности
   */
  shouldReduceQuality(): boolean {
    const stats = this.getAverageStats()
    return stats.avgFps < 30 // Если FPS ниже 30, рекомендуем снизить качество
  }

  /**
   * Определяет, можно ли повысить качество
   */
  canIncreaseQuality(): boolean {
    const stats = this.getAverageStats()
    return stats.avgFps > 50 // Если FPS выше 50, можно повысить качество
  }
}
