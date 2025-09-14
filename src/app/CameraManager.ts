import { Container } from 'pixi.js'

export interface CameraChangeCallback {
  (): void
}

/**
 * Класс для управления камерой и зумом в приложении
 */
export class CameraManager {
  private zoom = 1
  private cameraX = 0
  private cameraY = 0
  private stage: Container
  private onChangeCallback?: CameraChangeCallback

  constructor(stage: Container, onChangeCallback?: CameraChangeCallback) {
    this.stage = stage
    this.onChangeCallback = onChangeCallback
  }

  /**
   * Устанавливает уровень зума
   * @param zoom Уровень зума (от 0.1 до 10)
   */
  setZoom(zoom: number): void {
    this.zoom = Math.max(0.1, Math.min(10, zoom)) // Ограничиваем zoom от 0.1 до 10
    this.applyCameraTransform()
    this.onChangeCallback?.()
  }

  /**
   * Устанавливает позицию камеры
   * @param x Координата X
   * @param y Координата Y
   */
  setCamera(x: number, y: number): void {
    this.cameraX = x
    this.cameraY = y
    this.applyCameraTransform()
    this.onChangeCallback?.()
  }

  /**
   * Перемещает камеру на указанное смещение
   * @param deltaX Смещение по X
   * @param deltaY Смещение по Y
   */
  moveCamera(deltaX: number, deltaY: number): void {
    this.cameraX += deltaX
    this.cameraY += deltaY
    this.applyCameraTransform()
    this.onChangeCallback?.()
  }

  /**
   * Возвращает текущий уровень зума
   */
  getZoom(): number {
    return this.zoom
  }

  /**
   * Возвращает текущую позицию камеры
   */
  getCamera(): { x: number; y: number } {
    return { x: this.cameraX, y: this.cameraY }
  }

  /**
   * Применяет трансформацию камеры к сцене
   */
  private applyCameraTransform(): void {
    this.stage.scale.set(this.zoom)
    this.stage.position.set(
      -this.cameraX * this.zoom,
      -this.cameraY * this.zoom,
    )
  }
}
