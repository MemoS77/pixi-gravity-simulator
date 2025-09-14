/**
 * Модуль для мониторинга производительности физических расчетов
 */

export interface PerformanceStats {
  fps: number
}

export class PerformanceMonitor {
  private lastFrameTime = 0
  private frameHistory: number[] = []
  private maxHistorySize = 60 // Хранить данные за последние 60 кадров

  /**
   * Начинает измерение времени кадра (для совместимости)
   */
  startFrame(): void {
    // Ничего не делаем, только для совместимости
  }

  /**
   * Начинает измерение физики (для совместимости)
   */
  startPhysics(): void {
    // Ничего не делаем, только для совместимости
  }

  /**
   * Заканчивает измерение физики (для совместимости)
   */
  endPhysics(): number {
    return 0
  }

  /**
   * Начинает измерение рендера (для совместимости)
   */
  startRender(): void {
    // Ничего не делаем, только для совместимости
  }

  /**
   * Заканчивает измерение рендера (для совместимости)
   */
  endRender(): number {
    return 0
  }

  /**
   * Отмечает начало нового кадра и возвращает FPS
   */
  recordFrame(): number {
    const currentTime = performance.now()

    // Если это не первый кадр
    if (this.lastFrameTime > 0) {
      const frameTime = currentTime - this.lastFrameTime
      this.frameHistory.push(frameTime)

      // Ограничиваем размер истории
      if (this.frameHistory.length > this.maxHistorySize) {
        this.frameHistory.shift()
      }
    }

    this.lastFrameTime = currentTime
    return this.getFPS()
  }

  /**
   * Вычисляет и возвращает текущий FPS на основе истории кадров
   * @returns текущий FPS
   */
  getFPS(): number {
    if (this.frameHistory.length === 0) {
      return 60 // По умолчанию 60 FPS
    }

    // Фильтруем некорректные значения (отрицательные или слишком большие)
    const validFrameTimes = this.frameHistory.filter(
      (time) => time > 0 && time <= 1000,
    )

    if (validFrameTimes.length === 0) {
      return 60
    }

    const avgFrameTime =
      validFrameTimes.reduce((sum, time) => sum + time, 0) /
      validFrameTimes.length

    if (avgFrameTime <= 0) {
      return 60
    }

    const fps = 1000 / avgFrameTime
    return Math.max(1, Math.min(240, fps))
  }

  /**
   * Для совместимости с существующим кодом
   */
  endFrame(objectCount = 0, interactionCount = 0): PerformanceStats {
    this.recordFrame()
    return this.getStats()
  }

  /**
   * Для совместимости с существующим кодом
   */
  getAverageStats() {
    const fps = this.getFPS()
    return {
      avgFrameTime: fps > 0 ? 1000 / fps : 16.67,
      avgFps: fps,
    }
  }

  /**
   * Возвращает текущие статистики производительности
   */
  getStats(objectCount = 0, interactionCount = 0): PerformanceStats {
    return {
      fps: this.getFPS(),
    }
  }

  /**
   * Сбрасывает все измерения
   */
  reset(): void {
    this.frameHistory = []
    this.lastFrameTime = 0
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
