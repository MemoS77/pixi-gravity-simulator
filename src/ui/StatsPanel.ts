import { PlanetInfo } from '../types'
import { QualityLevel } from '../physics'

export interface StatsData {
  planets: PlanetInfo[]
  zoom: number
  camera: { x: number; y: number }
  fps?: number
  qualityLevel?: QualityLevel
}

export class StatsPanel {
  private container: HTMLDivElement
  private objectCountElement: HTMLSpanElement
  private maxMassElement: HTMLSpanElement
  private zoomElement: HTMLSpanElement
  private cameraElement: HTMLSpanElement
  private fpsElement: HTMLSpanElement
  private qualityElement: HTMLSpanElement

  constructor() {
    this.container = this.createContainer()
    this.fpsElement = this.createStatElement('FPS:', '60')
    this.qualityElement = this.createStatElement('Качество:', 'HIGH')
    this.objectCountElement = this.createStatElement('Объекты:', '0')
    this.maxMassElement = this.createStatElement('Макс. масса:', '0')
    this.zoomElement = this.createStatElement('Зум:', '1.00x')
    this.cameraElement = this.createStatElement('Камера:', '(0, 0)')

    this.setupLayout()
    document.body.appendChild(this.container)
  }

  private createContainer(): HTMLDivElement {
    const container = document.createElement('div')
    container.className = `
      fixed bottom-4 right-4 
      bg-black/50
      text-white text-sm 
      p-4 rounded-lg 
      border border-gray-600
      shadow-lg
      font-mono
      min-w-52      
      z-50
      pointer-events-none
    `
      .replace(/\s+/g, ' ')
      .trim()

    return container
  }

  private createStatElement(
    label: string,
    initialValue: string,
  ): HTMLSpanElement {
    const statDiv = document.createElement('div')
    statDiv.className = 'flex justify-between items-center mb-1'

    const labelSpan = document.createElement('span')
    labelSpan.textContent = label
    labelSpan.className = 'text-gray-300'

    const valueSpan = document.createElement('span')
    valueSpan.textContent = initialValue
    valueSpan.className = 'text-white font-semibold ml-2'

    statDiv.appendChild(labelSpan)
    statDiv.appendChild(valueSpan)
    this.container.appendChild(statDiv)

    return valueSpan
  }

  private setupLayout(): void {
    const title = document.createElement('div')
    title.textContent = 'Статистика'
    title.className =
      'text-center text-gray-200 font-bold mb-3 pb-2 border-b border-gray-600'
    this.container.insertBefore(title, this.container.firstChild)
  }

  public updateStats(data: StatsData): void {
    // FPS
    if (data.fps !== undefined) {
      this.fpsElement.textContent = data.fps.toFixed(1)
      // Меняем цвет в зависимости от FPS
      if (data.fps >= 50) {
        this.fpsElement.className = 'text-green-400 font-semibold ml-2'
      } else if (data.fps >= 30) {
        this.fpsElement.className = 'text-yellow-400 font-semibold ml-2'
      } else {
        this.fpsElement.className = 'text-red-400 font-semibold ml-2'
      }
    }

    // Уровень качества
    if (data.qualityLevel !== undefined) {
      this.qualityElement.textContent = this.formatQualityLevel(data.qualityLevel)
      // Меняем цвет в зависимости от уровня качества
      switch (data.qualityLevel) {
        case QualityLevel.LOW:
          this.qualityElement.className = 'text-red-400 font-semibold ml-2'
          break
        case QualityLevel.MEDIUM:
          this.qualityElement.className = 'text-yellow-400 font-semibold ml-2'
          break
        case QualityLevel.HIGH:
          this.qualityElement.className = 'text-green-400 font-semibold ml-2'
          break
        case QualityLevel.ULTRA:
          this.qualityElement.className = 'text-blue-400 font-semibold ml-2'
          break
        default:
          this.qualityElement.className = 'text-white font-semibold ml-2'
      }
    }

    // Количество объектов
    this.objectCountElement.textContent = data.planets.length.toString()

    // Наибольшая масса
    const maxMass =
      data.planets.length > 0 ? Math.max(...data.planets.map((p) => p.mass)) : 0
    this.maxMassElement.textContent = this.formatMass(maxMass)

    // Текущий зум
    this.zoomElement.textContent = `${data.zoom.toFixed(2)}x`

    // Координаты камеры
    const x = Math.round(data.camera.x)
    const y = Math.round(data.camera.y)
    this.cameraElement.textContent = `(${x}, ${y})`
  }

  private formatMass(mass: number): string {
    if (mass === 0) return '0'

    if (mass >= 1000000) {
      return `${(mass / 1000000).toFixed(1)}M`
    } else if (mass >= 1000) {
      return `${(mass / 1000).toFixed(1)}K`
    } else {
      return mass.toFixed(0)
    }
  }

  private formatQualityLevel(quality: QualityLevel): string {
    switch (quality) {
      case QualityLevel.LOW:
        return 'НИЗКОЕ'
      case QualityLevel.MEDIUM:
        return 'СРЕДНЕЕ'
      case QualityLevel.HIGH:
        return 'ВЫСОКОЕ'
      case QualityLevel.ULTRA:
        return 'УЛЬТРА'
      default:
        return String(quality).toUpperCase()
    }
  }

  public show(): void {
    this.container.style.display = 'block'
  }

  public hide(): void {
    this.container.style.display = 'none'
  }

  public toggle(): void {
    if (this.container.style.display === 'none') {
      this.show()
    } else {
      this.hide()
    }
  }

  public destroy(): void {
    if (this.container.parentNode) {
      this.container.parentNode.removeChild(this.container)
    }
  }
}
