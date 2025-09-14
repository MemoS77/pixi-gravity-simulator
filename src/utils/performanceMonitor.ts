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
  private frameInProgress = false // Флаг для отслеживания состояния

  /**
   * Начинает измерение времени кадра
   */
  startFrame(): void {
    if (this.frameInProgress) {
      console.warn('Повторный вызов startFrame() без endFrame()')
      return
    }
    this.frameStartTime = performance.now()
    this.frameInProgress = true
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
    if (!this.frameInProgress) {
      console.warn('Вызов endFrame() без startFrame()')
      return this.getLastValidStats(objectCount, interactionCount)
    }
    
    const frameTime = performance.now() - this.frameStartTime
    this.frameInProgress = false
    
    // Защита от некорректных значений
    if (frameTime <= 0 || frameTime > 1000) {
      console.warn(`Некорректное время кадра: ${frameTime}ms, startTime: ${this.frameStartTime}, now: ${performance.now()}`)
      return this.getLastValidStats(objectCount, interactionCount)
    }
    
    // Отладочная информация для очень маленьких времен
    if (frameTime < 0.1) {
      console.warn(`Очень маленькое время кадра: ${frameTime}ms`)
    }
    
    // Добавляем время кадра в историю
    this.frameHistory.push(frameTime)
    if (this.frameHistory.length > this.maxHistorySize) {
      this.frameHistory.shift()
    }

    // Вычисляем средний FPS
    const avgFrameTime = this.frameHistory.reduce((sum, time) => sum + time, 0) / this.frameHistory.length
    let fps = avgFrameTime > 0 ? 1000 / avgFrameTime : 60
    
    // Ограничиваем FPS разумными пределами
    fps = Math.max(1, Math.min(240, fps))

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
   * Возвращает последнюю корректную статистику
   */
  private getLastValidStats(objectCount: number, interactionCount: number): PerformanceStats {
    const avgStats = this.getAverageStats()
    return {
      frameTime: avgStats.avgFrameTime,
      physicsTime: this.physicsTime,
      renderTime: this.renderTime,
      objectCount,
      interactionCount,
      fps: avgStats.avgFps
    }
  }

  /**
   * Получает среднюю статистику за последние кадры
   */
  getAverageStats(): { avgFrameTime: number; avgFps: number } {
    if (this.frameHistory.length === 0) {
      return { avgFrameTime: 16.67, avgFps: 60 } // По умолчанию 60 FPS
    }

    // Фильтруем некорректные значения
    const validFrameTimes = this.frameHistory.filter(time => time > 0 && time <= 1000)
    
    if (validFrameTimes.length === 0) {
      return { avgFrameTime: 16.67, avgFps: 60 }
    }

    const avgFrameTime = validFrameTimes.reduce((sum, time) => sum + time, 0) / validFrameTimes.length
    let avgFps = avgFrameTime > 0 ? 1000 / avgFrameTime : 60
    
    // Ограничиваем FPS разумными пределами
    avgFps = Math.max(1, Math.min(240, avgFps))

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
